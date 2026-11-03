import { requireYardAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { money, partTitle } from "@/lib/format";
import { marketConfigured } from "@/lib/pricing";
import type { Part } from "@/lib/types";
import { approvePrices, runMarketCheck, runPriceResearch, savePrice } from "../../actions";
import { SelectAll, SubmitButton } from "../../ui";

async function MarketCheck({ yardId, slug }: { yardId: number; slug: string }) {
  const priced = (await db()
    .prepare("select * from parts where yard_id = ? and status = 'available' and price_cents is not null order by suggested_at is not null, price_cents desc limit 40")
    .all(yardId)) as Part[];
  return (
    <details className="rounded-xl bg-white border border-slate-200 p-5">
      <summary className="cursor-pointer font-semibold text-slate-900">Check priced parts against the market (up to 5 at a time, about a minute each)</summary>
      <form action={runMarketCheck} className="mt-3 space-y-2">
        <input type="hidden" name="slug" value={slug} />
        <div className="grid gap-1 sm:grid-cols-2 text-sm">
          {priced.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input type="checkbox" name="ids" value={p.id} />
              {partTitle(p)} <span className="text-slate-400">— {money(p.price_cents)}</span>
            </label>
          ))}
        </div>
        <SubmitButton pendingText="Checking the market…">Run live market check</SubmitButton>
      </form>
    </details>
  );
}

export default async function Pricing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { yard } = await requireYardAdmin(slug);
  const pending = (await db()
    .prepare(
      `select * from parts where yard_id = ? and status = 'available' and suggested_price_cents is not null
         and (price_cents is null or suggested_price_cents <> price_cents)
       order by (price_cents is null) desc, abs(coalesce(price_cents,0) - suggested_price_cents) desc limit 300`,
    )
    .all(yard.id)) as Part[];
  const unpriced = ((await db().prepare("select count(*) as n from parts where yard_id = ? and status = 'available' and price_cents is null").get(yard.id)) as { n: number }).n;
  const market = marketConfigured();

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-xl font-bold text-slate-900">Price suggestions</h1>
          <p className="mt-1 text-sm text-slate-600">
            Parts with no price get a starting price from their part type, vehicle age, grade and mileage.{" "}
            {market
              ? "Live market checks compare any part with what the same part is listed for on Car-Part.com and eBay right now."
              : "Live market checks (Car-Part.com + eBay comps) switch on when the Pardical pricing tool is connected."}{" "}
            Nothing changes on your website until you approve it. {unpriced > 0 && <b>{unpriced} parts have no price yet.</b>}
          </p>
        </div>
        <form action={runPriceResearch}>
          <input type="hidden" name="slug" value={yard.slug} />
          <SubmitButton pendingText="Researching…">Price the unpriced parts</SubmitButton>
        </form>
      </div>

      {market && <MarketCheck yardId={yard.id} slug={yard.slug} />}

      {pending.length === 0 ? (
        <p className="text-sm text-slate-500">No suggestions waiting. Run price research after each inventory import.</p>
      ) : (
        <form className="rounded-xl bg-white border border-slate-200 overflow-x-auto">
          <input type="hidden" name="slug" value={yard.slug} />
          <div className="flex flex-wrap items-center gap-3 p-3 border-b border-slate-100 bg-slate-50">
            <button formAction={approvePrices} className="rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary-light">
              Approve selected
            </button>
            {market && (
              <button formAction={runMarketCheck} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:border-primary">
                Live market check (up to 5 selected)
              </button>
            )}
            <span className="text-xs text-slate-500">{pending.length} waiting</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">
                  <SelectAll />
                </th>
                <th className="px-3 py-2">Part</th>
                <th className="px-3 py-2">Now</th>
                <th className="px-3 py-2">Suggested</th>
                <th className="px-3 py-2">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pending.map((p) => {
                const diff = p.price_cents == null ? null : ((p.suggested_price_cents! - p.price_cents) / p.price_cents) * 100;
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2">
                      <input type="checkbox" name="ids" value={p.id} defaultChecked={p.price_cents == null} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-800">{partTitle(p)}</span>
                      <span className="ml-2 text-xs text-slate-400">#{p.stock_no}</span>
                    </td>
                    <td className="px-3 py-2">{p.price_cents == null ? <span className="text-amber-600">none</span> : money(p.price_cents)}</td>
                    <td className="px-3 py-2 font-semibold">
                      {money(p.suggested_price_cents)}
                      {diff != null && (
                        <span className={`ml-1 text-xs ${diff > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {diff > 0 ? "+" : ""}
                          {Math.round(diff)}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500 max-w-md">
                      <span className={`mr-1 rounded px-1.5 py-0.5 font-medium ${p.suggestion_source === "market" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {p.suggestion_source === "market" ? "market" : "estimate"}
                      </span>
                      {p.suggestion_note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </form>
      )}

      <details className="rounded-xl bg-white border border-slate-200 p-5 text-sm">
        <summary className="cursor-pointer font-semibold text-slate-900">Set one price by hand</summary>
        <form action={savePrice} className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="slug" value={yard.slug} />
          <input name="id" placeholder="Part id (from the website URL)" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input name="price" placeholder="$ price" className="rounded-lg border border-slate-300 px-3 py-2 w-28" />
          <SubmitButton>Save price</SubmitButton>
        </form>
      </details>
    </div>
  );
}
