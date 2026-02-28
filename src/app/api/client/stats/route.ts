import { db } from "@/db";
import { vouchers, transactions, plans, routers } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql, and } from "drizzle-orm";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clientIdNum = session.clientId;

        // Get voucher statistics
        const [voucherStats] = await db.select({
            totalVouchers: sql<number>`count(*)`,
            activeVouchers: sql<number>`count(*) filter (where status = 'active')`,
            unusedVouchers: sql<number>`count(*) filter (where status = 'unused')`,
            expiredVouchers: sql<number>`count(*) filter (where status = 'expired')`,
        }).from(vouchers).where(eq(vouchers.clientId, clientIdNum));

        // Get transaction statistics
        const [transactionStats] = await db.select({
            totalRevenue: sql<string>`coalesce(sum(amount), '0')`,
            totalPayout: sql<string>`coalesce(sum(payout), '0')`,
            transactionCount: sql<number>`count(*)`,
        }).from(transactions).where(
            and(
                eq(transactions.clientId, clientIdNum),
                eq(transactions.status, 'completed')
            )
        );

        // Get plan count
        const [planCount] = await db.select({
            count: sql<number>`count(*)`
        }).from(plans).where(eq(plans.clientId, clientIdNum));

        // Get router count
        const [routerCount] = await db.select({
            count: sql<number>`count(*)`
        }).from(routers).where(eq(routers.clientId, clientIdNum));

        // Get recent transactions
        const recentTransactions = await db.select({
            id: transactions.id,
            amount: transactions.amount,
            status: transactions.status,
            createdAt: transactions.createdAt,
        }).from(transactions)
        .where(eq(transactions.clientId, clientIdNum))
        .orderBy(sql`created_at DESC`)
        .limit(10);

        return NextResponse.json({
            vouchers: {
                total: Number(voucherStats.totalVouchers),
                active: Number(voucherStats.activeVouchers),
                unused: Number(voucherStats.unusedVouchers),
                expired: Number(voucherStats.expiredVouchers),
            },
            financial: {
                totalRevenue: Number(transactionStats.totalRevenue),
                totalPayout: Number(transactionStats.totalPayout),
                transactionCount: Number(transactionStats.transactionCount),
            },
            resources: {
                planCount: Number(planCount.count),
                routerCount: Number(routerCount.count),
            },
            recentTransactions,
        });
    } catch (error) {
        console.error("Error fetching client stats:", error);
        return NextResponse.json({ error: "Failed to fetch client statistics" }, { status: 500 });
    }
}