import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-production"
);

const COOKIE_NAME = "fastnet_token";
const EXPIRES_IN = "8h";

export interface JWTPayload {
    userId: number;
    email: string;
    name: string;
    role: "super_admin" | "client_admin";
    clientId: number | null;
}

// Sign a JWT and return the token string
export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(EXPIRES_IN)
        .sign(SECRET);
}

// Verify a JWT string and return the payload
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

// Read & verify the token from the request cookie header
export async function getSessionFromCookies(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

// Helpers used in API routes to set/clear the cookie
export function buildSessionCookie(token: string) {
    return {
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours in seconds
    };
}

export function buildClearCookie() {
    return {
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
    };
}
