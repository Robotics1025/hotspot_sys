import { db } from "@/db";
import { plans, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');

        const conditions = [];
        if (clientId) {
            conditions.push(eq(plans.clientId, parseInt(clientId)));
        }

        const allPlans = await db.select({
            id: plans.id,
            name: plans.name,
            duration: plans.duration,
            speedLimit: plans.speedLimit,
            price: plans.price,
            createdAt: plans.createdAt,
            clientName: clients.name,
            clientId: plans.clientId,
        })
            .from(plans)
            .leftJoin(clients, eq(plans.clientId, clients.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(plans.createdAt));
        return NextResponse.json(allPlans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, name, duration, speedLimit, price } = body;

        if (!clientId || !name || !duration || !price) {
            return NextResponse.json({
                error: "Client ID, name, duration, and price are required"
            }, { status: 400 });
        }

        const newPlan = await db.insert(plans).values({
            clientId: parseInt(clientId),
            name,
            duration: parseInt(duration), // duration in seconds
            speedLimit,
            price: price.toString(),
        }).returning();

        return NextResponse.json(newPlan[0]);
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
    }
}