import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Health check: the app is up and can reach its database.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db().prepare("select 1").get();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("health check failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
