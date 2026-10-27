import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Host health check (Render / Railway): the app is up and the database file is readable and writable.
export const dynamic = "force-dynamic";

export function GET() {
  try {
    db().prepare("select 1").get();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("health check failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
