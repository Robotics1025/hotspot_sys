import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken, buildSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Look up user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase().trim()))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: "Account is disabled. Contact support." },
                { status: 403 }
            );
        }

        // Verify password
        const passwordMatch = await compare(password, user.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Update last login timestamp
        await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

        // Sign JWT
        const token = await signToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: user.clientId,
        });

        // Set HTTP-only cookie
        const cookie = buildSessionCookie(token);
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                clientId: user.clientId,
            },
        });

        response.cookies.set(cookie.name, cookie.value, {
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            path: cookie.path,
            maxAge: cookie.maxAge,
        });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
