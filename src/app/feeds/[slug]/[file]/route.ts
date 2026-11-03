import { getYardBySlug } from "@/lib/yards";
import { allAvailable } from "@/lib/parts";
import { ebayFile, googleFeed, metaCatalogFeed } from "@/lib/channels";
import { absoluteYardBase } from "@/lib/site";

// Public, fetched on a schedule by Google Merchant Center and Meta Commerce Manager.
const FEEDS = {
  "google.tsv": { build: googleFeed, type: "text/tab-separated-values; charset=utf-8" },
  "meta.csv": { build: metaCatalogFeed, type: "text/csv; charset=utf-8" },
  "ebay.csv": { build: ebayFile, type: "text/csv; charset=utf-8" },
} as const;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; file: string }> }) {
  const { slug, file } = await ctx.params;
  const feed = FEEDS[file as keyof typeof FEEDS];
  const yard = await getYardBySlug(slug);
  if (!feed || !yard) return new Response("Not found", { status: 404 });
  const body = feed.build(yard, await allAvailable(yard.id), await absoluteYardBase(yard));
  return new Response(body, {
    headers: {
      "content-type": feed.type,
      "cache-control": "public, max-age=900",
      ...(file === "ebay.csv" ? { "content-disposition": `attachment; filename="${yard.slug}-ebay.csv"` } : {}),
    },
  });
}
