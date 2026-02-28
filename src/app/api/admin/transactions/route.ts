import { db } from "@/db";
import { transactions, clients, vouchers, plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Add filters
        const conditions = [];
        if (clientId) {
            conditions.push(eq(transactions.clientId, parseInt(clientId)));
        }
        if (status) {
            conditions.push(eq(transactions.status, status));
        }
        if (startDate) {
            conditions.push(gte(transactions.createdAt, new Date(startDate)));
        }
        if (endDate) {
            conditions.push(lte(transactions.createdAt, new Date(endDate)));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const allTransactions = await db.select({
            id: transactions.id,
            amount: transactions.amount,
            commission: transactions.commission,
            payout: transactions.payout,
            status: transactions.status,
            pesapalReference: transactions.pesapalReference,
            createdAt: transactions.createdAt,
            clientName: clients.name,
            voucherCode: vouchers.code,
            planName: plans.name,
        })
            .from(transactions)
            .leftJoin(clients, eq(transactions.clientId, clients.id))
            .leftJoin(vouchers, eq(transactions.voucherId, vouchers.id))
            .leftJoin(plans, eq(vouchers.planId, plans.id))
            .where(whereClause)
            .orderBy(desc(transactions.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        const [{ count }] = await db.select({ count: sql<number>`count(*)` })
            .from(transactions)
            .where(whereClause);

        // Get summary statistics
        const [summary] = await db.select({
            totalAmount: sql<string>`sum(amount)`,
            totalCommission: sql<string>`sum(commission)`,
            totalPayout: sql<string>`sum(payout)`,
        })
            .from(transactions)
            .where(whereClause);

        return NextResponse.json({
            transactions: allTransactions,
            summary: {
                totalAmount: Number(summary.totalAmount || 0),
                totalCommission: Number(summary.totalCommission || 0),
                totalPayout: Number(summary.totalPayout || 0),
            },
            pagination: {
                total: Number(count),
                page,
                limit,
                totalPages: Math.ceil(Number(count) / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, voucherId, amount, commission, payout, status = 'pending', pesapalReference } = body;

        if (!clientId || !amount || commission === undefined || payout === undefined) {
            return NextResponse.json({
                error: "Client ID, amount, commission, and payout are required"
            }, { status: 400 });
        }

        const newTransaction = await db.insert(transactions).values({
            clientId: parseInt(clientId),
            voucherId: voucherId ? parseInt(voucherId) : null,
            amount: amount.toString(),
            commission: commission.toString(),
            payout: payout.toString(),
            status,
            pesapalReference,
        }).returning();

        return NextResponse.json(newTransaction[0]);
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}