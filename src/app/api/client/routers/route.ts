import { db } from "@/db";
import { routers } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
        }

        const clientRouters = await db.select()
            .from(routers)
            .where(eq(routers.clientId, parseInt(clientId)))
            .orderBy(desc(routers.createdAt));

        return NextResponse.json(clientRouters);
    } catch (error) {
        console.error("Error fetching client routers:", error);
        return NextResponse.json({ error: "Failed to fetch routers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, name, ip, secret, version = 'v6' } = body;

        if (!clientId || !name || !ip || !secret) {
            return NextResponse.json({ 
                error: "Client ID, name, IP, and secret are required" 
            }, { status: 400 });
        }

        // Validate IP format (basic validation)
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip)) {
            return NextResponse.json({ error: "Invalid IP address format" }, { status: 400 });
        }

        // Validate version
        if (!['v6', 'v7'].includes(version)) {
            return NextResponse.json({ error: "Version must be v6 or v7" }, { status: 400 });
        }

        const newRouter = await db.insert(routers).values({
            clientId: parseInt(clientId),
            name,
            ip,
            secret,
            version,
        }).returning();

        return NextResponse.json(newRouter[0]);
    } catch (error) {
        console.error("Error creating router:", error);
        return NextResponse.json({ error: "Failed to create router" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, clientId, name, ip, secret, version } = body;

        if (!id || !clientId) {
            return NextResponse.json({ error: "Router ID and Client ID are required" }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (ip) {
            // Validate IP format
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(ip)) {
                return NextResponse.json({ error: "Invalid IP address format" }, { status: 400 });
            }
            updateData.ip = ip;
        }
        if (secret) updateData.secret = secret;
        if (version) {
            if (!['v6', 'v7'].includes(version)) {
                return NextResponse.json({ error: "Version must be v6 or v7" }, { status: 400 });
            }
            updateData.version = version;
        }

        const updatedRouter = await db.update(routers)
            .set(updateData)
            .where(eq(routers.id, parseInt(id)))
            .returning();

        if (updatedRouter.length === 0) {
            return NextResponse.json({ error: "Router not found" }, { status: 404 });
        }

        return NextResponse.json(updatedRouter[0]);
    } catch (error) {
        console.error("Error updating router:", error);
        return NextResponse.json({ error: "Failed to update router" }, { status: 500 });
    }
}