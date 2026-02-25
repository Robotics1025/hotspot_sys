import { db } from "@/db";
import { vouchers, clients, plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and, sql } from "drizzle-orm";
import { generateVoucherCode } from "@/lib/vouchers";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        let query = db.select({
            id: vouchers.id,
            code: vouchers.code,
            status: vouchers.status,
            consumedAt: vouchers.consumedAt,
            expiresAt: vouchers.expiresAt,
            createdAt: vouchers.createdAt,
            clientName: clients.name,
            planName: plans.name,
            planPrice: plans.price,
            planDuration: plans.duration,
        })
        .from(vouchers)
        .leftJoin(clients, eq(vouchers.clientId, clients.id))
        .leftJoin(plans, eq(vouchers.planId, plans.id))
        .orderBy(desc(vouchers.createdAt))
        .limit(limit)
        .offset(offset);

        // Add filters
        const conditions = [];
        if (clientId) {
            conditions.push(eq(vouchers.clientId, parseInt(clientId)));
        }
        if (status) {
            conditions.push(eq(vouchers.status, status as any));
        }
        
        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        const allVouchers = await query;

        // Get total count for pagination
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(vouchers);
        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
        }
        const [{ count }] = await countQuery;

        return NextResponse.json({
            vouchers: allVouchers,
            pagination: {
                total: Number(count),
                page,
                limit,
                totalPages: Math.ceil(Number(count) / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching vouchers:", error);
        return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, planId, quantity = 1 } = body;

        if (!clientId || !planId) {
            return NextResponse.json({ error: "Client ID and Plan ID are required" }, { status: 400 });
        }

        const vouchersToCreate = [];
        for (let i = 0; i < quantity; i++) {
            vouchersToCreate.push({
                clientId: parseInt(clientId),
                planId: parseInt(planId),
                code: generateVoucherCode(),
                status: "unused" as const,
            });
        }

        const newVouchers = await db.insert(vouchers).values(vouchersToCreate).returning();

        return NextResponse.json({ 
            message: `Generated ${quantity} vouchers successfully`,
            vouchers: newVouchers 
        });
    } catch (error) {
        console.error("Error creating vouchers:", error);
        return NextResponse.json({ error: "Failed to generate vouchers" }, { status: 500 });
    }
}