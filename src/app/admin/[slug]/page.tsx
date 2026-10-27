import Link from "next/link";
import { requireYardAdmin } from "@/lib/auth";
import { stats } from "@/lib/parts";
import { listLeads, newLeadCounts } from "@/lib/leads";
import { facebookQueue } from "@/lib/channels";
import { centralTime, money } from "@/lib/format";
import { isDemoYard } from "@/lib/yards";

export default async function YardOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { yard, session } = await requireYardAdmin(slug);
  const masked = isDemoYard(yard.slug) && session.role === "owner";
  const s = stats(yard.id);
  const leads = newLeadCounts(yard.id);
  const fb = facebookQueue(yard.id);
  const latest = listLeads(yard.id, undefined, 6);
  const a = `/admin/${yard.slug}`;

  const cards: [string, string, string][] = [
    ["Parts live", s.available.toLocaleString(), `${money(s.valueCents)} listed value`],
    ["Need a price", String(s.unpriced), "Hidden from feeds until priced"],
    ["Price suggestions", String(s.suggestions), "Waiting for your OK"],
    ["New leads", String(Object.values(leads).reduce((x, y) => x + y, 0)), `${leads.part_request ?? 0} part requests · ${leads.sell_car ?? 0} cars`],
  ];
  const todo = [
    s.available === 0 && { text: "Import your inventory export from Powerlink, Checkmate or Pinnacle", href: `${a}/inventory` },
    s.suggestions > 0 && { text: `Approve ${s.suggestions} price suggestions`, href: `${a}/pricing` },
    s.unpriced > 0 && { text: `${s.unpriced} parts have no price — run price research`, href: `${a}/pricing` },
    fb.today.length > 0 && { text: `Post today's ${fb.today.length} Facebook Marketplace listings (${fb.postedToday}/${fb.dailyTarget} done)`, href: `${a}/channels#facebook` },
    (leads.part_request ?? 0) > 0 && { text: `Call back ${leads.part_request} part requests`, href: `${a}/leads` },
    (leads.sell_car ?? 0) > 0 && { text: `Make offers on ${leads.sell_car} cars`, href: `${a}/leads` },
    !yard.custom_domain && { text: "Connect your own domain", href: `${a}/settings` },
  ].filter(Boolean) as { text: string; href: string }[];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl bg-white border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Today</h2>
          {todo.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {todo.map((t) => (
                <li key={t.text}>
                  <Link href={t.href} className="flex justify-between gap-3 py-2.5 text-sm text-slate-700 hover:text-primary">
                    {t.text} <span>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">All caught up.</p>
          )}
        </section>
        <section className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Latest leads</h2>
          {latest.length ? (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {latest.map((l) => (
                <li key={l.id} className="py-2.5 flex justify-between gap-3">
                  <span>
                    <span className="font-medium text-slate-800">{l.kind === "part_request" ? "Part request" : l.kind === "sell_car" ? "Car to buy" : "Lead"}</span>
                    {masked ? " · contact hidden in demo" : ` · ${l.name} · ${l.phone}`}
                  </span>
                  <span className="text-slate-400 shrink-0">{centralTime(l.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No leads yet — they show up here the moment a buyer asks.</p>
          )}
        </section>
      </div>
    </div>
  );
}
