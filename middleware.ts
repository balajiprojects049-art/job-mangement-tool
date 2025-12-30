import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // 1. Get the path
    const path = request.nextUrl.pathname;

    // 2. Define protected routes
    const isProtectedRoute = path.startsWith("/dashboard");

    // 3. Get the NextAuth session cookie
    const nextAuthSession = request.cookies.get("next-auth.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value;

    // Also check for old session for backwards compatibility
    const oldSession = request.cookies.get("user_session")?.value;

    // 4. Redirect Logic - allow if either session exists
    if (isProtectedRoute && !nextAuthSession && !oldSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
