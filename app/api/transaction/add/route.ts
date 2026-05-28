import { NextResponse } from "next/server";
import { addTransaction } from "../../../../db/queries"


export async function POST(req:Request) {
    
    const { description , type, amount, category, date, user_id, balance } = await req.json()

    const newTrans = await addTransaction({description, type, amount, category, date, user_id, balance})

    if(!newTrans){
        return NextResponse.json({ message: "error"}, { status: 500})
    }
    
    return NextResponse.json({ message: "created", transaction: newTrans}, { status: 201});
    
}