import { users, transactions, categories, balance_histories } from "./schema";
import { db } from "./index";
import { desc, eq, and, gt, lt } from "drizzle-orm";


export const addUser = async (user: User) => {
    const newUser = await db.insert(users).values(user).returning();
    return newUser;
};

export const findUserByEmail = async (email: string) => {
    const foundUser = await db.select().from(users).where(eq(users.email, email));
    return foundUser;
};

export const findUserById = async (id: string) => {
    const foundUser = await db.select().from(users).where(eq(users.id, id));
    return foundUser;
};

export const addTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
    
    if(!transaction.amount || !transaction.date || !transaction.description || !transaction.user_id || !transaction.type) return null;

    const latestTrans = await db.select()
    .from(transactions)
    .where(eq(transactions.user_id, transaction.user_id))
    .orderBy(desc(transactions.date))
    .limit(1);

    const previousTrans = await db.select()
    .from(transactions)
    .where(and(eq(transactions.user_id, transaction.user_id), lt(transactions.date, transaction.date)))
    .orderBy(desc(transactions.date))
    .limit(1)

    if(!latestTrans[0] || !previousTrans[0]){
        if(!transaction.balance) return null;
        const newTrans = (await db.insert(transactions).values(transaction).returning())[0];
        await addBalanceToHistory({
             date: newTrans.date, 
             balance: newTrans.balance!, 
             transaction_id: newTrans.id, 
             user_id: newTrans.user_id!
            });
        return newTrans as Transaction;
    }

    if( latestTrans[0].date <= transaction.date){
        if(transaction.type === "expense" ) {
            const newTrans = (await db.insert(transactions).values({ ...transaction, balance: latestTrans[0].balance! - transaction.amount }).returning())[0];
            const newBalance = {
            date: transaction.date,
            user_id: transaction.user_id,
            transaction_id: newTrans.id,
            balance: latestTrans[0].balance! - transaction.amount
            }
            await addBalanceToHistory(newBalance);
            return newTrans as Transaction;
        }
        else if( transaction.type === "income") {
            const newTrans = (await db.insert(transactions).values({ ...transaction, balance: latestTrans[0].balance! + transaction.amount }).returning())[0];
            const newBalance = {
            date: transaction.date,
            user_id: transaction.user_id,
            transaction_id: newTrans.id,
            balance: latestTrans[0].balance! + transaction.amount
            };
            await addBalanceToHistory(newBalance);
            return newTrans as Transaction;
        }
    } else if (latestTrans[0].date > transaction.date){
        if(transaction.type === "expense"){
            const newTrans = (await db.insert(transactions).values({ ...transaction, balance: previousTrans[0].balance! - transaction.amount}).returning())[0];
            const transAfters = await db.select()
            .from(transactions)
            .where(and(eq(transactions.user_id, transaction.user_id), gt(transactions.date, transaction.date)))
            .orderBy(transactions.date);

            const balanceAfters = await db.select()
            .from(balance_histories)
            .where(and(eq(balance_histories.user_id, transaction.user_id), gt(balance_histories.date, transaction.date)));

               
            for (const tran of transAfters){
                const newBalance = tran.balance! - transaction.amount;
                await db.update(transactions)
                .set({ balance: newBalance})
                .where(eq(transactions.id, tran.id))
            };

            for (const blnc of balanceAfters){
                const newBalance = blnc.balance - transaction.amount;
                await db.update(balance_histories)
                .set({ balance: newBalance})
                .where(
                    and(
                        eq(balance_histories.transaction_id, blnc.transaction_id!), 
                        eq(balance_histories.user_id, blnc.user_id!)
                    )
                );
            };
            return newTrans as Transaction;
        }
        else if(transaction.type === "income"){
            const newTrans = (await db.insert(transactions).values({ ...transaction, balance: previousTrans[0].balance! + transaction.amount}).returning())[0];
            const transAfters = await db.select()
            .from(transactions)
            .where(and(eq(transactions.user_id, transaction.user_id), gt(transactions.date, transaction.date)))
            .orderBy(transactions.date);

            const balanceAfters = await db.select()
            .from(balance_histories)
            .where(and(eq(balance_histories.user_id, transaction.user_id), gt(balance_histories.date, transaction.date)));

            
            for (const tran of transAfters){
                const newBalance = tran.balance! + transaction.amount
                await db.update(transactions)
                .set({ balance: newBalance})
                .where(eq(transactions.id, tran.id))
            };

               
            for (const blnc of balanceAfters){
                const newBalance = blnc.balance + transaction.amount
                await db.update(balance_histories)
                .set({ balance: newBalance})
                .where(
                    and(
                        eq(balance_histories.transaction_id, blnc.transaction_id!), 
                        eq(balance_histories.user_id, blnc.user_id!)
                    )
                );
            };
        };
    };
    return null;
};

// subtract the new amount from the previous one

export const updateTransaction = async (tran: Transaction) => {
  // Step 1: Get the old transaction
  const oldTx = await db.select().from(transactions).where(eq(transactions.id, tran.id!)).limit(1);
  if (!oldTx[0]) return null;

  
    const previousTrans = await db.select()
    .from(transactions)
    .where(and(eq(transactions.user_id, tran.user_id), lt(transactions.date, tran.date)))
    .orderBy(desc(transactions.date))
    .limit(1)

  // Step 2: Update the transaction row itself
  const updatedTransaction = await db.update(transactions).
  set({
     ...tran, 
     balance: tran.type === "income" 
    ? 
    previousTrans[0].balance! + tran.amount 
    : 
    previousTrans[0].balance! - tran.amount

    })
  .where(eq(transactions.id, tran.id!))
  .returning();

  // Step 3: Calculate delta if type/amount changed
  let delta = 0;
  if (tran.amount !== oldTx[0].amount || tran.type !== oldTx[0].type) {
    const oldEffect = oldTx[0].type === "income" ? oldTx[0].amount : -oldTx[0].amount;
    const newEffect = tran.type === "income" ? tran.amount : -tran.amount;
    delta = newEffect - oldEffect;

    // Step 4: Shift balances after this transaction’s date
    await shiftBalances(tran.user_id, oldTx[0].date, delta);
    await deleteBalance(tran.id!)
  }

  return updatedTransaction;
};


export const shiftBalances = async (userId: string, date: Date, delta: number) => {
  const transAfters = await db.select()
    .from(transactions)
    .where(and(eq(transactions.user_id, userId), gt(transactions.date, date)))
    .orderBy(transactions.date);

  for (const tran of transAfters) {
    const newBalance = tran.balance! + delta;
    await db.update(transactions).set({ balance: newBalance }).where(eq(transactions.id, tran.id));
  }

  const balanceAfters = await db.select()
    .from(balance_histories)
    .where(and(eq(balance_histories.user_id, userId), gt(balance_histories.date, date)));

  for (const blnc of balanceAfters) {
    const newBalance = blnc.balance + delta;
    await db.update(balance_histories).set({ balance: newBalance }).where(eq(balance_histories.transaction_id, blnc.transaction_id!));
  }
};


const deleteBalance = async (transId: string) => {
    const deletedBalance = await db.delete(balance_histories).where(eq(balance_histories.transaction_id, transId)).returning();
    if(!deletedBalance) console.log("Balance not found");
    return deletedBalance
}


export const removeTransaction = async (transId: string) => {
    try {
        const [tx] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transId))
            .limit(1);

        if (!tx) {
            console.log("Transaction not found with id:", transId);
            return null;
        }

        const effect = tx.type === "income" ? -tx.amount : tx.amount;

        // 1. Delete balance history entry for this transaction
        await db.delete(balance_histories)
            .where(eq(balance_histories.transaction_id, transId));

        // 2. Delete the transaction itself
        await db.delete(transactions)
            .where(eq(transactions.id, transId));

        // 3. Shift all later balances
        await shiftBalances(tx.user_id!, tx.date, effect);

        return tx;

    } catch (error) {
        console.error("Error in removeTransaction:", error);
        return null;
    }
};


export const addBalanceToHistory = async (item: BalanceHistory) => {
    const newItem = await db.insert(balance_histories).values(item).returning();
    return newItem;
}


export const addCategory = async (category: Category) => {

    const allCategories = await db.select().from(categories).where(eq(categories.user_id, category.user_id))

    const duplicateName = allCategories.some((cate) => cate.name === category.name )

    if(duplicateName){
        return {
            id: "duplicate naming",
            name: "duplicate naming",
            user_id: "duplicate naming"
        };
    }

    const newCategory = await db.insert(categories).values(category).returning();
    return newCategory[0];
}

export const updateCategory = async (category: Category) => {
    const allCategories = await db.select().from(categories).where(eq(categories.user_id, category.user_id))
    const foundCategory = allCategories.find((cate) => cate.id === category.id)
    if(!foundCategory) return null

    
    const duplicateName = allCategories.some((cate) => cate.name === category.name )

    if(duplicateName){
        return {
            id: "duplicate naming",
            name: "duplicate naming"
        };
    }

    const updatedCategory = await db.update(categories).set(category).where(eq(categories.id, category.id!)).returning()

    return updatedCategory[0]
}

export const deleteCategory = async (id: string) => {
    const foundCategory = await db.select().from(categories).where(eq(categories.id, id))
    if(!foundCategory[0]) return null
    const deletedCategory = await db.delete(categories).where(eq(categories.id, id)).returning()
    return deletedCategory[0]
}



