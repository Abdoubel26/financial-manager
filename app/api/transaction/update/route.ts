import { NextResponse } from "next/server";
import { updateTransaction } from "../../../../db/queries"


export const UPDATE = async (req: Request) => {

    const transaction = await req.json()

    const updatedTransaction = await updateTransaction(transaction)

    if(!updatedTransaction){
        return NextResponse.json({ message: "transaction not found"}, { status: 404})
    }

    return NextResponse.json({ message: "Transaction updated", transaction: updateTransaction}, { status: 200})

}
