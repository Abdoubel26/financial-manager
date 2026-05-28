import { NextResponse } from "next/server";
import { addCategory } from "../../../../db/queries";
import { categories } from "@/db/schema";


export const POST = async (req: Request) => {

    try {
    const { name } = await req.json();

    if(!name){
        return NextResponse.json({ message: "name missing"}, { status: 400});
    }

    const addedCategory = await addCategory({ name });

    if(addedCategory.name === "duplicate naming" && addedCategory.id === "duplicate naming"){
        return NextResponse.json({ message: "category with name already exists"}, {status: 400})
    }

    return NextResponse.json({ message: "category created", category: addedCategory}, { status: 201});

    }
    catch(e) {
        console.log(e)
        return NextResponse.json({ message: "Server Error" }, { status: 500});
    }

};

