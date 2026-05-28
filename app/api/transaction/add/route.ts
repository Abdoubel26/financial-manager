import { NextResponse } from "next/server";
import { addTransaction } from "../../../../db/queries";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const transactionData = {
            description: body.description,
            type: body.type,
            amount: Number(body.amount),
            category: body.category || null,
            user_id: body.user_id,
            date: body.date ? new Date(body.date) : new Date(),
            balance: body.balance | 0
        };

        const newTrans = await addTransaction(transactionData);

        if (!newTrans) {
            return NextResponse.json({ 
                message: "addTransaction returned null - validation failed or logic error" 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            message: "Success", 
            transaction: newTrans 
        }, { status: 201 });

    } catch (error: any) {
        console.error("Full Error:", error);
        return NextResponse.json({ 
            message: "Server Error", 
            error: error.message 
        }, { status: 500 });
    }
}