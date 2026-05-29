import { NextRequest, NextResponse } from "next/server";




export function proxy(req: NextRequest) {

    const token = req.cookies.get("token")
    const { pathname } = req.nextUrl

    if(!token && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if(token && pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if(token && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()

}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/analytics/:path*"]
}