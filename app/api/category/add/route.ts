import { NextResponse } from "next/server";
import { addCategory } from "../../../../db/queries";


export const POST = async (req: Request) => {

    const category = await req.json();

    const addedCategory = await addCategory(category);

    return NextResponse.json({ message: "category created", category: addedCategory}, { status: 201});
};

