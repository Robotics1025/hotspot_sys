import { db } from "@/db";
<<<<<<< HEAD
import { clients, users, routers, plans, vouchers, transactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
=======
import { clients, clientUsers } from "@/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa

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

<<<<<<< HEAD
        // 1. Create the client record
=======
        // Insert client
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
        const [newClient] = await db.insert(clients).values({
            name,
            payoutPhoneNumber,
        }).returning();

<<<<<<< HEAD
        // 2. Generate login credentials for the client admin
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").slice(0, 20);
        const username = `${slug}_admin`;
        const rawPassword = Math.random().toString(36).slice(-8).toUpperCase() + Math.random().toString(36).slice(-4);
        const passwordHash = await hash(rawPassword, 10);

        // Derive an email from the slug so it's unique
        const email = `${slug}@clients.fastnet.systems`;

        // 3. Create the user account linked to the client
        await db.insert(users).values({
            email,
            passwordHash,
            name: `${name} Admin`,
            role: "client_admin",
            clientId: newClient.id,
            isActive: true,
        });

        return NextResponse.json({
            client: newClient,
            credentials: {
                username,
                email,
                password: rawPassword,
            },
=======
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
>>>>>>> bbf1127d7563f500509fbd6c15b6b57c5df72eaa
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Error creating client:", msg);
        return NextResponse.json({ error: "Failed to create client", detail: msg }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = parseInt(searchParams.get("id") ?? "");
        if (!id || isNaN(id)) return NextResponse.json({ error: "Client ID required" }, { status: 400 });

        // Cascade in FK-safe order
        await db.delete(transactions).where(eq(transactions.clientId, id));
        await db.delete(vouchers).where(eq(vouchers.clientId, id));
        await db.delete(plans).where(eq(plans.clientId, id));
        await db.delete(routers).where(eq(routers.clientId, id));
        await db.delete(users).where(eq(users.clientId, id));
        await db.delete(clients).where(eq(clients.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Error deleting client:", msg);
        return NextResponse.json({ error: "Failed to delete client", detail: msg }, { status: 500 });
    }
}
