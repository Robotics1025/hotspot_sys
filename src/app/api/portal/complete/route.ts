import { db } from "@/db";
import { transactions, vouchers, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getPesaPalToken, getTransactionStatus } from "@/lib/pesapal";

// Parse planId from merchantRef format: TXN-{txId}-P{planId}
function parsePlanId(ref: string): number | null {
    const match = ref.match(/TXN-\d+-P(\d+)/);
    return match ? parseInt(match[1]) : null;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");
    const trackingId = searchParams.get("tracking_id");
    const mock = searchParams.get("mock");

    if (!ref) return NextResponse.json({ error: "ref is required" }, { status: 400 });

    try {
        // Find transaction by merchantRef
        const txRow = await db.select().from(transactions)
            .where(eq(transactions.pesapalReference, ref))
            .limit(1);

        if (txRow.length === 0) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const txData = txRow[0];

        // Already completed — return existing voucher code
        if (txData.status === "completed" && txData.voucherId) {
            const voucherRow = await db.select({ code: vouchers.code, planId: vouchers.planId })
                .from(vouchers)
                .where(eq(vouchers.id, txData.voucherId))
                .limit(1);
            return NextResponse.json({
                status: "completed",
                voucher_code: voucherRow[0]?.code ?? null,
            });
        }

        // Check payment status
        let paymentCompleted = false;

        if (mock === "true") {
            // Dev mode — skip PesaPal verification
            paymentCompleted = true;
        } else {
            const clientRow = await db.select().from(clients)
                .where(eq(clients.id, txData.clientId))
                .limit(1);

            const clientData = clientRow[0];
            if (clientData?.pesapalConsumerKey && clientData?.pesapalConsumerSecret && trackingId) {
                const token = await getPesaPalToken({
                    consumerKey: clientData.pesapalConsumerKey,
                    consumerSecret: clientData.pesapalConsumerSecret,
                });
                const status = await getTransactionStatus(token, trackingId);
                paymentCompleted = status?.payment_status_description === "Completed";
            }
        }

        if (!paymentCompleted) {
            return NextResponse.json({ status: "pending" });
        }

        // Parse planId from ref
        const planId = parsePlanId(ref);
        if (!planId) {
            return NextResponse.json({ error: "Unable to determine plan from reference" }, { status: 400 });
        }

        // Find an unused voucher for this plan + client
        const availableVoucher = await db.select().from(vouchers)
            .where(and(
                eq(vouchers.planId, planId),
                eq(vouchers.clientId, txData.clientId),
                eq(vouchers.status, "unused"),
            ))
            .limit(1);

        if (availableVoucher.length === 0) {
            // Mark transaction as failed — no vouchers left
            await db.update(transactions)
                .set({ status: "failed" })
                .where(eq(transactions.id, txData.id));
            return NextResponse.json({ status: "no_vouchers", error: "No vouchers available for this plan" });
        }

        const voucher = availableVoucher[0];

        // Activate voucher and complete transaction atomically
        await Promise.all([
            db.update(vouchers)
                .set({ status: "active", consumedAt: new Date() })
                .where(eq(vouchers.id, voucher.id)),
            db.update(transactions)
                .set({ status: "completed", voucherId: voucher.id })
                .where(eq(transactions.id, txData.id)),
        ]);

        return NextResponse.json({
            status: "completed",
            voucher_code: voucher.code,
        });
    } catch (error) {
        console.error("Portal complete error:", error);
        return NextResponse.json({ error: "Failed to complete payment" }, { status: 500 });
    }
}
