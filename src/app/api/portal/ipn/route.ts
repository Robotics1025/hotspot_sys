import { NextResponse } from "next/server";

// PesaPal IPN handler — called server-to-server by PesaPal after payment events
// GET /api/portal/ipn?OrderTrackingId=...&OrderMerchantReference=...&OrderNotificationType=IPNCHANGE
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get("OrderTrackingId");
    const merchantRef = searchParams.get("OrderMerchantReference");

    if (!orderTrackingId || !merchantRef) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        // Call our own complete endpoint to process the payment
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        await fetch(
            `${appUrl}/api/portal/complete?ref=${encodeURIComponent(merchantRef)}&tracking_id=${encodeURIComponent(orderTrackingId)}`,
            { method: "GET" }
        );

        return NextResponse.json({ orderNotificationType: "IPNCHANGE", orderTrackingId, orderMerchantReference: merchantRef, status: "200" });
    } catch (error) {
        console.error("IPN handler error:", error);
        return NextResponse.json({ error: "IPN processing failed" }, { status: 500 });
    }
}
