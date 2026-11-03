import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getYardBySlug } from "@/lib/yards";
import { facets, searchParts } from "@/lib/parts";
import { linkBase } from "@/lib/site";
import { decodeVin } from "@/lib/vin";
import SearchForm from "../SearchForm";
import PartCard from "../PartCard";

export const metadata: Metadata = { title: "Search parts" };

type SP = Promise<{ [k: string]: string | string[] | undefined }>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || "";

export default async function PartsPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: SP }) {
  const { slug } = await params;
  const yard = await getYardBySlug(slug);
  if (!yard) notFound();
  const base = await linkBase(yard);
  const sp = await searchParams;
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const query = { year: Number(one(sp.year)) || null, make: one(sp.make), model: one(sp.model), part: one(sp.part), q: one(sp.q) };

  let vinNote = "";
  const vinRaw = one(sp.vin);
  if (vinRaw) {
    const v = await decodeVin(vinRaw);
    if (v) {
      query.year = v.year;
      query.make = v.make;
      // Model names differ between NHTSA and yard systems ("Silverado" vs "Silverado 1500"): match on the first word.
      query.model = "";
      query.q = [query.q, v.model.split(" ")[0]].filter(Boolean).join(" ");
      vinNote = `VIN ${v.vin}: ${[v.year, v.make, v.model, v.trim, v.engine].filter(Boolean).join(" ")}`;
    } else vinNote = "We couldn't decode that VIN — showing all parts. Double-check the 17 characters or call us.";
  }

  const perPage = 24;
  const { parts, total } = await searchParts(yard.id, { ...query, limit: perPage, offset: (page - 1) * perPage });
  const f = await facets(yard.id);
  const pages = Math.ceil(total / perPage);
  const qs = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...query, year: query.year ?? "" })) if (v) u.set(k, String(v));
    if (p > 1) u.set("page", String(p));
    return u.toString();
  };
  const filters = [query.year, query.make, query.model, query.part, query.q].filter(Boolean).join(" ");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{filters ? `Parts for ${filters}` : "All parts in stock"}</h1>
      {vinNote && <p className="mt-2 text-sm rounded-lg bg-blue-50 text-blue-800 px-3 py-2 inline-block">{vinNote}</p>}
      <div className="mt-4">
        <SearchForm
          compact
          action={`${base}/parts`}
          makes={f.makes}
          models={f.models}
          years={f.years}
          partTypes={f.partTypes}
          initial={{ year: query.year ? String(query.year) : "", make: query.make, model: query.model, part: query.part, q: query.q }}
        />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        {total.toLocaleString()} {total === 1 ? "part" : "parts"} found
      </p>
      {parts.length ? (
        <div className="mt-3 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {parts.map((p) => (
            <PartCard key={p.id} part={p} base={base} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-lg font-semibold text-slate-800">Not on the shelf yet — but it might be in the yard.</p>
          <p className="mt-2 text-slate-600">
            New cars come in every week. Call {yard.phone} or use the chat button and we&apos;ll check for you.
          </p>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2 text-sm">
          {page > 1 && (
            <Link href={`${base}/parts?${qs(page - 1)}`} className="rounded-lg border px-3 py-1.5">
              ← Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={`${base}/parts?${qs(page + 1)}`} className="rounded-lg border px-3 py-1.5">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
