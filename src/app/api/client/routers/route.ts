import { db } from "@/db";
import { routers } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { getSessionFromCookies } from "@/lib/auth";

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export async function GET() {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clientRouters = await db.select()
            .from(routers)
            .where(eq(routers.clientId, session.clientId))
            .orderBy(desc(routers.createdAt));

        return NextResponse.json(clientRouters);
    } catch (error) {
        console.error("Error fetching client routers:", error);
        return NextResponse.json({ error: "Failed to fetch routers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, ip, secret, version = "v7" } = body;

        if (!name || !secret) {
            return NextResponse.json({ error: "Name and RADIUS secret are required" }, { status: 400 });
        }
        if (ip && !IP_REGEX.test(ip)) {
            return NextResponse.json({ error: "Invalid IP address format" }, { status: 400 });
        }
        if (!["v6", "v7"].includes(version)) {
            return NextResponse.json({ error: "Version must be v6 or v7" }, { status: 400 });
        }

        const [newRouter] = await db.insert(routers).values({
            clientId: session.clientId,
            name,
            ip: ip || null,
            secret,
            version,
        }).returning();

        return NextResponse.json(newRouter);
    } catch (error) {
        console.error("Error creating router:", error);
        return NextResponse.json({ error: "Failed to create router" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, ip, secret, version } = body;

        if (!id) return NextResponse.json({ error: "Router ID required" }, { status: 400 });
        if (ip && !IP_REGEX.test(ip)) {
            return NextResponse.json({ error: "Invalid IP address format" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (ip) updateData.ip = ip;
        if (secret) updateData.secret = secret;
        if (version) updateData.version = version;

        const [updated] = await db.update(routers)
            .set(updateData)
            .where(and(eq(routers.id, parseInt(id)), eq(routers.clientId, session.clientId)))
            .returning();

        if (!updated) return NextResponse.json({ error: "Router not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating router:", error);
        return NextResponse.json({ error: "Failed to update router" }, { status: 500 });
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
        if (!id || isNaN(id)) return NextResponse.json({ error: "Router ID required" }, { status: 400 });

        await db.delete(routers).where(and(eq(routers.id, id), eq(routers.clientId, session.clientId)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting router:", error);
        return NextResponse.json({ error: "Failed to delete router" }, { status: 500 });
    }
}