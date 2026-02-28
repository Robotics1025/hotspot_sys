import { db } from "@/db";
import { vouchers, plans, radcheck, radreply, transactions, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { generateVoucherCode } from "@/lib/vouchers";
import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = 'force-dynamic';

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
            .where(whereCondition)
            .orderBy(desc(vouchers.createdAt));

        return NextResponse.json(query);
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

        // Fetch the plan details to get speed limits and price
        const [plan] = await db.select().from(plans).where(eq(plans.id, parseInt(planId))).limit(1);
        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const vouchersToCreate = [];
        const radchecksToCreate = [];
        const radrepliesToCreate = [];

        // Prepare bulk insert arrays
        for (let i = 0; i < quantity; i++) {
            const code = generateVoucherCode();

            // 1. Core System Voucher
            vouchersToCreate.push({
                clientId: session.clientId!,
                planId: parseInt(planId),
                code: code,
                status: "unused" as const,
            });

            // 2. RADIUS Authentication (radcheck)
            radchecksToCreate.push({
                username: code,
                attribute: "Cleartext-Password",
                op: ":=",
                value: code,
            });

            // Tenant Isolation - restrict this voucher to this client's NAS/router
            radchecksToCreate.push({
                username: code,
                attribute: "Tenant-Id", // Custom attribute to match later or just standard NAS-Identifier
                op: "==",
                value: `client_${session.clientId}`,
            });

            // 3. RADIUS Speed Limits & Session Time (radreply)
            if (plan.speedLimit) {
                radrepliesToCreate.push({
                    username: code,
                    attribute: "MikroTik-Rate-Limit",
                    op: "=",
                    value: plan.speedLimit,
                });
            }

            // Limit the total session time (duration is stored in seconds)
            radrepliesToCreate.push({
                username: code,
                attribute: "Session-Timeout",
                op: "=",
                value: plan.duration.toString(),
            });
        }

        // Execute DB inserts inside a transaction where possible
        // (For now, sequentially await to avoid Promise.all issues from earlier)

        // 1. Insert vouchers
        const newVouchers = await db.insert(vouchers).values(vouchersToCreate).returning();

        // 2. Insert RADIUS credentials
        await db.insert(radcheck).values(radchecksToCreate);
        await db.insert(radreply).values(radrepliesToCreate);

        // 3. Calculate and record the 10% platform commission financial transaction
        const totalAmount = Number(plan.price) * quantity;
        const commissionAmount = totalAmount * 0.10;
        const payoutAmount = totalAmount * 0.90;

        await db.insert(transactions).values({
            clientId: session.clientId,
            voucherId: null, // represents a batch transaction
            amount: totalAmount.toString(),
            commission: commissionAmount.toString(),
            payout: payoutAmount.toString(),
            status: "completed",
            pesapalReference: `batch_gen_${Date.now()}`,
        });

        // 4. (Optional) Deduct commission from prepaid client balance
        // We'll leave balance deduction for a future step if they use a prepaid wallet, 
        // but the transaction record is the source of truth for billing.

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