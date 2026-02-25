import { db } from "@/db";
import { transactions, vouchers, clients, plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql, gte, lte, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '30'; // days
        const clientId = searchParams.get('clientId');
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));

        // Revenue analytics
        let revenueQuery = db.select({
            date: sql<string>`date(created_at)`,
            totalAmount: sql<string>`sum(amount)`,
            totalCommission: sql<string>`sum(commission)`,
            totalPayout: sql<string>`sum(payout)`,
            transactionCount: sql<number>`count(*)`,
        }).from(transactions)
        .where(gte(transactions.createdAt, daysAgo))
        .groupBy(sql`date(created_at)`)
        .orderBy(sql`date(created_at)`);

        if (clientId) {
            revenueQuery = revenueQuery.where(and(
                gte(transactions.createdAt, daysAgo),
                eq(transactions.clientId, parseInt(clientId))
            ));
        }

        const revenueData = await revenueQuery;

        // Voucher analytics
        let voucherQuery = db.select({
            date: sql<string>`date(created_at)`,
            totalVouchers: sql<number>`count(*)`,
            activeVouchers: sql<number>`count(*) filter (where status = 'active')`,
            unusedVouchers: sql<number>`count(*) filter (where status = 'unused')`,
            expiredVouchers: sql<number>`count(*) filter (where status = 'expired')`,
        }).from(vouchers)
        .where(gte(vouchers.createdAt, daysAgo))
        .groupBy(sql`date(created_at)`)
        .orderBy(sql`date(created_at)`);

        if (clientId) {
            voucherQuery = voucherQuery.where(and(
                gte(vouchers.createdAt, daysAgo),
                eq(vouchers.clientId, parseInt(clientId))
            ));
        }

        const voucherData = await voucherQuery;

        // Top performing plans
        const topPlansQuery = db.select({
            planId: plans.id,
            planName: plans.name,
            planPrice: plans.price,
            voucherCount: sql<number>`count(${vouchers.id})`,
            totalRevenue: sql<string>`sum(${plans.price}::numeric * count(${vouchers.id}))`,
            clientName: clients.name,
        }).from(plans)
        .leftJoin(vouchers, eq(plans.id, vouchers.planId))
        .leftJoin(clients, eq(plans.clientId, clients.id))
        .where(gte(vouchers.createdAt, daysAgo))
        .groupBy(plans.id, plans.name, plans.price, clients.name)
        .orderBy(sql`count(${vouchers.id}) desc`)
        .limit(10);

        const topPlans = await topPlansQuery;

        // Top clients by revenue
        const topClientsQuery = db.select({
            clientId: clients.id,
            clientName: clients.name,
            totalRevenue: sql<string>`coalesce(sum(${transactions.amount}), '0')`,
            totalPayout: sql<string>`coalesce(sum(${transactions.payout}), '0')`,
            transactionCount: sql<number>`count(${transactions.id})`,
            voucherCount: sql<number>`count(distinct ${vouchers.id})`,
        }).from(clients)
        .leftJoin(transactions, and(
            eq(clients.id, transactions.clientId),
            gte(transactions.createdAt, daysAgo)
        ))
        .leftJoin(vouchers, and(
            eq(clients.id, vouchers.clientId),
            gte(vouchers.createdAt, daysAgo)
        ))
        .groupBy(clients.id, clients.name)
        .orderBy(sql`coalesce(sum(${transactions.amount}), 0) desc`)
        .limit(10);

        const topClients = await topClientsQuery;

        // Platform summary
        let summaryQuery = db.select({
            totalRevenue: sql<string>`coalesce(sum(amount), '0')`,
            totalCommission: sql<string>`coalesce(sum(commission), '0')`,
            totalPayout: sql<string>`coalesce(sum(payout), '0')`,
            transactionCount: sql<number>`count(*)`,
        }).from(transactions)
        .where(gte(transactions.createdAt, daysAgo));

        if (clientId) {
            summaryQuery = summaryQuery.where(and(
                gte(transactions.createdAt, daysAgo),
                eq(transactions.clientId, parseInt(clientId))
            ));
        }

        const [summary] = await summaryQuery;

        return NextResponse.json({
            period: parseInt(period),
            summary: {
                totalRevenue: Number(summary.totalRevenue),
                totalCommission: Number(summary.totalCommission),
                totalPayout: Number(summary.totalPayout),
                transactionCount: Number(summary.transactionCount),
            },
            revenueByDay: revenueData.map(row => ({
                date: row.date,
                totalAmount: Number(row.totalAmount),
                totalCommission: Number(row.totalCommission),
                totalPayout: Number(row.totalPayout),
                transactionCount: Number(row.transactionCount),
            })),
            vouchersByDay: voucherData.map(row => ({
                date: row.date,
                totalVouchers: Number(row.totalVouchers),
                activeVouchers: Number(row.activeVouchers),
                unusedVouchers: Number(row.unusedVouchers),
                expiredVouchers: Number(row.expiredVouchers),
            })),
            topPlans: topPlans.map(row => ({
                planId: row.planId,
                planName: row.planName,
                planPrice: Number(row.planPrice),
                voucherCount: Number(row.voucherCount),
                totalRevenue: Number(row.totalRevenue || 0),
                clientName: row.clientName,
            })),
            topClients: topClients.map(row => ({
                clientId: row.clientId,
                clientName: row.clientName,
                totalRevenue: Number(row.totalRevenue),
                totalPayout: Number(row.totalPayout),
                transactionCount: Number(row.transactionCount),
                voucherCount: Number(row.voucherCount),
            })),
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
    }
}