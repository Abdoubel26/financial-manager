import { users, transactions, categories, balance_histories } from "./schema";
import { db } from "./index";
import { desc, eq, and, gt } from "drizzle-orm";


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

export const addTransaction = async (transaction: Transaction) => {

    const latestTrans = await db.select()
    .from(transactions)
    .where(eq(transactions.user_id, transaction.user_id))
    .orderBy(desc(transactions.date))
    .limit(1);

    if(!latestTrans[0]){
        const newTrans = (await db.insert(transactions).values(transaction).returning())[0];
        await addBalanceToHistory({ date: newTrans.date, balance: newTrans.balance, transaction_id: newTrans.id, user_id: newTrans.user_id!});
        return;
    }

    if( latestTrans[0].date <= transaction.date){
       
        const newTrans = (await db.insert(transactions).values(transaction).returning())[0];
        if(transaction.type === "expense" && latestTrans[0].date <= transaction.date ) {
            const newBalance = {
            date: transaction.date,
            user_id: transaction.user_id,
            transaction_id: newTrans.id,
            balance: latestTrans[0].balance - transaction.amount
            }
            await addBalanceToHistory(newBalance);
        }
        else if( transaction.type === "income" && latestTrans[0].date <= transaction.date) {
            const newBalance = {
            date: transaction.date,
            user_id: transaction.user_id,
            transaction_id: newTrans.id,
            balance: latestTrans[0].balance + transaction.amount
            };
            await addBalanceToHistory(newBalance);
        }
        return newTrans;
    } else if (latestTrans[0].date > transaction.date){
        if(transaction.type === "expense"){

            const transAfters = await db.select()
            .from(transactions)
            .where(and(eq(transactions.user_id, transaction.user_id), gt(transactions.date, transaction.date)))
            .orderBy(transactions.date)

            const balanceAfters = await db.select()
            .from(balance_histories)
            .where(and(eq(balance_histories.user_id, transaction.user_id), gt(balance_histories.date, transaction.date)))

               
            for (const tran of transAfters){
                const newBalance = tran.balance - transaction.amount
                await db.update(transactions)
                .set({ balance: newBalance})
                .where(eq(transactions.id, tran.id))
            }

            for (const blnc of balanceAfters){
                const newBalance = blnc.balance - transaction.amount
                await db.update(balance_histories)
                .set({ balance: newBalance})
                .where(
                    and(
                        eq(balance_histories.transaction_id, blnc.transaction_id!), 
                        eq(balance_histories.user_id, blnc.user_id!)
                    )
                )
            }

        }
        else if(transaction.type === "income"){
             const transAfters = await db.select()
            .from(transactions)
            .where(and(eq(transactions.user_id, transaction.user_id), gt(transactions.date, transaction.date)))
            .orderBy(transactions.date)

            const balanceAfters = await db.select()
            .from(balance_histories)
            .where(and(eq(balance_histories.user_id, transaction.user_id), gt(balance_histories.date, transaction.date)))

            
            for (const tran of transAfters){
                const newBalance = tran.balance + transaction.amount
                await db.update(transactions)
                .set({ balance: newBalance})
                .where(eq(transactions.id, tran.id))
            }

               
            for (const blnc of balanceAfters){
                const newBalance = blnc.balance + transaction.amount
                await db.update(balance_histories)
                .set({ balance: newBalance})
                .where(
                    and(
                        eq(balance_histories.transaction_id, blnc.transaction_id!), 
                        eq(balance_histories.user_id, blnc.user_id!)
                    )
                )
            }
        }
    }
}

export const updateTransaction = async (tran: Transaction) => {
  // Step 1: Get the old transaction
  const oldTx = await db.select().from(transactions).where(eq(transactions.id, tran.id!)).limit(1);
  if (!oldTx[0]) return null;

  // Step 2: Update the transaction row itself
  const updatedTransaction = await db.update(transactions).set(tran).where(eq(transactions.id, tran.id!)).returning();

  // Step 3: Calculate delta if type/amount changed
  let delta = 0;
  if (tran.amount !== oldTx[0].amount || tran.type !== oldTx[0].type) {
    const oldEffect = oldTx[0].type === "income" ? oldTx[0].amount : -oldTx[0].amount;
    const newEffect = tran.type === "income" ? tran.amount : -tran.amount;
    delta = newEffect - oldEffect;

    // Step 4: Shift balances after this transaction’s date
    await shiftBalances(tran.user_id, oldTx[0].date, delta);
  }

  return updatedTransaction;
};


export const shiftBalances = async (userId: string, date: Date, delta: number) => {
  const transAfters = await db.select()
    .from(transactions)
    .where(and(eq(transactions.user_id, userId), gt(transactions.date, date)))
    .orderBy(transactions.date);

  for (const tran of transAfters) {
    const newBalance = tran.balance + delta;
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


export const removeTransaction = async (transId: string) => {
  const tx = await db.select().from(transactions).where(eq(transactions.id, transId)).limit(1);
  if (!tx[0]) return null;

  // Compute effect to reverse
  const effect = tx[0].type === "income" ? -tx[0].amount : tx[0].amount;

  //  Delete transaction
  await db.delete(transactions).where(eq(transactions.id, transId));

  // Shift balances after this date
  await shiftBalances(tx[0].user_id!, tx[0].date, effect);

  return tx[0];
};



export const addBalanceToHistory = async (item: BalanceHistory) => {
    const newItem = await db.insert(balance_histories).values(item).returning();
    return newItem;
}

export const addCategory = async (category: Category) => {
    const newCategory = await db.insert(categories).values(category).returning();
    return newCategory;
}

export const updateCategory = async (category: Category) => {
    const foundCategory = await db.select().from(categories).where(eq(categories.id, category.id!))
    if(!foundCategory) return null

    const updatedCategory = await db.update(categories).set(category).where(eq(categories.id, category.id!))
    return updatedCategory
}

export const deleteCategory = async (category: Category) => {
    const foundCategory = await db.select().from(categories).where(eq(categories.id, category.id!))
    if(!foundCategory) return null
    const deletedCategroy = await db.delete(categories).where(eq(categories.id, category.id!))
    return deleteCategory
}