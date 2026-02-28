import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { hash, compare } from "bcryptjs";

export async function GET() {
    try {
        const session = await getSessionFromCookies();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                createdAt: users.createdAt,
                lastLoginAt: users.lastLoginAt,
                notifEmail: users.notifEmail,
                notifSystem: users.notifSystem,
                notifOnboarding: users.notifOnboarding,
            })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Settings GET error:", error);
        return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, email, currentPassword, newPassword, notifEmail, notifSystem, notifOnboarding } = body;

        const updates: Record<string, unknown> = {};

        if (name?.trim()) updates.name = name.trim();
        if (email?.trim()) updates.email = email.trim().toLowerCase();
        if (typeof notifEmail === "boolean") updates.notifEmail = notifEmail;
        if (typeof notifSystem === "boolean") updates.notifSystem = notifSystem;
        if (typeof notifOnboarding === "boolean") updates.notifOnboarding = notifOnboarding;

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Current password is required" }, { status: 400 });
            }
            const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
            const match = await compare(currentPassword, user.passwordHash);
            if (!match) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }
            updates.passwordHash = await hash(newPassword, 10);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        await db.update(users).set(updates).where(eq(users.id, session.userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings PUT error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
