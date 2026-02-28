import { db } from "@/db";
import { routers, plans, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const routerId = searchParams.get("router_id");

    if (!routerId) {
        return NextResponse.json({ error: "router_id is required" }, { status: 400 });
    }

    try {
        const routerRow = await db.select().from(routers)
            .where(eq(routers.id, parseInt(routerId)))
            .limit(1);

        if (routerRow.length === 0) {
            return NextResponse.json({ error: "Router not found" }, { status: 404 });
        }

        const clientId = routerRow[0].clientId;

        const [clientRow, clientPlans] = await Promise.all([
            db.select({ id: clients.id, name: clients.name })
                .from(clients)
                .where(eq(clients.id, clientId))
                .limit(1),
            db.select().from(plans)
                .where(eq(plans.clientId, clientId)),
        ]);

        return NextResponse.json({
            client: clientRow[0] ?? null,
            router: { id: routerRow[0].id, name: routerRow[0].name },
            plans: clientPlans,
        });
    } catch (error) {
        console.error("Portal plans error:", error);
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }
}
