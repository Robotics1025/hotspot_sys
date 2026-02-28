import { db } from "@/db";
import { vouchers, plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { generateVoucherCode } from "@/lib/vouchers";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');
        const status = searchParams.get('status');

        if (!clientId) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
        }

        const conditions = [eq(vouchers.clientId, parseInt(clientId))];
        if (status) {
            conditions.push(eq(vouchers.status, status as any));
        }

        const clientVouchers = await db.select({
            id: vouchers.id,
            code: vouchers.code,
            status: vouchers.status,
            consumedAt: vouchers.consumedAt,
            expiresAt: vouchers.expiresAt,
            createdAt: vouchers.createdAt,
            planId: vouchers.planId,
            planName: plans.name,
            planPrice: plans.price,
            planDuration: plans.duration,
            planSpeedLimit: plans.speedLimit,
        })
            .from(vouchers)
            .leftJoin(plans, eq(vouchers.planId, plans.id))
            .where(and(...conditions))
            .orderBy(desc(vouchers.createdAt));

        return NextResponse.json(clientVouchers);
    } catch (error) {
        console.error("Error fetching client vouchers:", error);
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
        console.error("Error generating vouchers:", error);
        return NextResponse.json({ error: "Failed to generate vouchers" }, { status: 500 });
    }
}