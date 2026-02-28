import { db } from "@/db";
import { clients, clientUsers } from "@/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const allClients = await db.query.clients.findMany({
            orderBy: (clients, { desc }) => [desc(clients.createdAt)],
        });
        return NextResponse.json(allClients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, payoutPhoneNumber } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Insert client
        const [newClient] = await db.insert(clients).values({
            name,
            payoutPhoneNumber,
        }).returning();

        // Auto-generate credentials
        const username = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 30) + '_' + newClient.id;

        const rawPassword = Math.random().toString(36).slice(-8).toUpperCase() +
            Math.random().toString(36).slice(-4);

        const passwordHash = await bcrypt.hash(rawPassword, 12);

        await db.insert(clientUsers).values({
            clientId: newClient.id,
            username,
            passwordHash,
        });

        // Return plaintext password once — not stored anywhere else
        return NextResponse.json({
            ...newClient,
            credentials: { username, password: rawPassword },
        });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
