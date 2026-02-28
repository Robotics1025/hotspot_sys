import { db } from "@/db";
import { clientUsers, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        // Find client user + join client name
        const result = await db.select({
            id: clientUsers.id,
            clientId: clientUsers.clientId,
            username: clientUsers.username,
            passwordHash: clientUsers.passwordHash,
            clientName: clients.name,
        })
            .from(clientUsers)
            .leftJoin(clients, eq(clientUsers.clientId, clients.id))
            .where(eq(clientUsers.username, username))
            .limit(1);

        const user = result[0];

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            client: {
                id: user.clientId,
                username: user.username,
                clientName: user.clientName,
            },
        });
    } catch (error) {
        console.error("Client auth error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
