import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getYardBySlug } from "@/lib/yards";
import { getPart, searchParts } from "@/lib/parts";
import { linkBase } from "@/lib/site";
import { gradeLabel, money, partTitle, photosOf } from "@/lib/format";
import { estimateShipping } from "@/lib/shipping";
import RequestPartForm from "./RequestPartForm";
import PartCard from "../../PartCard";

type Params = Promise<{ slug: string; id: string }>;

/** Creative Commons credit for photos the yard didn't take itself. Stored as "text|source url". */
function PhotoCredit({ credit }: { credit: string }) {
  if (!credit) return null;
  const [text, url] = credit.split("|");
  return (
    <p className="mt-2 text-[11px] text-slate-400">
      {/^(sample )?photo:/i.test(text) ? "" : "Photo: "}
      {url ? <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-slate-600">{text}</a> : text}
    </p>
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, id } = await params;
  const yard = await getYardBySlug(slug);
  const part = yard && (await getPart(yard.id, Number(id)));
  if (!part) return {};
  return { title: `${partTitle(part)} — ${money(part.price_cents)}`, description: part.description.slice(0, 160) };
}

export default async function PartPage({ params }: { params: Params }) {
  const { slug, id } = await params;
  const yard = await getYardBySlug(slug);
  if (!yard) notFound();
  const part = await getPart(yard.id, Number(id));
  if (!part) notFound();
  const base = await linkBase(yard);
  const photos = photosOf(part);
  const ship = estimateShipping(part.part_type);
  const shipResidential = estimateShipping(part.part_type, { residential: true });
  const related = (await searchParts(yard.id, { make: part.make, model: part.model, limit: 5 })).parts.filter((p) => p.id !== part.id).slice(0, 4);
  const driveline = /engine|transmission|transaxle|transfer case|differential/i.test(part.part_type);
  const warrantyOptions = driveline
    ? ["Standard 90-day warranty (included)", "6-month warranty (+15%)", "1-year warranty (+25%)"]
    : ["Standard 90-day warranty (included)"];
  const sold = part.status !== "available";

  const specs: [string, string][] = [
    ["Fits", [part.year, part.make, part.model].filter(Boolean).join(" ")],
    ["Part", part.part_type],
    ["Grade", gradeLabel(part.grade)],
    ["Donor mileage", part.mileage != null ? `${part.mileage.toLocaleString()} miles` : ""],
    ["Interchange", part.interchange],
    ["OEM part #", part.oem_number],
    ["Donor VIN", part.donor_vin],
    ["Stock #", part.stock_no],
    ["Core charge", part.core_charge_cents ? `${money(part.core_charge_cents)} (refunded when your old part comes back)` : ""],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-slate-500">
        <Link href={`${base}/parts`} className="hover:underline">Parts</Link>
        {part.make && (
          <>
            {" / "}
            <Link href={`${base}/parts?make=${encodeURIComponent(part.make)}`} className="hover:underline">{part.make}</Link>
          </>
        )}
        {part.model && (
          <>
            {" / "}
            <Link href={`${base}/parts?make=${encodeURIComponent(part.make)}&model=${encodeURIComponent(part.model)}`} className="hover:underline">
              {part.model}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[0] ?? `${base}/parts/${part.id}/image`}
            alt={partTitle(part)}
            className="w-full aspect-[4/3] object-cover rounded-2xl border border-slate-200 bg-slate-100"
          />
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.slice(1, 9).map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt="" className="aspect-square object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          )}
          {!photos.length && <p className="mt-2 text-xs text-slate-500">Photo of the actual part available on request — call or text us.</p>}
          <PhotoCredit credit={part.photo_credit} />

          <h2 className="mt-8 text-lg font-bold text-slate-900">Details</h2>
          <dl className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          {part.description && <p className="mt-4 text-slate-700 leading-relaxed">{part.description}</p>}
          <p className="mt-4 text-sm text-slate-500">
            Used parts vary — please confirm fitment with your VIN or the interchange number before ordering. Questions? Call {yard.phone}.
          </p>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
            <p className="text-sm text-slate-500">{[part.year, part.make, part.model].filter(Boolean).join(" ")}</p>
            <h1 className="text-2xl font-bold text-slate-900">{part.part_type}</h1>
            <p className="mt-3 text-3xl font-bold text-slate-900">{money(part.price_cents)}</p>
            {part.core_charge_cents > 0 && <p className="text-sm text-slate-500">+ {money(part.core_charge_cents)} refundable core</p>}

            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">Shipping</p>
              {ship.method === "freight" ? (
                <ul className="mt-1 space-y-1 text-slate-700">
                  <li>Truck freight to a business: about {money(ship.lowCents)}–{money(ship.highCents)}</li>
                  <li>To a home (liftgate): about {money(shipResidential.lowCents)}–{money(shipResidential.highCents)}</li>
                  <li className="font-medium text-emerald-700">Free pickup at the yard</li>
                </ul>
              ) : ship.pickupRecommended ? (
                <ul className="mt-1 space-y-1 text-slate-700">
                  <li>Oversize box: about {money(ship.lowCents)}–{money(ship.highCents)}</li>
                  <li className="font-medium text-emerald-700">Free pickup at the yard</li>
                </ul>
              ) : (
                <p className="mt-1 text-slate-700">
                  Usually {money(ship.lowCents)}–{money(ship.highCents)} anywhere in the lower 48. Free pickup at the yard.
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">{ship.basis} Exact total confirmed before you pay.</p>
            </div>

            <div className="mt-5">
              {sold ? (
                <p className="rounded-lg bg-amber-50 text-amber-900 p-3 text-sm">This part was just sold or is on hold. Call {yard.phone} — we may have another.</p>
              ) : (
                <RequestPartForm slug={yard.slug} partId={part.id} canShip={ship.method === "parcel"} warrantyOptions={warrantyOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">More from this {part.make} {part.model}</h2>
          <div className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-4">
            {related.map((p) => (
              <PartCard key={p.id} part={p} base={base} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
