"use server";

import { createLead } from "@/lib/leads";
import { getPart } from "@/lib/parts";
import { partTitle, money } from "@/lib/format";
import { getYardBySlug, isDemoYard } from "@/lib/yards";
import { clientIp, filledHoneypot, rateLimited } from "@/lib/guard";
import { notifyLead } from "@/lib/notify";

export type FormState = { ok: boolean; message: string } | null;

const field = (fd: FormData, k: string, n = 200) => String(fd.get(k) ?? "").trim().slice(0, n);
const phoneOk = (p: string) => p.replace(/\D/g, "").length >= 10;
const DEMO_NOTE = " (This is the demo yard — no real yard will call. Want this for your yard? Visit pardical.com.)";

/** Bots and floods: returns a reply to send instead of saving, or null to continue. */
async function screen(fd: FormData): Promise<FormState | "drop" | null> {
  if (filledHoneypot(fd.get("website"))) return "drop";
  if (rateLimited(`yardform:${await clientIp()}`, 6)) return { ok: false, message: "Too many requests from this connection — please call us instead." };
  return null;
}

/** Buyer wants a part: the yard confirms it's on the shelf, then sends a payment link or holds it for pickup. */
export async function requestPart(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = await screen(fd);
  if (blocked === "drop") return { ok: true, message: "Thanks — we'll be in touch." };
  if (blocked) return blocked;
  const yard = getYardBySlug(field(fd, "slug", 60));
  if (!yard) return { ok: false, message: "This yard isn't available." };
  const part = getPart(yard.id, Number(fd.get("partId")));
  if (!part || part.status !== "available") return { ok: false, message: "Sorry — that part was just sold or put on hold. Call us and we'll find another." };
  const name = field(fd, "name");
  const phone = field(fd, "phone", 40);
  if (!name || !phoneOk(phone)) return { ok: false, message: "Please add your name and a phone number we can call or text." };
  createLead({
    yardId: yard.id,
    kind: "part_request",
    partId: part.id,
    name,
    phone,
    email: field(fd, "email"),
    zip: field(fd, "zip", 10),
    data: {
      part: `${partTitle(part)} (stock #${part.stock_no})`,
      price: money(part.price_cents),
      delivery: field(fd, "delivery", 40),
      warranty: field(fd, "warranty", 40),
      vin: field(fd, "vin", 20).toUpperCase(),
      notes: field(fd, "notes", 1000),
    },
  });
  if (!isDemoYard(yard.slug)) notifyLead(`Part request at ${yard.name}: ${partTitle(part)} (#${part.stock_no}, ${money(part.price_cents)}) — ${name}, ${phone}`);
  return {
    ok: true,
    message:
      `Got it! We'll confirm the ${part.part_type.toLowerCase()} is on the shelf and ${
        field(fd, "delivery") === "pickup" ? "hold it for pickup" : "text you a secure payment link with the shipping total"
      } — usually within 1 business hour. Questions? Call ${yard.phone}.` + (isDemoYard(yard.slug) ? DEMO_NOTE : ""),
  };
}

export async function sellCar(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = await screen(fd);
  if (blocked === "drop") return { ok: true, message: "Thanks — we'll be in touch." };
  if (blocked) return blocked;
  const yard = getYardBySlug(field(fd, "slug", 60));
  if (!yard) return { ok: false, message: "This yard isn't available." };
  const name = field(fd, "name");
  const phone = field(fd, "phone", 40);
  if (!name || !phoneOk(phone)) return { ok: false, message: "Please add your name and a phone number." };
  if (!field(fd, "vin") && !(field(fd, "year") && field(fd, "make") && field(fd, "model")))
    return { ok: false, message: "Add the VIN, or the year, make and model." };
  createLead({
    yardId: yard.id,
    kind: "sell_car",
    name,
    phone,
    email: field(fd, "email"),
    zip: field(fd, "zip", 10),
    data: {
      vehicle: [field(fd, "year", 4), field(fd, "make", 40), field(fd, "model", 60)].filter(Boolean).join(" "),
      vin: field(fd, "vin", 20).toUpperCase(),
      runs: field(fd, "runs", 20),
      title: field(fd, "title", 20),
      condition: field(fd, "condition", 1000),
      pickup: field(fd, "pickup", 20),
    },
  });
  if (!isDemoYard(yard.slug)) notifyLead(`Car offered to ${yard.name}: ${[field(fd, "year", 4), field(fd, "make", 40), field(fd, "model", 60)].filter(Boolean).join(" ") || field(fd, "vin", 20)} — ${name}, ${phone}`);
  return {
    ok: true,
    message: `Thanks! We'll call you with an offer — usually the same business day. Questions? Call ${yard.phone}.` + (isDemoYard(yard.slug) ? DEMO_NOTE : ""),
  };
}
