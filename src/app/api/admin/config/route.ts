import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        radiusIp: process.env.RADIUS_SERVER_IP || "127.0.0.1",
        radiusSecret: process.env.RADIUS_SECRET || "changeme",
        radiusAuthPort: process.env.RADIUS_AUTH_PORT || "1812",
        radiusAcctPort: process.env.RADIUS_ACCT_PORT || "1813",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
    });
}
