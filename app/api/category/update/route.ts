import { NextResponse } from "next/server";
import { updateCategory } from "../../../../db/queries";


export const PUT = async (req: Request) => {

    try {

        const { id, name, user_id } = await req.json();

        if(!id || !name ){
            return NextResponse.json({ message: "missing required fields"}, { status: 400});
        }

        const updatedCategory = await updateCategory({ id, name, user_id});

        if(!updatedCategory) return NextResponse.json({ message: "category not found"}, { status: 404});

        if(updatedCategory.name === "duplicate naming" && updatedCategory.id === "duplicate naming"){
        return NextResponse.json({ message: "category with name already exists"}, {status: 400})
        };

        return NextResponse.json({ message: "category updated", category: updatedCategory}, { status: 200});

    } 
    catch(e){
        console.log(e)
        return NextResponse.json({ message: "Server Error"}, { status: 500});
    }
};