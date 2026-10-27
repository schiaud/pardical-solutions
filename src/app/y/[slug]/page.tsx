import Link from "next/link";
import { notFound } from "next/navigation";
import { getYardBySlug, hoursLines } from "@/lib/yards";
import { facets, searchParts, stats } from "@/lib/parts";
import { linkBase } from "@/lib/site";
import SearchForm from "./SearchForm";
import PartCard from "./PartCard";

export default async function YardHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const yard = getYardBySlug(slug);
  if (!yard) notFound();
  const base = await linkBase(yard);
  const f = facets(yard.id);
  const recent = searchParts(yard.id, { limit: 8 }).parts;
  const s = stats(yard.id);

  return (
    <>
      <section className="relative bg-[var(--brand)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-24">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{yard.city ? `${yard.city}, ${yard.state}` : "Used OEM auto parts"}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold max-w-3xl leading-tight">{yard.tagline || `Quality used OEM parts from ${yard.name}`}</h1>
          <p className="mt-4 text-lg opacity-90 max-w-2xl">
            {s.available.toLocaleString()} parts in stock, graded and priced. Ship nationwide or pick up at our counter.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-14 relative z-10">
        <SearchForm action={`${base}/parts`} makes={f.makes} models={f.models} years={f.years} partTypes={f.partTypes} />
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["Graded & tested", "Every part is pulled, inspected and graded A, B or C by our team — mileage listed where we have it."],
          ["Warranty included", yard.warranty_text.split(". ")[0] + "."],
          ["Ship or pick up", "Small parts ship in a day or two. Engines, transmissions and body panels go by freight or pick up free."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-slate-200 p-5">
            <p className="font-semibold text-slate-900">{t}</p>
            <p className="mt-1 text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Just in</h2>
          <Link href={`${base}/parts`} className="text-sm font-semibold text-[var(--brand)] hover:underline">
            See all parts →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 grid-cols-2 md:grid-cols-4">
          {recent.map((p) => (
            <PartCard key={p.id} part={p} base={base} />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-900 text-white p-8">
          <h2 className="text-2xl font-bold">Got a car to get rid of?</h2>
          <p className="mt-2 text-slate-300">Running or not, title in hand — tell us about it and we&apos;ll call you with an offer, usually the same day. We can tow it away.</p>
          <Link href={`${base}/sell-your-car`} className="mt-5 inline-block rounded-lg bg-white text-slate-900 font-semibold px-5 py-2.5 hover:bg-slate-100">
            Get an offer
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900">Visit the yard</h2>
          <p className="mt-2 text-slate-600">
            {yard.address}, {yard.city}, {yard.state} {yard.zip}
          </p>
          <ul className="mt-3 text-sm text-slate-600 space-y-1">
            {hoursLines(yard).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-600">{yard.pickup_note}</p>
        </div>
      </section>
    </>
  );
}
