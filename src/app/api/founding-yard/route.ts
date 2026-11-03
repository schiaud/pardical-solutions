import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { clientIp, filledHoneypot, rateLimited } from "@/lib/guard";
import { notifyLead } from "@/lib/notify";

// pardical.com "Book a demo" form → a founding-yard lead (yard_id null = Pardical's own pipeline).
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
  const name = s("name");
  const yardName = s("yardName");
  const phone = s("phone", 40);
  if (!name || !yardName || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false, error: "Please add your name, your yard's name and a phone number." }, { status: 400 });
  }
  createLead({
    yardId: null,
    kind: "founding_yard",
    name,
    phone,
    email: s("email"),
    data: { yardName, city: s("city", 80), state: s("state", 40), yardSoftware: s("yardSoftware", 60), message: s("message", 2000) },
  });
  notifyLead(`New recycler demo request: ${yardName} — ${name}, ${phone}${s("email") ? `, ${s("email")}` : ""} (${[s("city", 80), s("state", 40)].filter(Boolean).join(", ") || "location ?"}; ${s("yardSoftware", 60) || "software ?"})`);
  return NextResponse.json({ ok: true });
}
