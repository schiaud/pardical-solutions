import { ImageResponse } from "next/og";
import { getYardBySlug } from "@/lib/yards";
import { getPart } from "@/lib/parts";
import { classify } from "@/lib/shipping";

// Placeholder product image (PNG) for parts without photos yet — used on the site and in Google/Meta feeds,
// which reject listings with no image. Real photos from the yard's system replace it automatically.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await ctx.params;
  const yard = await getYardBySlug(slug);
  const part = yard ? await getPart(yard.id, Number(id)) : null;
  if (!yard || !part) return new Response("Not found", { status: 404 });
  const { sizeClass } = classify(part.part_type);
  const brand = yard.brand_color || "#1e3a5f";
  const vehicle = [part.year, part.make, part.model].filter(Boolean).join(" ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f1f5f9", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", background: brand, color: "white", padding: "28px 40px", fontSize: 30, fontWeight: 700 }}>{yard.name}</div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "0 48px" }}>
          <div style={{ fontSize: 34, color: "#475569" }}>{vehicle}</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#0f172a", marginTop: 8, lineHeight: 1.1 }}>{part.part_type}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 28, fontSize: 28 }}>
            {part.grade ? <div style={{ display: "flex", background: "#d1fae5", color: "#065f46", padding: "8px 18px", borderRadius: 12 }}>Grade {part.grade}</div> : null}
            {part.mileage ? (
              <div style={{ display: "flex", background: "#e2e8f0", color: "#334155", padding: "8px 18px", borderRadius: 12 }}>{Math.round(part.mileage / 1000)}k miles</div>
            ) : null}
            <div style={{ display: "flex", background: "#e2e8f0", color: "#334155", padding: "8px 18px", borderRadius: 12 }}>Stock #{part.stock_no}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 40px", fontSize: 24, color: "#64748b" }}>
          <span>Used OEM · {sizeClass === "freight" || sizeClass === "oversize" ? "Freight or local pickup" : "Ships nationwide"}</span>
          <span>{yard.phone}</span>
        </div>
      </div>
    ),
    { width: 1000, height: 750 },
  );
}
