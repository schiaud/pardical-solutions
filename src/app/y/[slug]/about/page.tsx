import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getYardBySlug, hoursLines } from "@/lib/yards";

export const metadata: Metadata = { title: "About, warranty & returns" };

export default async function About({ params }: { params: Promise<{ slug: string }> }) {
  const yard = getYardBySlug((await params).slug);
  if (!yard) notFound();
  const map = encodeURIComponent([yard.address, yard.city, yard.state, yard.zip].filter(Boolean).join(", "));
  const sections: [string, string][] = [
    ["About us", yard.about_text],
    ["Warranty", yard.warranty_text],
    ["Returns", yard.returns_text],
    ["Pickup & shipping", yard.pickup_note],
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-slate-900">{yard.name}</h1>
        {sections
          .filter(([, t]) => t)
          .map(([h, t]) => (
            <section key={h}>
              <h2 className="text-lg font-bold text-slate-900">{h}</h2>
              <p className="mt-2 text-slate-700 leading-relaxed whitespace-pre-line">{t}</p>
            </section>
          ))}
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="font-semibold text-slate-900">Visit</p>
          <p className="mt-1 text-slate-700">{yard.address}</p>
          <p className="text-slate-700">{[yard.city, yard.state, yard.zip].filter(Boolean).join(", ")}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${map}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">
            Directions →
          </a>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="font-semibold text-slate-900">Hours</p>
          <ul className="mt-1 text-slate-700 space-y-1">
            {hoursLines(yard).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="font-semibold text-slate-900">Contact</p>
          {yard.phone && <p className="mt-1 text-slate-700">{yard.phone}</p>}
          {yard.email && <p className="text-slate-700">{yard.email}</p>}
        </div>
      </aside>
    </div>
  );
}
