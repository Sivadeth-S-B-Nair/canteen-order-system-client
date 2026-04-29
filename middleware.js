import { NextResponse } from "next/server";

const PROTECTED_ROUTES=["/user","/kitchen"]
const AUTH_ROUTES=["/login","/register"]

export function middleware(request){
  const {pathname}=request.nextUrl
  const refreshToken=request.cookies.get("refreshToken")?.value

  const isProtected=PROTECTED_ROUTES.some(route=>pathname.startsWith(route))
  const isAuthRoute=AUTH_ROUTES.some(route=>pathname.startsWith(route))

  if(isProtected && !refreshToken){
    return NextResponse.redirect(new URL("/login",request.url))
  }
  
  // if(isAuthRoute && refreshToken){
  //   return NextResponse.redirect(new URL("/login",request.url))
  // }
  // return NextResponse.next()
}

export const config={
  matcher:[
    "/user/:path*",
    "/kitchen/:path*",
    "/login", 
    "/register"
  ]
}