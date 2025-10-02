import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt-edge";
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log("🔍 Middleware triggered for:", path);

  // Completely bypass middleware for signin and signup pages
  if (path === "/signin" || path === "/signup") {
    console.log("✅ Allowing public auth page:", path);
    return NextResponse.next();
  }
  
  // Allow auth API routes
  if (path === "/api/signin" || path === "/api/signup") {
    console.log("✅ Allowing auth API route:", path);
    return NextResponse.next();
  }

  // Get and verify token
  const token = request.cookies.get("token")?.value;
  console.log("🔑 Token present:", !!token);
  
  const decoded = token ? verifyToken(token) : null;
  const isAuthenticated = decoded && decoded.userId;
  console.log("🔐 Authenticated:", isAuthenticated);

  // Protected API routes: return 401 JSON for unauthenticated requests
  if (path.startsWith("/api")) {
    if (!isAuthenticated) {
      console.log("❌ Blocked API route (no auth):", path);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log("✅ Allowing authenticated API route:", path);
    return NextResponse.next();
  }

  // Dashboard pages: redirect to sign-in if unauthenticated
  if (path.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      console.log("🔄 Redirecting to signin from:", path);
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirectTo", path);
      return NextResponse.redirect(url);
    }
    console.log("✅ Allowing authenticated dashboard access:", path);
    return NextResponse.next();
  }

  // Default: allow
  console.log("✅ Allowing by default:", path);
  return NextResponse.next();
}

export const config = {
  // Be very specific about what middleware should run on
  matcher: [
    "/dashboard/:path*", 
    "/api/:path*",
    "/signin",
    "/signup"
  ],
};