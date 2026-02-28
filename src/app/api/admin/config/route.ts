import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSessionFromCookies();
        if (!session || session.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            radiusIp: process.env.RADIUS_SERVER_IP || "YOUR_RADIUS_SERVER_IP",
            radiusSecret: process.env.RADIUS_SECRET || "FastNet-Radius-2026",
            radiusAuthPort: process.env.RADIUS_AUTH_PORT || "1812",
            radiusAcctPort: process.env.RADIUS_ACCT_PORT || "1813",
            appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
        });
    } catch (error) {
        console.error("Error fetching config:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
