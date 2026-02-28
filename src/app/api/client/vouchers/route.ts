import { db } from "@/db";
import { vouchers, plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { generateVoucherCode } from "@/lib/vouchers";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const clientId = session.clientId;

        const baseCondition = eq(vouchers.clientId, clientId);
        const whereCondition = status
            ? and(baseCondition, eq(vouchers.status, status as "unused" | "active" | "expired"))
            : baseCondition;

        let query = db.select({
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
        .where(eq(vouchers.clientId, parseInt(clientId)))
        .orderBy(desc(vouchers.createdAt));

        return NextResponse.json(clientVouchers);
    } catch (error) {
        console.error("Error fetching client vouchers:", error);
        return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { planId, quantity = 1 } = body;

        if (!planId) {
            return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
        }

        const vouchersToCreate = [];
        for (let i = 0; i < quantity; i++) {
            vouchersToCreate.push({
                clientId: session.clientId!,
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

export async function DELETE(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = parseInt(searchParams.get("id") ?? "");
        if (!id || isNaN(id)) return NextResponse.json({ error: "Voucher ID required" }, { status: 400 });

        await db.update(vouchers)
            .set({ status: "disabled" })
            .where(and(eq(vouchers.id, id), eq(vouchers.clientId, session.clientId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error disabling voucher:", error);
        return NextResponse.json({ error: "Failed to disable voucher" }, { status: 500 });
    }
}