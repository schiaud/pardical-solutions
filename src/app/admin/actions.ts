"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkOperatorPassword,
  endSession,
  getSession,
  hashPassword,
  requireOperator,
  requireYardAdmin,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { createYard, getYardBySlug, isDemoYard, setYardPasswordHash, updateYard, type YardEditable } from "@/lib/yards";
import {
  approveSuggestions,
  importParts,
  markFbPosted,
  partsByIds,
  partsNeedingPrice,
  setPrice,
  setStatus,
  setSuggestions,
} from "@/lib/parts";
import { parseCsv, rowsToParts } from "@/lib/csv";
import { estimatePrice, marketPrice } from "@/lib/pricing";
import { setLeadStatus } from "@/lib/leads";
import { dollarsToCents } from "@/lib/format";
import { clientIp, rateLimited } from "@/lib/guard";
import type { Lead, PartStatus } from "@/lib/types";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const DEMO_READ_ONLY = { ok: false, message: "This is the public demo — changes are turned off. Book a demo and we'll set up your own yard." };

/** Like requireYardAdmin, but the public demo login (owner role on the demo yard) can only look. */
async function requireWriter(slug: string) {
  const ctx = await requireYardAdmin(slug);
  return { ...ctx, readOnly: isDemoYard(slug) && ctx.session.role === "owner" };
}
const ids = (fd: FormData) => fd.getAll("ids").map(Number).filter((n) => Number.isInteger(n) && n > 0);

export type ActionResult = { ok: boolean; message: string } | null;

// ---------- auth ----------

export async function login(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  if (rateLimited(`login:${await clientIp()}`, 10)) return { ok: false, message: "Too many sign-in attempts. Wait 10 minutes and try again." };
  const password = str(fd, "password");
  const slug = str(fd, "yard").toLowerCase();
  if (checkOperatorPassword(password)) {
    await startSession({ role: "operator" });
    redirect(slug && (await getYardBySlug(slug)) ? `/admin/${slug}` : "/admin");
  }
  const yard = slug ? await getYardBySlug(slug) : null;
  if (yard && verifyPassword(password, yard.owner_password_hash)) {
    await startSession({ role: "owner", yard: yard.slug });
    redirect(`/admin/${yard.slug}`);
  }
  return { ok: false, message: "That password didn't work." };
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

// ---------- operator ----------

export async function addYard(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireOperator();
  let slug: string;
  try {
    slug = (await createYard(str(fd, "slug"), str(fd, "name"))).slug;
  } catch (err) {
    const msg = err instanceof Error && /UNIQUE/.test(err.message) ? "That web name is taken." : err instanceof Error ? err.message : "Couldn't add the yard.";
    return { ok: false, message: msg };
  }
  redirect(`/admin/${slug}/settings`);
}

export async function setFoundingLeadStatus(fd: FormData): Promise<void> {
  await requireOperator();
  await setLeadStatus(null, Number(fd.get("id")), str(fd, "status") as Lead["status"]);
  revalidatePath("/admin");
}

// ---------- yard: inventory ----------

export type ImportSummary = {
  ok: boolean;
  message: string;
  mapping?: Record<string, string>;
  added?: number;
  updated?: number;
  removed?: number;
  skipped?: number;
} | null;

export async function importInventory(_prev: ImportSummary, fd: FormData): Promise<ImportSummary> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return DEMO_READ_ONLY;
  const file = fd.get("file");
  const text = file instanceof File && file.size ? await file.text() : str(fd, "pasted");
  if (!text) return { ok: false, message: "Choose your inventory export file (CSV) or paste it in." };
  const table = parseCsv(text);
  const { rows, skipped, mapping } = rowsToParts(table);
  if (!rows.length) {
    return {
      ok: false,
      message: "No parts found. The file needs at least a stock # column and a part name column.",
      mapping: mapping as Record<string, string>,
      skipped,
    };
  }
  const full = fd.get("fullFile") === "on";
  const res = await importParts(yard.id, rows, full);
  revalidatePath(`/admin/${yard.slug}`, "layout");
  return {
    ok: true,
    message: `Imported ${rows.length.toLocaleString()} parts: ${res.added} new, ${res.updated} updated${full ? `, ${res.removed} marked sold` : ""}${skipped ? `, ${skipped} rows skipped (no stock # or part name)` : ""}.`,
    mapping: mapping as Record<string, string>,
    ...res,
    skipped,
  };
}

export async function changeStatus(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  await setStatus(yard.id, Number(fd.get("id")), str(fd, "status") as PartStatus);
  revalidatePath(`/admin/${yard.slug}`, "layout");
}

// ---------- yard: pricing ----------

/** Offline estimates only fill parts that have no price — they never second-guess a price the yard set. */
export async function runPriceResearch(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  const unpriced = (await partsNeedingPrice(yard.id, 2000)).filter((p) => p.price_cents == null);
  await setSuggestions(unpriced.map((p) => ({ id: p.id, ...estimatePrice(p) })));
  revalidatePath(`/admin/${yard.slug}`, "layout");
}

/** Live market comps (car-part.com + eBay) through the Pardical pricing tool — slow, so a few parts at a time. */
export async function runMarketCheck(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  for (const p of await partsByIds(yard.id, ids(fd).slice(0, 5))) {
    const s = await marketPrice(p);
    if (s) await setSuggestions([{ id: p.id, ...s }]);
  }
  revalidatePath(`/admin/${yard.slug}/pricing`);
}

export async function approvePrices(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  await approveSuggestions(yard.id, ids(fd));
  revalidatePath(`/admin/${yard.slug}`, "layout");
}

export async function savePrice(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  await setPrice(yard.id, Number(fd.get("id")), dollarsToCents(str(fd, "price")));
  revalidatePath(`/admin/${yard.slug}`, "layout");
}

// ---------- yard: channels ----------

export async function toggleFbPosted(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  await markFbPosted(yard.id, Number(fd.get("id")), str(fd, "posted") === "1");
  revalidatePath(`/admin/${yard.slug}/channels`);
}

// ---------- yard: leads ----------

export async function updateLead(fd: FormData): Promise<void> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return;
  await setLeadStatus(yard.id, Number(fd.get("id")), str(fd, "status") as Lead["status"]);
  revalidatePath(`/admin/${yard.slug}`, "layout");
}

// ---------- yard: settings ----------

const SETTINGS: YardEditable[] = [
  "name", "tagline", "phone", "email", "address", "city", "state", "zip", "hours", "about_text",
  "warranty_text", "returns_text", "pickup_note", "brand_color", "logo_url", "custom_domain",
];

export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { yard, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return DEMO_READ_ONLY;
  const fields: Partial<Record<YardEditable, string>> = {};
  for (const k of SETTINGS) if (fd.has(k)) fields[k] = String(fd.get(k) ?? "");
  if (fields.name !== undefined && !fields.name.trim()) return { ok: false, message: "The yard needs a name." };
  if (fields.brand_color && !/^#[0-9a-f]{6}$/i.test(fields.brand_color.trim())) return { ok: false, message: "Brand color must look like #1e3a5f." };
  try {
    await updateYard(yard.id, fields);
  } catch (err) {
    return { ok: false, message: err instanceof Error && /UNIQUE/.test(err.message) ? "That domain is already connected to another yard." : "Couldn't save." };
  }
  revalidatePath(`/admin/${yard.slug}`, "layout");
  revalidatePath(`/y/${yard.slug}`, "layout");
  return { ok: true, message: "Saved. Your website is updated." };
}

export async function setOwnerPassword(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { yard, session, readOnly } = await requireWriter(str(fd, "slug"));
  if (readOnly) return DEMO_READ_ONLY;
  const pw = str(fd, "password");
  if (pw.length < 8) return { ok: false, message: "Use at least 8 characters." };
  if (session.role === "owner" && !verifyPassword(str(fd, "current"), yard.owner_password_hash)) {
    return { ok: false, message: "Your current password didn't match." };
  }
  await setYardPasswordHash(yard.id, hashPassword(pw));
  return { ok: true, message: "Owner password saved." };
}

export async function whoAmI() {
  return getSession();
}
