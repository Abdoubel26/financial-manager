import { NextResponse } from "next/server";
import { removeTransaction } from "../../../../db/queries"



export const DELETE = async (req: Request) => {

    const transaction = await req.json()

    const deletedTransaction = await removeTransaction(transaction)
    

    if(!deletedTransaction){
        return NextResponse.json({ message: "transaction not found"}, { status: 404})
    }

    return NextResponse.json({ message: "transaction deleted", transaction: deletedTransaction}, { status: 204})

}