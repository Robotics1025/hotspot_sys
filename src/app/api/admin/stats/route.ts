import { db } from "@/db";
import { clients, routers, transactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { sql, gte } from "drizzle-orm";

export async function GET() {
    try {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);

        const [clientCount, routerCount, revenueData, monthlyRevenue] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(clients),
            db.select({ count: sql<number>`count(*)` }).from(routers),
            db.select({
                totalAmount: sql<string>`sum(amount)`,
                totalCommission: sql<string>`sum(commission)`
            }).from(transactions),
            db.select({
                month: sql<string>`to_char(created_at, 'Mon')`,
                monthNum: sql<number>`extract(month from created_at)`,
                year: sql<number>`extract(year from created_at)`,
                totalAmount: sql<string>`sum(amount)`,
                totalCommission: sql<string>`sum(commission)`,
            })
                .from(transactions)
                .where(gte(transactions.createdAt, yearAgo))
                .groupBy(sql`to_char(created_at, 'Mon'), extract(month from created_at), extract(year from created_at)`)
                .orderBy(sql`extract(year from created_at), extract(month from created_at)`),
        ]);

        return NextResponse.json({
            totalClients: Number(clientCount[0].count),
            totalNodes: Number(routerCount[0].count),
            totalRevenue: Number(revenueData[0].totalAmount || 0),
            totalCommission: Number(revenueData[0].totalCommission || 0),
            monthlyRevenue: monthlyRevenue.map(r => ({
                month: r.month,
                revenue: Number(r.totalAmount || 0),
                commission: Number(r.totalCommission || 0),
            })),
        });
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
