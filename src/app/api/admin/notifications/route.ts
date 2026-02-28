import { db } from "@/db";
import { clients, transactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [recentClients, failedTxns, pendingTxns] = await Promise.all([
            db.select({ id: clients.id, name: clients.name, createdAt: clients.createdAt })
                .from(clients)
                .orderBy(desc(clients.createdAt))
                .limit(10),
            db.select({ id: transactions.id, amount: transactions.amount, createdAt: transactions.createdAt, clientId: transactions.clientId })
                .from(transactions)
                .where(eq(transactions.status, "failed"))
                .orderBy(desc(transactions.createdAt))
                .limit(5),
            db.select({ id: transactions.id, amount: transactions.amount, createdAt: transactions.createdAt, clientId: transactions.clientId })
                .from(transactions)
                .where(eq(transactions.status, "pending"))
                .orderBy(desc(transactions.createdAt))
                .limit(5),
        ]);

        const notifications = [
            ...recentClients.map(c => ({
                id: `client-${c.id}`,
                title: "New Client Registered",
                description: `${c.name} has been onboarded and is active on the platform.`,
                time: c.createdAt,
                type: "user",
                priority: "medium",
                unread: true,
            })),
            ...failedTxns.map(t => ({
                id: `fail-${t.id}`,
                title: "Payment Failed",
                description: `A transaction of UGX ${Number(t.amount).toLocaleString()} failed. Client ID #${t.clientId}.`,
                time: t.createdAt,
                type: "system",
                priority: "high",
                unread: true,
            })),
            ...pendingTxns.map(t => ({
                id: `pending-${t.id}`,
                title: "Pending Payment",
                description: `A transaction of UGX ${Number(t.amount).toLocaleString()} is awaiting confirmation. Client ID #${t.clientId}.`,
                time: t.createdAt,
                type: "payment",
                priority: "low",
                unread: false,
            })),
        ].sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime());

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
    }
}
