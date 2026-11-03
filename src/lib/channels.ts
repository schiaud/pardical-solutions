import type { Part, Yard } from "./types";
import { gradeLabel, money, partTitle, photosOf } from "./format";
import { estimateShipping } from "./shipping";
import { db } from "./db";

// Channel rules for 2026:
// - Facebook Marketplace: catalytic converters, airbags and emissions-defeat parts are prohibited (Meta Commerce
//   Policies). No compliant bulk-posting API in the US, so the kit is copy-ready listings a person posts.
//   Shipped checkout only covers items $1–$500, so bigger/bulky parts are local pickup.
// - eBay: airbags and inflators banned since 2026-09-24.
// - Google Shopping free listings: condition=used is required for used items.

const FB_BLOCK = /catalytic|\bcat(alytic)? conv|air ?bag|\bsrs\b|inflator|emission[s]? (delete|defeat)|\b(dpf|egr|def) delete\b|defeat device/i;
const EBAY_BLOCK = /air ?bag|inflator|\bsrs (module|bag)\b/i;

const text = (p: Part) => `${p.part_type} ${p.description}`;
export const blockedOnFacebook = (p: Part) => FB_BLOCK.test(text(p));
export const blockedOnEbay = (p: Part) => EBAY_BLOCK.test(text(p));

export function partUrl(siteBase: string, p: Pick<Part, "id">): string {
  return `${siteBase}/parts/${p.id}`;
}
export function partImageUrl(siteBase: string, p: Part): string {
  const photo = photosOf(p)[0];
  if (!photo) return `${siteBase}/parts/${p.id}/image`;
  // Photos hosted by this app are stored as site-relative paths; feeds need absolute URLs.
  return photo.startsWith("/") ? `${new URL(siteBase).origin}${photo}` : photo;
}

function fitsLine(p: Part): string {
  return [p.year, p.make, p.model].filter(Boolean).join(" ");
}

function longDescription(p: Part, yard: Yard): string {
  const lines = [
    `${partTitle(p)} — used OEM, stock #${p.stock_no}.`,
    fitsLine(p) ? `Came off a ${fitsLine(p)}${p.mileage ? ` with ${p.mileage.toLocaleString()} miles` : ""}.` : "",
    p.grade ? gradeLabel(p.grade) + "." : "",
    p.interchange ? `Interchange: ${p.interchange}.` : "",
    p.oem_number ? `OEM part #: ${p.oem_number}.` : "",
    p.description,
    yard.warranty_text ? yard.warranty_text.split(". ")[0] + "." : "",
    p.core_charge_cents ? `Core charge ${money(p.core_charge_cents)}, refunded when your old part comes back.` : "",
    `Please confirm fitment with your VIN before ordering — call ${yard.phone || "us"} with any questions.`,
  ];
  return lines.filter(Boolean).join(" ");
}

export function fbCondition(p: Part): string {
  return p.grade.trim().toUpperCase() === "C" ? "Used - Fair" : "Used - Good";
}

export type MarketplaceListing = {
  partId: number;
  title: string;
  price: string;
  category: string;
  condition: string;
  delivery: string;
  description: string;
  location: string;
};

export function marketplaceListing(p: Part, yard: Yard, siteBase: string): MarketplaceListing {
  const ship = estimateShipping(p.part_type);
  const priceDollars = (p.price_cents ?? 0) / 100;
  const canShip = ship.method === "parcel" && !ship.pickupRecommended && priceDollars <= 500;
  const miles = p.mileage ? ` ${Math.round(p.mileage / 1000)}k mi` : "";
  const title = `${partTitle(p)}${miles} OEM`.slice(0, 99);
  const description = [
    `${partTitle(p)} — used OEM part from ${yard.name}.`,
    p.mileage ? `Donor vehicle mileage: ${p.mileage.toLocaleString()}.` : "",
    p.grade ? gradeLabel(p.grade) + "." : "",
    p.description,
    `Stock #${p.stock_no}.`,
    yard.warranty_text ? yard.warranty_text.split(". ")[0] + "." : "",
    `Pick up at ${[yard.address, yard.city, yard.state].filter(Boolean).join(", ")}${yard.hours ? ` (${yard.hours.split("\n")[0]})` : ""}.`,
    canShip ? "We can also ship it." : "Local pickup — we'll load it for you.",
    `More details and parts: ${partUrl(siteBase, p)}`,
    yard.phone ? `Call or text ${yard.phone}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    partId: p.id,
    title,
    price: priceDollars ? String(Math.round(priceDollars)) : "",
    category: "Vehicle Parts & Accessories",
    condition: fbCondition(p),
    delivery: canShip ? "Local pickup + Shipping" : "Local pickup only",
    description,
    location: [yard.city, yard.state, yard.zip].filter(Boolean).join(", "),
  };
}

export type FbQueue = { today: Part[]; postedToday: number; dailyTarget: number; repostDue: Part[]; blocked: Part[]; remaining: number };

/** Today's Marketplace posting list: priced, allowed, not yet posted. Big local-pickup parts first. */
export async function facebookQueue(yardId: number, dailyTarget = 10): Promise<FbQueue> {
  const all = (await db()
    .prepare("select * from parts where yard_id = ? and status = 'available' and price_cents is not null order by price_cents desc")
    .all(yardId)) as Part[];
  const blocked = all.filter(blockedOnFacebook);
  const allowed = all.filter((p) => !blockedOnFacebook(p));
  const postedToday = allowed.filter((p) => p.fb_posted_at && p.fb_posted_at >= new Date().toISOString().slice(0, 10)).length;
  const notPosted = allowed.filter((p) => !p.fb_posted_at);
  const bulkyFirst = notPosted.sort((a, b) => {
    const pa = estimateShipping(a.part_type).pickupRecommended ? 1 : 0;
    const pb = estimateShipping(b.part_type).pickupRecommended ? 1 : 0;
    return pb - pa || (b.price_cents ?? 0) - (a.price_cents ?? 0);
  });
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().replace("T", " ").slice(0, 19);
  const repostDue = allowed.filter((p) => p.fb_posted_at && p.fb_posted_at < monthAgo);
  return {
    today: bulkyFirst.slice(0, Math.max(0, dailyTarget - postedToday)),
    postedToday,
    dailyTarget,
    repostDue,
    blocked,
    remaining: notPosted.length,
  };
}

// ---------- feeds ----------

function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const tsvCell = (v: string | number | null | undefined) => (v == null ? "" : String(v).replace(/[\t\r\n]+/g, " "));

const priced = (parts: Part[]) => parts.filter((p) => p.status === "available" && p.price_cents != null);

/** Google Merchant Center product feed (TSV). Free listings need condition=used for used parts. */
export function googleFeed(yard: Yard, parts: Part[], siteBase: string): string {
  const head = ["id", "title", "description", "link", "image_link", "availability", "price", "condition", "brand", "mpn", "identifier_exists", "google_product_category"];
  // Used airbags are recall-sensitive; keep them off ad networks and sell them only by phone.
  const rows = priced(parts).filter((p) => !blockedOnEbay(p)).map((p) => [
    `${yard.slug}-${p.stock_no}`,
    `${partTitle(p)} OEM Used`.slice(0, 150),
    longDescription(p, yard).slice(0, 5000),
    partUrl(siteBase, p),
    partImageUrl(siteBase, p),
    "in_stock",
    `${((p.price_cents ?? 0) / 100).toFixed(2)} USD`,
    "used",
    p.make || "OEM",
    p.oem_number || "",
    p.oem_number ? "yes" : "no",
    "888",
  ]);
  return [head, ...rows].map((r) => r.map(tsvCell).join("\t")).join("\n") + "\n";
}

/** Meta (Facebook/Instagram) catalog feed for catalog ads — the compliant automated route onto Facebook. */
export function metaCatalogFeed(yard: Yard, parts: Part[], siteBase: string): string {
  const head = ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand", "google_product_category"];
  const rows = priced(parts)
    .filter((p) => !blockedOnFacebook(p))
    .map((p) => [
      `${yard.slug}-${p.stock_no}`,
      `${partTitle(p)} OEM`.slice(0, 200),
      longDescription(p, yard).slice(0, 9999),
      "in stock",
      "used",
      `${((p.price_cents ?? 0) / 100).toFixed(2)} USD`,
      partUrl(siteBase, p),
      partImageUrl(siteBase, p),
      p.make || "OEM",
      "Vehicles & Parts > Vehicle Parts & Accessories",
    ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
}

/** eBay listing file — import into Sellersperch (or eBay's bulk tools). Titles capped at eBay's 80 characters. */
export function ebayFile(yard: Yard, parts: Part[], siteBase: string): string {
  const head = ["SKU", "Title", "Price", "Quantity", "ConditionID", "ConditionDescription", "Description", "PicURL", "Year", "Make", "Model", "PartType", "Interchange", "OEMPartNumber", "Mileage", "Grade", "CoreCharge"];
  const rows = priced(parts)
    .filter((p) => !blockedOnEbay(p))
    .map((p) => [
      p.stock_no,
      `${partTitle(p)}${p.mileage ? ` ${Math.round(p.mileage / 1000)}K Miles` : ""} OEM`.slice(0, 80),
      ((p.price_cents ?? 0) / 100).toFixed(2),
      1,
      3000,
      [gradeLabel(p.grade), p.mileage ? `${p.mileage.toLocaleString()} miles` : ""].filter(Boolean).join(", "),
      longDescription(p, yard),
      photosOf(p).length ? photosOf(p).map((u) => (u.startsWith("/") ? `${new URL(siteBase).origin}${u}` : u)).join("|") : partImageUrl(siteBase, p),
      p.year ?? "",
      p.make,
      p.model,
      p.part_type,
      p.interchange,
      p.oem_number,
      p.mileage ?? "",
      p.grade,
      p.core_charge_cents ? (p.core_charge_cents / 100).toFixed(2) : "",
    ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
}
