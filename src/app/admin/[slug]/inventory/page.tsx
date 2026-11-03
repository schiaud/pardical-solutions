import Link from "next/link";
import { requireYardAdmin } from "@/lib/auth";
import { searchParts } from "@/lib/parts";
import { money } from "@/lib/format";
import type { PartStatus } from "@/lib/types";
import { changeStatus } from "../../actions";
import ImportForm from "./ImportForm";

type SP = Promise<{ q?: string; status?: string; page?: string }>;

export default async function Inventory({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: SP }) {
  const { slug } = await params;
  const { yard } = await requireYardAdmin(slug);
  const sp = await searchParams;
  const status = (["available", "held", "sold", "all"].includes(sp.status ?? "") ? sp.status : "available") as PartStatus | "all";
  const page = Math.max(1, Number(sp.page) || 1);
  const { parts, total } = await searchParts(yard.id, { q: sp.q, status, limit: 50, offset: (page - 1) * 50 });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section>
        <form className="flex flex-wrap gap-2">
          <input name="q" defaultValue={sp.q} placeholder="Search stock #, part, make, interchange…" className="flex-1 min-w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select name="status" defaultValue={status} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="available">On the shelf</option>
            <option value="held">On hold</option>
            <option value="sold">Sold</option>
            <option value="all">All</option>
          </select>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">Filter</button>
        </form>
        <p className="mt-3 text-sm text-slate-500">{total.toLocaleString()} parts</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Stock #</th>
                <th className="px-3 py-2">Part</th>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2">Miles</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parts.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-mono text-xs">{p.stock_no}</td>
                  <td className="px-3 py-2">
                    <Link href={`/y/${yard.slug}/parts/${p.id}`} target="_blank" className="hover:text-primary">
                      <span className="text-slate-500">{[p.year, p.make, p.model].filter(Boolean).join(" ")}</span> <span className="font-medium">{p.part_type}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2">{p.grade}</td>
                  <td className="px-3 py-2">{p.mileage?.toLocaleString() ?? ""}</td>
                  <td className="px-3 py-2">{p.price_cents == null ? <span className="text-amber-600">none</span> : money(p.price_cents)}</td>
                  <td className="px-3 py-2">
                    <form action={changeStatus} className="flex items-center gap-1">
                      <input type="hidden" name="slug" value={yard.slug} />
                      <input type="hidden" name="id" value={p.id} />
                      <select name="status" defaultValue={p.status} className="rounded border border-slate-300 px-1 py-0.5 text-xs">
                        <option value="available">Shelf</option>
                        <option value="held">Hold</option>
                        <option value="sold">Sold</option>
                      </select>
                      <button className="text-xs text-primary hover:underline">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 50 && (
          <div className="mt-3 flex gap-3 text-sm">
            {page > 1 && <Link href={`?${new URLSearchParams({ q: sp.q ?? "", status, page: String(page - 1) })}`}>← Previous</Link>}
            <span className="text-slate-500">Page {page} of {Math.ceil(total / 50)}</span>
            {page * 50 < total && <Link href={`?${new URLSearchParams({ q: sp.q ?? "", status, page: String(page + 1) })}`}>Next →</Link>}
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Import inventory</h2>
          <p className="mt-1 text-sm text-slate-600">
            Export your parts from Powerlink, Checkmate or Pinnacle as CSV (or any spreadsheet saved as CSV). Re-import anytime — we match on stock # and update.
          </p>
          <div className="mt-4">
            <ImportForm slug={yard.slug} />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Columns we read</p>
          <p className="mt-1">
            Stock #, Year, Make, Model, Part, Description/Notes, Interchange, OEM #, Grade, Miles, VIN, Price, Core, Location, Image URLs, Status. Header names can vary — we
            match common names automatically.
          </p>
        </div>
      </aside>
    </div>
  );
}
