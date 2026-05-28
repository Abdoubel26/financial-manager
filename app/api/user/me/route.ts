import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "../../../../db/queries"
import jwt from "jsonwebtoken"

const GET = async (req: NextRequest) => {
    
    const token =  req.cookies.get("token")?.value

    if(!token){
        return NextResponse.json({ message: "missing required cookie"}, { status: 401})
    }

    try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
         const { userId } = decoded 
         const foundUser = (await findUserById(userId))[0]

         const {email, id, name, image} = foundUser

         return NextResponse.json({ message:"user fetched", user: { email, id, name, image} })
    } 
    catch(e: unknown){
        e instanceof Error ? console.log(e.message) : console.log(e)
        return NextResponse.json({ message: "jwt Error"}, { status: 401})
    }   
   
}