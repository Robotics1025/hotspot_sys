import { db } from "@/db";
import { plans } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
        }

        const clientPlans = await db.select()
            .from(plans)
            .where(eq(plans.clientId, parseInt(clientId)))
            .orderBy(desc(plans.createdAt));

        return NextResponse.json(clientPlans);
    } catch (error) {
        console.error("Error fetching client plans:", error);
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

        // Validate duration (convert hours/days to seconds)
        let durationInSeconds = parseInt(duration);
        
        const newPlan = await db.insert(plans).values({
            clientId: parseInt(clientId),
            name,
            duration: durationInSeconds,
            speedLimit,
            price: price.toString(),
        }).returning();

        return NextResponse.json(newPlan[0]);
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, clientId, name, duration, speedLimit, price } = body;

        if (!id || !clientId) {
            return NextResponse.json({ error: "Plan ID and Client ID are required" }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (duration) updateData.duration = parseInt(duration);
        if (speedLimit) updateData.speedLimit = speedLimit;
        if (price) updateData.price = price.toString();

        const updatedPlan = await db.update(plans)
            .set(updateData)
            .where(eq(plans.id, parseInt(id)))
            .returning();

        if (updatedPlan.length === 0) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPlan[0]);
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
    }
}