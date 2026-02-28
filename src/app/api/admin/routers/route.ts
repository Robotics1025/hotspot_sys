import { db } from "@/db";
import { routers, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allRouters = await db.select({
            id: routers.id,
            name: routers.name,
            ip: routers.ip,
            version: routers.version,
            createdAt: routers.createdAt,
            clientName: clients.name,
        })
            .from(routers)
            .leftJoin(clients, eq(routers.clientId, clients.id));

        return NextResponse.json(allRouters);
    } catch (error) {
        console.error("Error fetching routers:", error);
        return NextResponse.json({ error: "Failed to fetch routers" }, { status: 500 });
    }
}
