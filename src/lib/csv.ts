import { dollarsToCents } from "./format";
import type { PartInput } from "./parts";

/** RFC 4180-ish CSV parser (quotes, escaped quotes, CRLF). Also accepts tab-separated files. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.slice(0, src.indexOf("\n") === -1 ? undefined : src.indexOf("\n"));
  const sep = (firstLine.match(/\t/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

export const FIELDS = [
  "stock_no", "year", "make", "model", "part_type", "description", "interchange", "oem_number", "grade",
  "mileage", "donor_vin", "price", "core_charge", "location", "photos", "status",
] as const;
export type Field = (typeof FIELDS)[number];

// Header names seen in Powerlink / Checkmate / Pinnacle style exports and hand-made spreadsheets.
const SYNONYMS: Record<Field, string[]> = {
  stock_no: ["stock", "stock#", "stock no", "stock number", "stockno", "tag", "tag#", "tag number", "inventory #", "inventory number", "item #", "item number", "sku", "part id", "id"],
  year: ["year", "yr", "model year", "vehicle year"],
  make: ["make", "mfr", "manufacturer", "vehicle make"],
  model: ["model", "vehicle model"],
  part_type: ["part", "part type", "part name", "parttype", "part description", "part desc", "item", "part code description"],
  description: ["description", "desc", "notes", "comments", "condition notes", "remarks", "options"],
  interchange: ["interchange", "interchange #", "interchange number", "hollander", "hollander #", "hollander interchange", "ic", "ic#", "ic number"],
  oem_number: ["oem", "oem #", "oem number", "oem part number", "part number", "part #", "part no", "mpn", "mfr part number"],
  grade: ["grade", "condition", "cond", "condition code"],
  mileage: ["miles", "mileage", "odometer", "vehicle miles"],
  donor_vin: ["vin", "donor vin", "vehicle vin"],
  price: ["price", "retail", "retail price", "list price", "sell price", "sale price", "asking price", "amount"],
  core_charge: ["core", "core charge", "core price"],
  location: ["location", "bin", "loc", "shelf", "bin location"],
  photos: ["image", "images", "photo", "photos", "picture", "pictures", "image url", "image urls", "photo url", "photo urls", "picture url"],
  status: ["status", "state", "availability"],
};

const norm = (h: string) => h.toLowerCase().replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim();

export function autoMap(headers: string[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  const taken = new Set<number>();
  // exact synonym matches first, then "contains" matches
  for (const pass of ["exact", "contains"] as const) {
    for (const field of FIELDS) {
      if (map[field] !== undefined) continue;
      const idx = headers.findIndex((h, i) => {
        if (taken.has(i)) return false;
        const n = norm(h);
        return SYNONYMS[field].some((s) => (pass === "exact" ? n === s : n.includes(s) && s.length > 2));
      });
      if (idx !== -1) {
        map[field] = idx;
        taken.add(idx);
      }
    }
  }
  return map;
}

function toStatus(v: string): PartInput["status"] {
  const s = v.toLowerCase();
  if (/sold|gone|scrap/.test(s)) return "sold";
  if (/hold|reserved|pending/.test(s)) return "held";
  return "available";
}

export type ImportResult = { rows: PartInput[]; skipped: number; mapping: Partial<Record<Field, string>> };

export function rowsToParts(table: string[][]): ImportResult {
  const [headers, ...body] = table;
  if (!headers) return { rows: [], skipped: 0, mapping: {} };
  const map = autoMap(headers);
  const get = (row: string[], f: Field) => (map[f] === undefined ? "" : (row[map[f]!] ?? "").trim());
  const rows: PartInput[] = [];
  let skipped = 0;
  for (const r of body) {
    const stock = get(r, "stock_no");
    const partType = get(r, "part_type") || get(r, "description");
    if (!stock || !partType) {
      skipped++;
      continue;
    }
    const year = Number(get(r, "year"));
    const miles = Number(get(r, "mileage").replace(/[,\s]/g, ""));
    rows.push({
      stock_no: stock.slice(0, 60),
      year: year >= 1950 && year <= 2100 ? year : null,
      make: get(r, "make"),
      model: get(r, "model"),
      part_type: partType.slice(0, 120),
      description: get(r, "part_type") ? get(r, "description").slice(0, 2000) : "",
      interchange: get(r, "interchange"),
      oem_number: get(r, "oem_number"),
      grade: get(r, "grade").slice(0, 12),
      mileage: Number.isFinite(miles) && miles > 0 ? Math.round(miles) : null,
      donor_vin: get(r, "donor_vin").toUpperCase().slice(0, 17),
      price_cents: dollarsToCents(get(r, "price")),
      core_charge_cents: dollarsToCents(get(r, "core_charge")) ?? 0,
      location: get(r, "location"),
      photos: get(r, "photos")
        .split(/[|;\s,]+/)
        .filter((u) => /^https?:\/\//i.test(u))
        .slice(0, 12),
      status: get(r, "status") ? toStatus(get(r, "status")) : "available",
    });
  }
  const mapping = Object.fromEntries(Object.entries(map).map(([f, i]) => [f, headers[i as number]])) as Partial<Record<Field, string>>;
  return { rows, skipped, mapping };
}
