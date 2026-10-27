import { NextResponse } from "next/server";
import { answerChat } from "@/lib/chat";
import { getYardByDomain, getYardBySlug } from "@/lib/yards";
import { rateLimited } from "@/lib/guard";


export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const yard = getYardBySlug(slug);
  if (!yard) return NextResponse.json({ error: "Unknown yard." }, { status: 404 });
  // Per-IP limits so a public chat box can't run up model costs.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`chat:${slug}:${ip}`, 12, 60_000) || rateLimited(`chatday:${ip}`, 150, 24 * 3600_000)) return NextResponse.json({ error: "Too many messages — give us a call instead!" }, { status: 429 });
  let body: { message?: unknown; sessionId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  if (!message.trim() || !sessionId) return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  const host = (req.headers.get("host") || "").toLowerCase();
  const onOwnDomain = getYardByDomain(host)?.slug === yard.slug;
  const result = await answerChat(yard, sessionId, message, onOwnDomain ? "" : `/y/${yard.slug}`);
  return NextResponse.json(result);
}
