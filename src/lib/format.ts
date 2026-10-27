import type { Part } from "./types";

export function money(cents: number | null | undefined): string {
  if (cents == null) return "Call for price";
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 ? 2 : 0 });
}

export function dollarsToCents(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
}

export function partTitle(p: Pick<Part, "year" | "make" | "model" | "part_type">): string {
  return [p.year, p.make, p.model, p.part_type].filter(Boolean).join(" ");
}

export function photosOf(p: Pick<Part, "photos">): string[] {
  try {
    const list = JSON.parse(p.photos);
    return Array.isArray(list) ? list.filter((u) => typeof u === "string" && u) : [];
  } catch {
    return [];
  }
}

export function gradeLabel(grade: string): string {
  const g = grade.trim().toUpperCase();
  if (g === "A") return "Grade A — the yard's best grade";
  if (g === "B") return "Grade B — normal wear";
  if (g === "C") return "Grade C — usable, visible wear";
  return grade ? `Grade ${grade}` : "";
}

/** Central time, labelled — how Pardical shows times to people. */
export function centralTime(sqliteUtc: string | null | undefined): string {
  if (!sqliteUtc) return "";
  const d = new Date(sqliteUtc.replace(" ", "T") + "Z");
  return (
    d.toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " CT"
  );
}
