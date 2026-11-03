import type { Part } from "./types";
import { classify } from "./shipping";

// Price suggestions. The owner always approves before a suggested price goes live.
// - "market": live comps from the Pardical pricing tool (car-part.com asking prices + eBay used listings),
//   only when PRICING_API_URL is configured.
// - "estimate": offline estimate from part type, vehicle age, grade and mileage.

export type Suggestion = { cents: number | null; source: "market" | "estimate"; note: string };

// Typical used-OEM retail by part category (USD), mid-age vehicle, grade B. Starting points only.
// Most specific names first: "Engine Control Module" must not price as an engine, "Door Mirror" not as a door.
const BASE: [RegExp, number][] = [
  [/engine control|\becm\b|\becu\b|\bpcm\b/i, 140],
  [/mirror/i, 70],
  [/window regulator/i, 55],
  [/heater control|ac\/heater|climate control/i, 70],
  [/ac compressor|a\/c compressor/i, 130],
  [/power steering pump/i, 70],
  [/brake booster|master cylinder/i, 90],
  [/intake manifold/i, 90],
  [/cylinder head/i, 300],
  [/instrument cluster|speedometer/i, 110],
  [/headlight|head lamp/i, 135],
  [/tail light|tail lamp/i, 70],
  [/\babs\b/i, 145],
  [/steering rack|steering gear/i, 185],
  [/fuel pump/i, 80],
  [/radiator/i, 85],
  [/alternator/i, 70],
  [/starter/i, 60],
  [/spindle|knuckle/i, 70],
  [/transfer case/i, 400],
  [/differential|axle assembly|rear end/i, 450],
  [/transmission|transaxle/i, 750],
  [/engine|long block/i, 1100],
  [/catalytic/i, 150],
  [/tailgate/i, 300],
  [/bumper cover/i, 175],
  [/bumper/i, 275],
  [/hood/i, 250],
  [/door/i, 240],
  [/seat/i, 200],
  [/wheel|rim/i, 100],
];

const GRADE: Record<string, number> = { A: 1.08, B: 1.0, C: 0.75 };

function mileageFactor(part: Pick<Part, "part_type" | "mileage">): number {
  if (part.mileage == null) return 1;
  const { sizeClass } = classify(part.part_type);
  const driveline = sizeClass === "freight" || /engine|transmission|cylinder head/i.test(part.part_type);
  if (!driveline) return 1;
  if (part.mileage < 60000) return 1.15;
  if (part.mileage < 120000) return 1;
  if (part.mileage < 160000) return 0.85;
  return 0.72;
}

const roundTo5 = (d: number) => Math.max(5, Math.round(d / 5) * 5);

export function estimatePrice(part: Pick<Part, "part_type" | "year" | "grade" | "mileage">, now = new Date()): Suggestion {
  const base = BASE.find(([re]) => re.test(part.part_type))?.[1] ?? 90;
  const age = part.year ? Math.max(0, now.getFullYear() - part.year) : 10;
  const ageFactor = Math.min(1.3, Math.max(0.6, 1.35 - 0.035 * age));
  const grade = GRADE[part.grade.trim().toUpperCase()] ?? 1;
  const dollars = roundTo5(base * ageFactor * grade * mileageFactor(part));
  const bits = [`${part.part_type || "part"} baseline $${base}`, `${age}-yr-old vehicle`];
  if (part.grade) bits.push(`grade ${part.grade.toUpperCase()}`);
  if (part.mileage != null) bits.push(`${Math.round(part.mileage / 1000)}k miles`);
  return { cents: dollars * 100, source: "estimate", note: `Estimate: ${bits.join(", ")}.` };
}

type SourceMetrics = { success?: boolean; metrics?: { avg_price?: number; min_price?: number }; count?: number; comparable_count?: number };

/** Live comps through the existing Pardical pricing tool. Slow (up to ~3 min per part), so callers do a few at a time. */
export async function marketPrice(part: Part): Promise<Suggestion | null> {
  const base = process.env.PRICING_API_URL;
  const phone = process.env.PRICING_API_PHONE; // the pricing tool requires a contact phone on every search
  if (!base || !phone || !part.year || !part.make || !part.model || !part.part_type) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/search`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        year: String(part.year),
        make: part.make,
        model: part.model,
        part: part.part_type,
        postal_code: process.env.PRICING_API_ZIP || "60018",
        phone_number: phone,
        contact_permission: true,
      }),
      signal: AbortSignal.timeout(200_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { sources?: Record<string, SourceMetrics> };
    const cp = data.sources?.["car-part.com"];
    const eb = data.sources?.["ebay"];
    const cpAvg = cp?.success ? cp.metrics?.avg_price ?? 0 : 0;
    const ebAvg = eb?.success ? eb.metrics?.avg_price ?? 0 : 0;
    const comps = [cpAvg, ebAvg].filter((v) => v > 0);
    if (!comps.length) return null;
    const grade = GRADE[part.grade.trim().toUpperCase()] ?? 1;
    const mid = comps.reduce((a, b) => a + b, 0) / comps.length;
    const dollars = roundTo5(mid * grade * mileageFactor(part));
    const note = [
      cpAvg ? `Car-Part.com avg $${Math.round(cpAvg)}${cp?.count ? ` (${cp.count} yards)` : ""}` : "",
      ebAvg ? `eBay used avg $${Math.round(ebAvg)}${eb?.comparable_count ? ` (${eb.comparable_count} listings)` : ""}` : "",
      part.grade ? `grade ${part.grade.toUpperCase()}` : "",
    ]
      .filter(Boolean)
      .join(", ");
    return { cents: dollars * 100, source: "market", note: `Market: ${note}.` };
  } catch {
    return null;
  }
}

export function marketConfigured(): boolean {
  return !!process.env.PRICING_API_URL && !!process.env.PRICING_API_PHONE;
}
