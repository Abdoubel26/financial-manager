import { NextResponse } from "next/server";
import { updateCategory } from "../../../../db/queries";


export const PUT = async (req: Request) => {

    const category = await req.json();

    const updatdCategory = await updateCategory(category);

    if(!updatdCategory) return NextResponse.json({ message: "category not found"}, { status: 404});

    return NextResponse.json({ message: "category updated"}, { status: 200});
};