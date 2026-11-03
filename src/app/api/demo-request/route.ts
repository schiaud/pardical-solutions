import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { clientIp, filledHoneypot, rateLimited } from "@/lib/guard";
import { notifyLead } from "@/lib/notify";

// "Book a call" from the pardical.com pages. audience "broker" → /brokers page; anything else → recycler.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Something went wrong — please email david@pardical.com." }, { status: 400 });
  }
  // Bots: pretend success so they move on.
  if (filledHoneypot(body.website)) return NextResponse.json({ ok: true });
  if (rateLimited(`lead:${await clientIp()}`, 5)) {
    return NextResponse.json({ ok: false, error: "Too many requests — please email david@pardical.com." }, { status: 429 });
  }
  const s = (k: string, n = 200) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, n) : "");
  const broker = s("audience") === "broker";
  const name = s("name");
  const business = broker ? s("businessName") : s("yardName");
  const phone = s("phone", 40);
  if (!name || !business || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false, error: "Please add your name, your business name and a phone number." }, { status: 400 });
  }
  createLead({
    yardId: null,
    kind: broker ? "broker_demo" : "founding_yard",
    name,
    phone,
    email: s("email"),
    data: broker
      ? { businessName: business, ebayStore: s("ebayStore"), ordersPerMonth: s("ordersPerMonth", 40), message: s("message", 2000) }
      : { yardName: business, city: s("city", 80), state: s("state", 40), yardSoftware: s("yardSoftware", 60), message: s("message", 2000) },
  });
  notifyLead(`New ${broker ? "broker" : "recycler"} demo request: ${business} — ${name}, ${phone}${s("email") ? `, ${s("email")}` : ""}`);
  return NextResponse.json({ ok: true });
}
