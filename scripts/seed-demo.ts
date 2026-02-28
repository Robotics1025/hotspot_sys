/**
 * Seed demo data: client, router, plans, vouchers.
 * Run: npx tsx scripts/seed-demo.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env.local");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    // ─── 1. Client ───────────────────────────────────────────────────────────
    console.log("Seeding client...");
    let clientId: number;

    const existingClient = await db.select().from(schema.clients)
        .where(eq(schema.clients.name, "FastNet Demo Cafe"))
        .limit(1);

    if (existingClient.length > 0) {
        clientId = existingClient[0].id;
        console.log(`  ✓ Client already exists (id=${clientId})`);
    } else {
        const [newClient] = await db.insert(schema.clients).values({
            name: "FastNet Demo Cafe",
            payoutPhoneNumber: "0712345678",
            balance: "0.00",
        }).returning();
        clientId = newClient.id;
        console.log(`  ✓ Client created (id=${clientId})`);
    }

    // ─── 2. Client Admin User ─────────────────────────────────────────────────
    console.log("Seeding client admin user...");
    const clientEmail = "client@fastnet.systems";
    const existing = await db.select().from(schema.users)
        .where(eq(schema.users.email, clientEmail)).limit(1);

    if (existing.length === 0) {
        const passwordHash = await hash("Client@FastNet2026!", 12);
        await db.insert(schema.users).values({
            email: clientEmail,
            passwordHash,
            name: "Demo Client",
            role: "client_admin",
            clientId,
            isActive: true,
        });
        console.log(`  ✓ Client admin created: ${clientEmail} / Client@FastNet2026!`);
    } else {
        console.log(`  ✓ Client admin already exists: ${clientEmail}`);
    }

    // ─── 3. Router ───────────────────────────────────────────────────────────
    console.log("Seeding router...");
    let routerId: number;

    const existingRouters = await db.select().from(schema.routers)
        .where(eq(schema.routers.clientId, clientId)).limit(1);

    if (existingRouters.length > 0) {
        routerId = existingRouters[0].id;
        console.log(`  ✓ Router already exists (id=${routerId})`);
    } else {
        const [newRouter] = await db.insert(schema.routers).values({
            clientId,
            name: "Main Lobby NAS",
            ip: "192.168.1.1",
            secret: "FastNet2026",
            version: "v7",
        }).returning();
        routerId = newRouter.id;
        console.log(`  ✓ Router created (id=${routerId})`);
    }

    // ─── 4. Plans ────────────────────────────────────────────────────────────
    console.log("Seeding plans...");
    const planDefs = [
        { name: "1 Hour",   duration: 3600,    speedLimit: "5M/5M",    price: "1000",  bestValue: false },
        { name: "3 Days",   duration: 259200,  speedLimit: "5M/5M",    price: "2500",  bestValue: true  },
        { name: "7 Days",   duration: 604800,  speedLimit: "10M/10M",  price: "6000",  bestValue: false },
        { name: "30 Days",  duration: 2592000, speedLimit: "10M/10M",  price: "25000", bestValue: false },
    ];

    // Remove old plans not in the current list, delete their vouchers first
    const existingPlans = await db.select().from(schema.plans)
        .where(eq(schema.plans.clientId, clientId));

    const keepNames = planDefs.map(p => p.name);
    const stale = existingPlans.filter(p => !keepNames.includes(p.name));
    for (const s of stale) {
        await db.delete(schema.vouchers).where(eq(schema.vouchers.planId, s.id));
        await db.delete(schema.plans).where(eq(schema.plans.id, s.id));
        console.log(`  ✗ Removed stale plan "${s.name}" (id=${s.id})`);
    }

    // Refresh list after cleanup
    const freshPlans = await db.select().from(schema.plans)
        .where(eq(schema.plans.clientId, clientId));

    const planIds: number[] = [];
    for (const def of planDefs) {
        const alreadyExists = freshPlans.find(p => p.name === def.name);
        if (alreadyExists) {
            // Update price/duration in case it changed
            await db.update(schema.plans)
                .set({ duration: def.duration, speedLimit: def.speedLimit, price: def.price })
                .where(eq(schema.plans.id, alreadyExists.id));
            planIds.push(alreadyExists.id);
            console.log(`  ✓ Plan "${def.name}" updated (id=${alreadyExists.id})`);
        } else {
            const [newPlan] = await db.insert(schema.plans).values({
                clientId,
                name: def.name,
                duration: def.duration,
                speedLimit: def.speedLimit,
                price: def.price,
            }).returning();
            planIds.push(newPlan.id);
            console.log(`  ✓ Plan "${def.name}" created (id=${newPlan.id})`);
        }
    }

    // ─── 5. Vouchers (10 per plan) ────────────────────────────────────────────
    console.log("Seeding vouchers...");
    let vouchersCreated = 0;
    for (const planId of planIds) {
        const existingVouchers = await db.select({ id: schema.vouchers.id })
            .from(schema.vouchers)
            .where(eq(schema.vouchers.planId, planId));

        const needed = 10 - existingVouchers.length;
        if (needed <= 0) {
            console.log(`  ✓ Plan ${planId} already has ${existingVouchers.length} vouchers`);
            continue;
        }

        const codes = Array.from({ length: needed }, () =>
            nanoid(8).toUpperCase().replace(/[^A-Z0-9]/g, "X").slice(0, 8)
        );

        await db.insert(schema.vouchers).values(
            codes.map(code => ({
                clientId,
                planId,
                code,
                status: "unused" as const,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            }))
        );
        vouchersCreated += needed;
        console.log(`  ✓ Created ${needed} vouchers for plan ${planId}`);
    }

    console.log(`\n✅ Demo seed complete!`);
    console.log(`   Portal URL: http://localhost:3000/portal?router_id=${routerId}`);
    console.log(`   Client login: ${clientEmail} / Client@FastNet2026!`);
    console.log(`   Vouchers created: ${vouchersCreated}`);

    await pool.end();
}

main().catch(err => { console.error("Seed failed:", err); process.exit(1); });
