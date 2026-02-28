import { db } from "./src/db";
import { clients, routers, transactions } from "./src/db/schema";
import { sql, gte } from "drizzle-orm";

async function run() {
    try {
        console.log("Testing stats queries...");
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);

        const routerCount = await db.select({ count: sql<number>`count(*)` }).from(routers);
        console.log("Router count:", routerCount);

        const revenueData = await db.select({
            totalAmount: sql<string>`sum(amount)`,
            totalCommission: sql<string>`sum(commission)`
        }).from(transactions);
        console.log("Revenue:", revenueData);

        const monthlyRevenue = await db.select({
            month: sql<string>`to_char(created_at, 'Mon')`,
            monthNum: sql<number>`extract(month from created_at)`,
            year: sql<number>`extract(year from created_at)`,
            totalAmount: sql<string>`sum(amount)`,
            totalCommission: sql<string>`sum(commission)`,
        })
            .from(transactions)
            .where(gte(transactions.createdAt, yearAgo))
            .groupBy(sql`to_char(created_at, 'Mon'), extract(month from created_at), extract(year from created_at)`)
            .orderBy(sql`extract(year from created_at), extract(month from created_at)`);

        console.log("Monthly:", monthlyRevenue);
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err);
        process.exit(1);
    }
}
run();
