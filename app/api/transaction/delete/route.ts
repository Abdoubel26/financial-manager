import { NextResponse } from "next/server";
import { removeTransaction } from "../../../../db/queries"



export const DELETE = async (req: Request) => {

    try{
        const { transId } = await req.json()

        if (!transId) {
            return NextResponse.json({ message: "tranId is required" }, { status: 400 });
        }

        console.log("Attempting to delete transaction with ID:", transId);

        const deletedTransaction = await removeTransaction(transId)

        console.log("deleted Transaction: ", deletedTransaction)

        if(!deletedTransaction){
            return NextResponse.json({ message: "transaction not found"}, { status: 404})
        }

        return NextResponse.json({ message: "transaction deleted", transaction: deletedTransaction}, { status: 200})
    }
    catch(e){
        console.log("Error: " + e)
        return NextResponse.json({ message: "Server Error" }, { status: 500})
    }

}