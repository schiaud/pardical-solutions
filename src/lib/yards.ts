import { db } from "./db";
import type { Yard } from "./types";

export async function getYardBySlug(slug: string): Promise<Yard | null> {
  return ((await db().prepare("select * from yards where slug = ?").get(slug)) as Yard | undefined) ?? null;
}

export async function getYardByDomain(host: string): Promise<Yard | null> {
  const bare = host.toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
  return ((await db().prepare("select * from yards where lower(custom_domain) = ?").get(bare)) as Yard | undefined) ?? null;
}

export async function listYards(): Promise<Yard[]> {
  return (await db().prepare("select * from yards order by name").all()) as Yard[];
}

const EDITABLE = [
  "name", "tagline", "phone", "email", "address", "city", "state", "zip", "hours", "about_text",
  "warranty_text", "returns_text", "pickup_note", "brand_color", "logo_url", "custom_domain",
] as const;
export type YardEditable = (typeof EDITABLE)[number];

export async function updateYard(id: number, fields: Partial<Record<YardEditable, string>>): Promise<void> {
  const keys = EDITABLE.filter((k) => fields[k] !== undefined);
  if (!keys.length) return;
  const values = keys.map((k) => {
    const v = (fields[k] ?? "").trim();
    return k === "custom_domain" ? v.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "") || null : v;
  });
  await db()
    .prepare(`update yards set ${keys.map((k) => `${k} = ?`).join(", ")} where id = ?`)
    .run(...values, id);
}

export async function createYard(slug: string, name: string): Promise<Yard> {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!clean) throw new Error("A yard needs a short web name (letters and numbers).");
  await db().prepare("insert into yards (slug, name) values (?, ?)").run(clean, name.trim() || clean);
  return (await getYardBySlug(clean))!;
}

export async function setYardPasswordHash(id: number, hash: string): Promise<void> {
  await db().prepare("update yards set owner_password_hash = ? where id = ?").run(hash, id);
}

/** Where the yard's public site lives: its own domain once connected, otherwise the /y/<slug> path. */
export function yardBase(yard: Pick<Yard, "slug">, viaDomain: boolean): string {
  return viaDomain ? "" : `/y/${yard.slug}`;
}

/** The public sample yard linked from pardical.com. */
export function isDemoYard(slug: string): boolean {
  return slug === "demo";
}

export function hoursLines(yard: Pick<Yard, "hours">): string[] {
  return yard.hours.split("\n").map((l) => l.trim()).filter(Boolean);
}
