import { NextResponse } from "next/server";
import { deleteCategory } from "../../../../db/queries";


export const DELETE = async (req: Request) => {

    try {
        const { id } = await req.json();

        if(!id){
            return NextResponse.json({ message: "missing required fields"}, { status: 400});
        }

        const deletedCategory = await deleteCategory(id);
        
        if(!deletedCategory) return NextResponse.json({ message:"category not found"}, { status: 400});

        return NextResponse.json({ message: "category deleted", category: deleteCategory}, { status: 200});
    }
    catch(e) {
        console.log(e)
        return NextResponse.json({ message: "Server Error"}, { status: 500})
    }
};