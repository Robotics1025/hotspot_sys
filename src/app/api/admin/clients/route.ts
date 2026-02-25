import { db } from "@/db";
import { clients } from "@/db/schema";
import { NextResponse } from "next/server";

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

        const newClient = await db.insert(clients).values({
            name,
            payoutPhoneNumber,
        }).returning();

        return NextResponse.json(newClient[0]);
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
