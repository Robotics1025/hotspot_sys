import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        // Find admin by username or email
        const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.username, username),
        });

        if (!admin) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            admin: { id: admin.id, username: admin.username, email: admin.email },
        });
    } catch (error) {
        console.error("Admin auth error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
