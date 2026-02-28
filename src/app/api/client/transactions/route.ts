import { db } from "@/db";
import { transactions, vouchers, plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and, sql } from "drizzle-orm";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status");
        const offset = (page - 1) * limit;

        const clientId = session.clientId;

        const conditions = status
            ? and(eq(transactions.clientId, clientId), eq(transactions.status, status as "pending" | "completed" | "failed"))
            : eq(transactions.clientId, clientId);

        const rows = await db
            .select({
                id: transactions.id,
                amount: transactions.amount,
                commission: transactions.commission,
                payout: transactions.payout,
                status: transactions.status,
                pesapalReference: transactions.pesapalReference,
                createdAt: transactions.createdAt,
                voucherCode: vouchers.code,
                planName: plans.name,
            })
            .from(transactions)
            .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
            .leftJoin(plans, eq(vouchers.planId, plans.id))
            .where(conditions)
            .orderBy(desc(transactions.createdAt))
            .limit(limit)
            .offset(offset);

        const [totals] = await db
            .select({
                totalAmount: sql<string>`coalesce(sum(amount), '0')`,
                totalCommission: sql<string>`coalesce(sum(commission), '0')`,
                totalPayout: sql<string>`coalesce(sum(payout), '0')`,
                total: sql<number>`count(*)`,
            })
            .from(transactions)
            .where(conditions);

        return NextResponse.json({
            transactions: rows,
            summary: {
                totalAmount: Number(totals.totalAmount),
                totalCommission: Number(totals.totalCommission),
                totalPayout: Number(totals.totalPayout),
            },
            pagination: {
                total: Number(totals.total),
                page,
                limit,
                totalPages: Math.ceil(Number(totals.total) / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching client transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}
