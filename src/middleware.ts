import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-production"
);

const COOKIE_NAME = "fastnet_token";

// Routes that are always public
const PUBLIC_PATHS = [
    "/admin/login",
    "/client/login",
    "/login",
    "/portal",
    "/api/auth",
];

function isPublic(pathname: string): boolean {
    return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only enforce auth on /admin and /client dashboard routes
    const isAdminRoute = pathname.startsWith("/admin");
    const isClientRoute = pathname.startsWith("/client") && !pathname.startsWith("/client/login");
    const isProtectedApi = pathname.startsWith("/api/admin");

    if (!isAdminRoute && !isClientRoute && !isProtectedApi) {
        return NextResponse.next();
    }

    // Allow public login pages
    if (isPublic(pathname)) {
        return NextResponse.next();
    }

    // Verify JWT from cookie
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        // Redirect to appropriate login
        if (isAdminRoute || isProtectedApi) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
        return NextResponse.redirect(new URL("/client/login", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const role = payload.role as string;

        // Super admin can access /admin routes
        if (isAdminRoute && role !== "super_admin") {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        // Protected API routes require super_admin
        if (isProtectedApi && role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Client admins can only access /client routes
        if (isClientRoute && role !== "client_admin" && role !== "super_admin") {
            return NextResponse.redirect(new URL("/client/login", req.url));
        }

        return NextResponse.next();
    } catch {
        // Token invalid/expired — redirect to login
        if (isAdminRoute || isProtectedApi) {
            const res = NextResponse.redirect(new URL("/admin/login", req.url));
            res.cookies.delete(COOKIE_NAME);
            return res;
        }
        const res = NextResponse.redirect(new URL("/client/login", req.url));
        res.cookies.delete(COOKIE_NAME);
        return res;
    }
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/client/:path*",
        "/api/admin/:path*",
    ],
};
