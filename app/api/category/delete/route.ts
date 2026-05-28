import { NextResponse } from "next/server";
import { deleteCategory } from "../../../../db/queries";


const DELETE = async (req: Request) => {

    const category = await req.json();


    const deletedCategory = await deleteCategory(category);

    if(!deletedCategory) return NextResponse.json({ message:" category not found"}, { status: 404});

    return NextResponse.json({ message:"deleted category", category: deleteCategory}, { status: 201});

};