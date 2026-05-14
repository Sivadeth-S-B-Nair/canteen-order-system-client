import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = ["/login", "/register"];
const SUPER_ROUTES = ["/super-admin"];
const ADMIN_ROUTES = ["/restaurant-admin"];
const KITCHEN_ROUTES = ["/kitchen"];
const USER_ROUTES = ["/user"];

const ROLE_HOME = {
  super_admin: "/super-admin/dashboard",
  restaurant_admin: "/restaurant-admin/dashboard",
  kitchen_staff: "/kitchen/orders",
  user: "/user/restaurants",
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isSuperRoute = SUPER_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isKitchenRoute = KITCHEN_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isUserRoute = USER_ROUTES.some((route) => pathname.startsWith(route));
  const isProtected =
    isSuperRoute || isAdminRoute || isKitchenRoute || isUserRoute;

  if (!refreshToken && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let decoded = null;
  if (refreshToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(refreshToken, secret);
      decoded = payload;
    } catch (err) {
      console.error("JWT VERIFY FAILED:", err.message);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  if (!decoded) return NextResponse.next();
  const role = decoded.role;
  const home=ROLE_HOME[role]
  if (isAuthRoute) {
    return NextResponse.redirect(new URL(home,request.url))
  }

  if(isSuperRoute && role!=="super_admin"){
    return NextResponse.redirect(new URL(home, request.url));
  }
  if(isAdminRoute && role!=="restaurant_admin"){
    return NextResponse.redirect(new URL(home, request.url));
  }
  if (isKitchenRoute && role !== "kitchen_staff") {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (isUserRoute && role !== "user") {
    return NextResponse.redirect(new URL(home, request.url));
  }
}

export const config = {
  matcher: ["/user/:path*", "/kitchen/:path*","/restaurant-admin/:path*","/super-admin/:path*", "/login", "/register"],
};
