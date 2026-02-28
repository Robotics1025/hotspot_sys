import { db } from "@/db";
import { plans, vouchers } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clientPlans = await db.select()
            .from(plans)
            .where(eq(plans.clientId, session.clientId))
            .orderBy(desc(plans.createdAt));

        return NextResponse.json(clientPlans);
    } catch (error) {
        console.error("Error fetching client plans:", error);
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, durationSeconds, speedLimit, price } = body;

        if (!name || !durationSeconds || !price) {
            return NextResponse.json({ error: "Name, duration, and price are required" }, { status: 400 });
        }

        const [newPlan] = await db.insert(plans).values({
            clientId: session.clientId,
            name,
            duration: parseInt(durationSeconds),
            speedLimit: speedLimit || null,
            price: price.toString(),
        }).returning();

        return NextResponse.json(newPlan);
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "client_admin" || !session.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, durationSeconds, speedLimit, price } = body;

        if (!id) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (durationSeconds) updateData.duration = parseInt(durationSeconds);
        if (speedLimit !== undefined) updateData.speedLimit = speedLimit || null;
        if (price) updateData.price = price.toString();

        const [updated] = await db.update(plans)
            .set(updateData)
            .where(and(eq(plans.id, parseInt(id)), eq(plans.clientId, session.clientId)))
            .returning();

        if (!updated) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
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
        if (!id || isNaN(id)) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

        await db.delete(vouchers).where(and(eq(vouchers.planId, id), eq(vouchers.clientId, session.clientId)));
        await db.delete(plans).where(and(eq(plans.id, id), eq(plans.clientId, session.clientId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting plan:", error);
        return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
    }
}