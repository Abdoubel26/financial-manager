import { NextResponse } from "next/server";
import { updateTransaction } from "../../../../db/queries"


export async function PUT(req: Request)  {

    const {id, type, description, amount, category, date, user_id, balance} = await req.json()

    if(!id || !type || !description || !amount || !date || !user_id || !balance) return NextResponse.json({ message: "required fields missing"}, { status: 400})

    const transaction = {id, type, description, amount, category, user_id, balance, date: date ? new Date(date) : new Date()}

    console.log(transaction)

    try {
    const updatedTransaction = await updateTransaction(transaction)

    if(!updatedTransaction){
        return NextResponse.json({ message: "transaction not found"}, { status: 404})
    }
    return NextResponse.json({ message: "Transaction updated", transaction: updatedTransaction}, { status: 200})
    } catch(e: unknown){
        console.log(e)
        return NextResponse.json({ message: "Server Error"}, { status: 500})
    }
}
