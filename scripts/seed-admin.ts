/**
 * Seed the first super admin user.
 * Run once after DB setup:
 *   npx tsx scripts/seed-admin.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    ?? "admin@fastnet.systems";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@FastNet2026!";
const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     ?? "Super Admin";

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set in .env.local");
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    // Check if admin already exists
    const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, ADMIN_EMAIL))
        .limit(1);

    if (existing) {
        console.log(`✓ Super admin already exists: ${ADMIN_EMAIL}`);
        await pool.end();
        return;
    }

    const passwordHash = await hash(ADMIN_PASSWORD, 12);

    const [newAdmin] = await db
        .insert(schema.users)
        .values({
            email: ADMIN_EMAIL,
            passwordHash,
            name: ADMIN_NAME,
            role: "super_admin",
            clientId: null,
            isActive: true,
        })
        .returning();

    console.log("✓ Super admin created successfully!");
    console.log(`  Email:    ${newAdmin.email}`);
    console.log(`  Name:     ${newAdmin.name}`);
    console.log(`  Role:     ${newAdmin.role}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log("\n⚠  Change the password after first login!");

    await pool.end();
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
