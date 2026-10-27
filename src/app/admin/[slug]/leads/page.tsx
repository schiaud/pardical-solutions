import Link from "next/link";
import { requireYardAdmin } from "@/lib/auth";
import { leadData, listLeads } from "@/lib/leads";
import { chatTranscript, recentChats } from "@/lib/chat";
import { centralTime } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { isDemoYard } from "@/lib/yards";
import { updateLead } from "../../actions";

// In the public demo admin, visitors' contact details and free text are hidden from other visitors.
const SAFE_IN_DEMO = new Set(["part", "price", "delivery", "warranty", "vehicle", "runs", "title", "pickup"]);
const scrub = (text: string) =>
  text.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "•••@•••").replace(/(\+?\d[\d\s().-]{6,}\d)/g, "•••");

function LeadRow({ lead, slug, masked }: { lead: Lead; slug: string; masked: boolean }) {
  const d = leadData(lead);
  const lines = Object.entries(d).filter(([k, v]) => v !== "" && v != null && (!masked || SAFE_IN_DEMO.has(k)));
  return (
    <div className={`rounded-xl border bg-white p-4 text-sm ${lead.status === "new" ? "border-accent" : "border-slate-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {masked ? (
            <p className="font-semibold text-slate-900">Visitor (contact details hidden in the public demo)</p>
          ) : (
            <p className="font-semibold text-slate-900">
              {lead.name} · <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="text-primary hover:underline">{lead.phone}</a>
              {lead.email && <span className="font-normal text-slate-500"> · {lead.email}</span>}
              {lead.zip && <span className="font-normal text-slate-500"> · ZIP {lead.zip}</span>}
            </p>
          )}
          <dl className="mt-1 grid grid-cols-[90px_1fr] gap-x-2 text-slate-700">
            {lines.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-slate-500 capitalize">{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-1 text-xs text-slate-400">{centralTime(lead.created_at)}</p>
        </div>
        <form action={updateLead} className="flex items-center gap-2">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={lead.id} />
          <select name="status" defaultValue={lead.status} className="rounded-md border border-slate-300 px-2 py-1">
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
          <button className="rounded-md border border-slate-300 px-2 py-1 hover:border-primary">Save</button>
        </form>
      </div>
    </div>
  );
}

export default async function Leads({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ chat?: string }> }) {
  const { slug } = await params;
  const { yard, session } = await requireYardAdmin(slug);
  const masked = isDemoYard(yard.slug) && session.role === "owner";
  const { chat } = await searchParams;
  const requests = listLeads(yard.id, "part_request");
  const cars = listLeads(yard.id, "sell_car");
  const chats = recentChats(yard.id);
  const transcript = chat ? chatTranscript(yard.id, chat) : [];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Part requests ({requests.length})</h2>
        <p className="text-sm text-slate-500">Confirm the part is on the shelf, then text a payment link or hold it for pickup.</p>
        {requests.length ? requests.map((l) => <LeadRow key={l.id} lead={l} slug={yard.slug} masked={masked} />) : <p className="text-sm text-slate-500">None yet.</p>}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Cars to buy ({cars.length})</h2>
        {cars.length ? cars.map((l) => <LeadRow key={l.id} lead={l} slug={yard.slug} masked={masked} />) : <p className="text-sm text-slate-500">None yet.</p>}

        <h2 className="pt-6 text-lg font-bold text-slate-900">Website chats ({chats.length})</h2>
        {chats.length === 0 ? (
          <p className="text-sm text-slate-500">No chats yet.</p>
        ) : (
          <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 text-sm">
            {chats.map((c) => (
              <li key={c.session_id}>
                <Link href={`?chat=${c.session_id}`} className={`block px-4 py-2 hover:bg-slate-50 ${chat === c.session_id ? "bg-slate-50" : ""}`}>
                  <span className="text-slate-800">{masked ? scrub(c.first_question) : c.first_question}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {c.n} messages · {centralTime(c.last)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {transcript.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
            {transcript.map((m, i) => (
              <p key={i} className={m.role === "user" ? "text-slate-900" : "text-slate-600 pl-4 border-l-2 border-slate-200 whitespace-pre-line"}>
                <span className="font-semibold">{m.role === "user" ? "Buyer: " : "Chat: "}</span>
                {masked ? scrub(m.content) : m.content}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
