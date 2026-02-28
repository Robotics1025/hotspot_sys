import { db } from "@/db";
import { vouchers, transactions, plans, routers } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql, and, desc } from "drizzle-orm";
import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = 'force-dynamic';

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

        // Get transaction statistics (Gross Revenue, Payout, and Commission cut)
        const [transactionStats] = await db.select({
            totalRevenue: sql<string>`coalesce(sum(amount), '0')`,
            totalPayout: sql<string>`coalesce(sum(payout), '0')`,
            totalCommission: sql<string>`coalesce(sum(commission), '0')`,
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

        // Get recent activity (recently generated vouchers)
        const recentActivity = await db.select({
            id: vouchers.id,
            code: vouchers.code,
            status: vouchers.status,
            createdAt: vouchers.createdAt,
            planName: plans.name,
            planPrice: plans.price,
        })
            .from(vouchers)
            .leftJoin(plans, eq(vouchers.planId, plans.id))
            .where(eq(vouchers.clientId, clientIdNum))
            .orderBy(desc(vouchers.createdAt))
            .limit(5);

        // Fetch popular plans
        const popularPlansRaw = await db.select({
            id: plans.id,
            name: plans.name,
            speed: plans.speedLimit,
            price: plans.price,
            duration: plans.duration,
            count: sql<number>`count(${vouchers.id})`,
        })
            .from(plans)
            .leftJoin(vouchers, eq(plans.id, vouchers.planId))
            .where(eq(plans.clientId, clientIdNum))
            .groupBy(plans.id)
            .orderBy(desc(sql<number>`count(${vouchers.id})`))
            .limit(3);

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
                totalCommission: Number(transactionStats.totalCommission),
                transactionCount: Number(transactionStats.transactionCount),
            },
            resources: {
                planCount: Number(planCount.count),
                routerCount: Number(routerCount.count),
            },
            recentActivity: recentActivity.map(a => ({
                id: a.id,
                code: a.code,
                plan: a.planName,
                price: `UGX ${Number(a.planPrice).toLocaleString()}`,
                status: a.status,
            })),
            popularPlans: popularPlansRaw.map(p => ({
                name: p.name,
                speed: p.speed,
                price: `UGX ${Number(p.price).toLocaleString()}`,
                duration: `${Math.floor(p.duration / 3600)} Hours`,
                color: "bg-emerald-100",
            })),
        });
    } catch (error) {
        console.error("Error fetching client stats:", error);
        return NextResponse.json({ error: "Failed to fetch client statistics" }, { status: 500 });
    }
}