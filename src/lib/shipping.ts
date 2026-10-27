import fs from "node:fs";
import path from "node:path";

// Size rules + real label costs come from Pardical's own shipped orders (2,817 used-part labels, 2 years),
// the same data the live pricing tool at app.pardical.com uses. Oversize and freight use 2026 market ranges
// instead, because parcel history can't contain them.
type Rule = { category: string; size_class: SizeClass; pattern: string };
type Stat = { n: number; median: number; p25: number; p75: number };
export type SizeClass = "small" | "medium" | "large" | "oversize" | "freight";

const dataDir = path.join(process.cwd(), "data");
const rules = (JSON.parse(fs.readFileSync(path.join(dataDir, "shipping_categories.json"), "utf8")).rules as Rule[]).map((r) => ({
  ...r,
  re: new RegExp(r.pattern, "i"),
}));
const history = JSON.parse(fs.readFileSync(path.join(dataDir, "shipping_history.json"), "utf8")) as {
  categories: Record<string, Stat>;
  size_classes: Record<string, Stat>;
};

const OVERSIZE = { low: 60, typical: 95, high: 180 };
const FREIGHT = { low: 175, typical: 275, high: 450 };
const RESIDENTIAL_FREIGHT_EXTRA = 125; // liftgate + residential delivery, typical

export type ShippingEstimate = {
  category: string;
  sizeClass: SizeClass;
  method: "parcel" | "freight";
  lowCents: number;
  typicalCents: number;
  highCents: number;
  pickupRecommended: boolean;
  basis: string;
};

export function classify(partText: string): { category: string; sizeClass: SizeClass } {
  const text = partText.trim().toLowerCase();
  for (const r of rules) if (r.re.test(text)) return { category: r.category, sizeClass: r.size_class };
  return { category: "Other", sizeClass: "medium" };
}

const cents = (d: number) => Math.round(d * 100);

export function estimateShipping(partText: string, opts: { residential?: boolean } = {}): ShippingEstimate {
  const { category, sizeClass } = classify(partText);
  if (sizeClass === "freight") {
    const extra = opts.residential ? RESIDENTIAL_FREIGHT_EXTRA : 0;
    return {
      category,
      sizeClass,
      method: "freight",
      lowCents: cents(FREIGHT.low + extra),
      typicalCents: cents(FREIGHT.typical + extra),
      highCents: cents(FREIGHT.high + extra),
      pickupRecommended: true,
      basis: opts.residential
        ? "Truck freight to a home address, including liftgate and residential delivery."
        : "Truck freight to a business address with a dock or forklift.",
    };
  }
  if (sizeClass === "oversize") {
    return {
      category,
      sizeClass,
      method: "parcel",
      lowCents: cents(OVERSIZE.low),
      typicalCents: cents(OVERSIZE.typical),
      highCents: cents(OVERSIZE.high),
      pickupRecommended: true,
      basis: "Oversize parcel — carriers add large-package fees for long or bulky boxes.",
    };
  }
  const own = history.categories[category];
  const stat = own && own.n >= 15 ? own : history.size_classes[sizeClass];
  return {
    category,
    sizeClass,
    method: "parcel",
    lowCents: cents(stat.p25),
    typicalCents: cents(stat.median),
    highCents: cents(stat.p75),
    pickupRecommended: false,
    basis: own && own.n >= 15 ? `Based on ${own.n} real shipments of this kind of part.` : `Based on real shipments of similar-size parts.`,
  };
}
