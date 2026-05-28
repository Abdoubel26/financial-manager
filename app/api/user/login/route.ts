import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../../../../db/queries";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const { email, password } = await req.json();

    const foundUser = await findUserByEmail(email);
    if(!foundUser){
        return NextResponse.json({ message: "email not registered"}, { status: 404});
    };

    const isMatch = bcrypt.compare(password, foundUser[0].password);

    if(!isMatch) return NextResponse.json({ message: "wrong credentials"}, { status: 401 });

    const token = jwt.sign({ userId: foundUser[0].id}, process.env.JWT_SECRET!, { expiresIn: "7d"})

    const response = NextResponse.json({ message: "Logged In"}, { status: 200 })

    response.cookies.set("token", token, {
        httpOnly: true, 
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
    })

    return response;
};