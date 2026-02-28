import { db } from "@/db";
import { routers, plans, clients, transactions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getPesaPalToken, submitOrder, registerIPN } from "@/lib/pesapal";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { plan_id, router_id, customer_name, customer_phone } = body;

        if (!plan_id || !router_id || !customer_name || !customer_phone) {
            return NextResponse.json({ error: "plan_id, router_id, customer_name, and customer_phone are required" }, { status: 400 });
        }

        // Get plan
        const planRow = await db.select().from(plans).where(eq(plans.id, parseInt(plan_id))).limit(1);
        if (planRow.length === 0) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

        // Get router → client
        const routerRow = await db.select().from(routers).where(eq(routers.id, parseInt(router_id))).limit(1);
        if (routerRow.length === 0) return NextResponse.json({ error: "Router not found" }, { status: 404 });

        // Get client credentials
        const clientRow = await db.select().from(clients).where(eq(clients.id, routerRow[0].clientId)).limit(1);
        if (clientRow.length === 0) return NextResponse.json({ error: "Client not found" }, { status: 404 });

        const clientData = clientRow[0];
        const planData = planRow[0];
        const amount = parseFloat(planData.price);
        const commission = amount * 0.15;
        const payout = amount * 0.85;

        // Create pending transaction (no voucherId yet — assigned after payment)
        const newTx = await db.insert(transactions).values({
            clientId: clientData.id,
            amount: amount.toString(),
            commission: commission.toFixed(2),
            payout: payout.toFixed(2),
            status: "pending",
        }).returning();

        const txId = newTx[0].id;
        // Encode plan_id in merchantRef so we can find it later
        const merchantRef = `TXN-${txId}-P${plan_id}`;

        // Store merchantRef back on the transaction
        await db.update(transactions)
            .set({ pesapalReference: merchantRef })
            .where(eq(transactions.id, txId));

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const callbackUrl = `${appUrl}/portal/complete?ref=${merchantRef}`;

        // No PesaPal credentials → dev/mock mode
        if (!clientData.pesapalConsumerKey || !clientData.pesapalConsumerSecret) {
            return NextResponse.json({
                redirect_url: `${callbackUrl}&mock=true`,
                merchant_ref: merchantRef,
                mock: true,
            });
        }

        // Get PesaPal token
        const token = await getPesaPalToken({
            consumerKey: clientData.pesapalConsumerKey,
            consumerSecret: clientData.pesapalConsumerSecret,
        });

        // Register IPN if not already registered
        let ipnId = clientData.pesapalIpnId ?? "";
        if (!ipnId) {
            const ipnResult = await registerIPN(token, `${appUrl}/api/portal/ipn`);
            ipnId = ipnResult.ipn_id ?? "";
            await db.update(clients).set({ pesapalIpnId: ipnId }).where(eq(clients.id, clientData.id));
        }

        // Submit order to PesaPal
        const nameParts = customer_name.trim().split(" ");
        const orderData = {
            id: merchantRef,
            currency: "UGX",
            amount,
            description: `FastNet WiFi - ${planData.name}`,
            callback_url: callbackUrl,
            notification_id: ipnId,
            branch: clientData.name,
            billing_address: {
                email_address: "",
                phone_number: customer_phone,
                country_code: "KE",
                first_name: nameParts[0] ?? "",
                last_name: nameParts.slice(1).join(" ") ?? "",
                line_1: "",
                city: "",
                state: "",
                postal_code: "",
                zip_code: "",
            },
        };

        const orderResponse = await submitOrder(token, orderData);

        return NextResponse.json({
            redirect_url: orderResponse.redirect_url,
            merchant_ref: merchantRef,
        });
    } catch (error) {
        console.error("Portal pay error:", error);
        return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
    }
}
