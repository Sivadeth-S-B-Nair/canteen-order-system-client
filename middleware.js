import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES=["/login","/register"]
const USER_ROUTES=["/user"]
const KITCHEN_ROUTES=["/kitchen"]

export async function middleware(request){
  const {pathname}=request.nextUrl
  const refreshToken=request.cookies.get("refreshToken")?.value

  const isAuthRoute=AUTH_ROUTES.some(route=>pathname.startsWith(route))
  const isUserRoute=USER_ROUTES.some(route=>pathname.startsWith(route))
  const isKitchenRoute=KITCHEN_ROUTES.some(route=>pathname.startsWith(route))

  if(!refreshToken && (isKitchenRoute || isUserRoute) ){
    return NextResponse.redirect(new URL("/login",request.url))
  }
  
  let decoded=null
  if(refreshToken){
    try{
      const secret=new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
      const {payload}=await jwtVerify(refreshToken,secret)
      decoded=payload
    }
    catch(err){
      console.error("JWT VERIFY FAILED:", err.message)  
      const response=NextResponse.redirect(new URL("/login",request.url))
      response.cookies.delete("refreshToken")
      return response
    }
  }

  if(decoded){
    const role=decoded.role
    if(isAuthRoute){
      if(role==="kitchen"){
        return NextResponse.redirect(new URL("/kitchen/dashboard",request.url))
      }
      else{
        return NextResponse.redirect(new URL("/user/menu",request.url))
      }
    }

    if(isKitchenRoute && role!=="kitchen"){
      return NextResponse.redirect(new URL("/user/menu",request.url))
    }

    if(isUserRoute && role!=="user"){
      return NextResponse.redirect(new URL("/kitchen/dashboard",request.url))
    }
  }
  return NextResponse.next()
}

export const config={
  matcher:[
    "/user/:path*",
    "/kitchen/:path*",
    "/login", 
    "/register"
  ]
}