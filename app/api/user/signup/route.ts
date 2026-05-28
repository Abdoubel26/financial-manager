import { addUser, findUserByEmail } from "../../../../db/queries";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";


export async function POST(req: Request){
    const  { email, name, password, image } = await req.json();

    const isEmailRegistered = await findUserByEmail(email);

    if(isEmailRegistered[0]){
        return NextResponse.json({ message: "email already registered"}, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { email, name, image, password: hashedPassword};
    const SavedUser = await addUser(user);
    const token = jwt.sign({userId: SavedUser[0].id}, process.env.JWT_SECRET!, {expiresIn: "7d"});

    const response = NextResponse.json({ message: "Signed in"}, {status: 201});

    response.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
    });

    return response;
};
