// VIN decode through NHTSA vPIC (free, public, no key).
export type DecodedVin = { vin: string; year: number | null; make: string; model: string; trim: string; engine: string };

const cache = new Map<string, DecodedVin | null>();

export function cleanVin(raw: string): string | null {
  const vin = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin) ? vin : null;
}

const title = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

export async function decodeVin(raw: string): Promise<DecodedVin | null> {
  const vin = cleanVin(raw);
  if (!vin) return null;
  if (cache.has(vin)) return cache.get(vin)!;
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`, {
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { Results?: Record<string, string>[] };
    const r = json.Results?.[0];
    if (!r || !r.Make) {
      cache.set(vin, null);
      return null;
    }
    const liters = r.DisplacementL ? `${Number(r.DisplacementL).toFixed(1)}L` : "";
    const out: DecodedVin = {
      vin,
      year: Number(r.ModelYear) || null,
      make: title(r.Make),
      model: r.Model || "",
      trim: r.Trim || "",
      engine: [liters, r.EngineCylinders ? `${r.EngineCylinders}-cyl` : ""].filter(Boolean).join(" "),
    };
    cache.set(vin, out);
    return out;
  } catch {
    return null;
  }
}
