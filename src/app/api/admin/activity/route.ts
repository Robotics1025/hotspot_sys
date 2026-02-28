import { db } from "@/db";
import { clients, transactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const [recentClients, recentTransactions] = await Promise.all([
            db.select({ id: clients.id, name: clients.name, createdAt: clients.createdAt })
                .from(clients)
                .orderBy(desc(clients.createdAt))
                .limit(5),
            db.select({ id: transactions.id, amount: transactions.amount, status: transactions.status, createdAt: transactions.createdAt })
                .from(transactions)
                .orderBy(desc(transactions.createdAt))
                .limit(5),
        ]);

        // Merge and sort by date
        const events = [
            ...recentClients.map(c => ({
                id: `client-${c.id}`,
                type: "signup" as const,
                title: "New Client Onboarded",
                detail: `${c.name} joined the platform`,
                time: c.createdAt,
            })),
            ...recentTransactions.map(t => ({
                id: `txn-${t.id}`,
                type: "payment" as const,
                title: t.status === "completed" ? "Payment Received" : `Payment ${t.status}`,
                detail: `$${Number(t.amount).toFixed(2)} via PesaPal`,
                time: t.createdAt,
            })),
        ]
            .sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime())
            .slice(0, 8);

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
    }
}
