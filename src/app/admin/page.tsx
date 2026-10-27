import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listYards } from "@/lib/yards";
import { stats } from "@/lib/parts";
import { leadData, listLeads, newLeadCounts } from "@/lib/leads";
import { centralTime } from "@/lib/format";
import { logout, setFoundingLeadStatus } from "./actions";
import AddYardForm from "./AddYardForm";
import type { Lead } from "@/lib/types";

export const metadata: Metadata = { title: "Yards — Pardical" };

export default async function OperatorHome() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role === "owner") redirect(`/admin/${session.yard}`);
  const yards = listYards();
  const founding = listLeads(null, "founding_yard", 100);
  const brokers = listLeads(null, "broker_demo", 100);

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold">Pardical · Operator</span>
          <form action={logout}>
            <button className="text-sm text-white/80 hover:text-white">Sign out</button>
          </form>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">Yards</h1>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2">Yard</th>
                  <th className="px-4 py-2">Parts live</th>
                  <th className="px-4 py-2">Unpriced</th>
                  <th className="px-4 py-2">New leads</th>
                  <th className="px-4 py-2">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yards.map((y) => {
                  const s = stats(y.id);
                  const leads = Object.values(newLeadCounts(y.id)).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={y.id}>
                      <td className="px-4 py-2">
                        <Link href={`/admin/${y.slug}`} className="font-semibold text-primary hover:underline">
                          {y.name}
                        </Link>
                        <span className="ml-2 text-slate-400">{y.slug}</span>
                      </td>
                      <td className="px-4 py-2">{s.available.toLocaleString()}</td>
                      <td className="px-4 py-2">{s.unpriced}</td>
                      <td className="px-4 py-2">{leads}</td>
                      <td className="px-4 py-2">
                        <Link href={y.custom_domain ? `https://${y.custom_domain}` : `/y/${y.slug}`} className="text-primary hover:underline" target="_blank">
                          {y.custom_domain || `/y/${y.slug}`}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 max-w-xl">
            <AddYardForm />
          </div>
        </section>

        <DemoRequests title="Founding-yard requests (pardical.com)" leads={founding} />
        <DemoRequests title="Broker requests (pardical.com/brokers)" leads={brokers} />
      </div>
    </div>
  );
}

function DemoRequests({ title, leads }: { title: string; leads: Lead[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {leads.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">None yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {leads.map((l) => {
            const d = leadData(l);
            const business = String(d.yardName ?? d.businessName ?? "");
            const details =
              l.kind === "broker_demo"
                ? [d.ebayStore ? `eBay: ${String(d.ebayStore)}` : "", d.ordersPerMonth ? `${String(d.ordersPerMonth)} orders/mo` : ""]
                : [[d.city, d.state].filter(Boolean).join(", "), d.yardSoftware ? `uses ${String(d.yardSoftware)}` : ""];
            return (
              <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm flex flex-wrap gap-4 justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {business} — {l.name}
                  </p>
                  <p className="text-slate-600">{[l.phone, l.email, ...details].filter(Boolean).join(" · ")}</p>
                  {d.message ? <p className="mt-1 text-slate-700">{String(d.message)}</p> : null}
                  <p className="mt-1 text-xs text-slate-400">{centralTime(l.created_at)}</p>
                </div>
                <form action={setFoundingLeadStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={l.id} />
                  <select name="status" defaultValue={l.status} className="rounded-md border border-slate-300 px-2 py-1">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button className="rounded-md border border-slate-300 px-2 py-1 hover:border-primary">Save</button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
