import { db } from "@/db";
import { clients, routers, transactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        const [clientCount] = await db.select({ count: sql<number>`count(*)` }).from(clients);
        const [routerCount] = await db.select({ count: sql<number>`count(*)` }).from(routers);

        const [revenueData] = await db.select({
            totalAmount: sql<string>`sum(amount)`,
            totalCommission: sql<string>`sum(commission)`
        }).from(transactions);

        return NextResponse.json({
            totalClients: Number(clientCount.count),
            totalNodes: Number(routerCount.count),
            totalRevenue: Number(revenueData.totalAmount || 0),
            totalCommission: Number(revenueData.totalCommission || 0),
        });
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
