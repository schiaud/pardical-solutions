import { requireYardAdmin } from "@/lib/auth";
import { allAvailable } from "@/lib/parts";
import { blockedOnEbay, blockedOnFacebook, facebookQueue, marketplaceListing } from "@/lib/channels";
import { absoluteYardBase, origin } from "@/lib/site";
import { money, partTitle } from "@/lib/format";
import { toggleFbPosted } from "../../actions";
import { CopyButton } from "../../ui";

export default async function Channels({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { yard } = await requireYardAdmin(slug);
  const all = allAvailable(yard.id);
  const priced = all.filter((p) => p.price_cents != null);
  const app = await origin();
  const siteBase = await absoluteYardBase(yard);
  const fb = facebookQueue(yard.id);
  const feeds = [
    {
      name: "Google Shopping (free listings)",
      url: `${app}/feeds/${yard.slug}/google.tsv`,
      count: priced.length,
      how: "Merchant Center → Products → Add products → Add from a file → Scheduled fetch → paste this URL (daily).",
    },
    {
      name: "Facebook & Instagram catalog (for catalog ads)",
      url: `${app}/feeds/${yard.slug}/meta.csv`,
      count: priced.filter((p) => !blockedOnFacebook(p)).length,
      how: "Commerce Manager → Catalog → Data sources → Data feed → Scheduled feed → paste this URL. Catalog ads can show on Marketplace and link to your website.",
    },
    {
      name: "eBay listing file (Sellersperch import)",
      url: `${app}/feeds/${yard.slug}/ebay.csv`,
      count: priced.filter((p) => !blockedOnEbay(p)).length,
      how: "Import into Sellersperch (or eBay bulk tools) to create or update listings. Airbags are left out — eBay bans them.",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-bold text-slate-900">Where your parts are listed</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your website is the home base. These feeds update themselves from it — when a part sells or is marked sold, it drops off every channel on the next fetch.
          Parts without a price stay off the feeds.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-white border border-slate-200 p-5">
            <p className="font-semibold text-slate-900">Your website</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{all.length.toLocaleString()}</p>
            <p className="text-xs text-slate-500">parts live · {siteBase.replace(/^https?:\/\//, "")}</p>
          </div>
          {feeds.map((f) => (
            <div key={f.name} className="rounded-xl bg-white border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">{f.name}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{f.count.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs">{f.url}</code>
                <CopyButton text={f.url} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{f.how}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="facebook" className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Facebook Marketplace — today&apos;s posts</h2>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Facebook doesn&apos;t let software post to Marketplace for you, so we write each listing and you (or a helper) post it from the yard&apos;s Facebook
              profile — about 2 minutes each. Pace is {fb.dailyTarget} a day to keep the account safe. Big parts come first: Marketplace buyers love local pickup on
              engines, transmissions and body panels.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {fb.postedToday}/{fb.dailyTarget} posted today · {fb.remaining} not posted yet
          </p>
        </div>

        {fb.today.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{fb.remaining === 0 ? "Everything priced is posted." : "Today's posts are done — come back tomorrow."}</p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {fb.today.map((p) => {
              const l = marketplaceListing(p, yard, siteBase);
              return (
                <div key={p.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{l.title}</p>
                    <form action={toggleFbPosted}>
                      <input type="hidden" name="slug" value={yard.slug} />
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="posted" value="1" />
                      <button className="shrink-0 rounded-md bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 hover:bg-emerald-700">Mark posted</button>
                    </form>
                  </div>
                  <dl className="grid grid-cols-[90px_1fr_auto] gap-x-2 gap-y-1 text-sm items-center">
                    {(
                      [
                        ["Title", l.title],
                        ["Price", `$${l.price}`],
                        ["Category", l.category],
                        ["Condition", l.condition],
                        ["Delivery", l.delivery],
                        ["Location", l.location],
                      ] as [string, string][]
                    ).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-slate-500">{k}</dt>
                        <dd className="text-slate-800 truncate">{v}</dd>
                        <CopyButton text={k === "Price" ? l.price : v} />
                      </div>
                    ))}
                  </dl>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Description</span>
                      <CopyButton text={l.description} />
                    </div>
                    <pre className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs text-slate-700">{l.description}</pre>
                  </div>
                  <a href={`${siteBase}/parts/${p.id}/image`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    Download the listing image ↗
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {fb.repostDue.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-900">Due for a repost (posted 30+ days ago)</p>
            <ul className="mt-2 text-sm text-slate-600 space-y-1">
              {fb.repostDue.slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  {partTitle(p)} — {money(p.price_cents)}
                  <form action={toggleFbPosted}>
                    <input type="hidden" name="slug" value={yard.slug} />
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="posted" value="1" />
                    <button className="text-xs text-primary hover:underline">Reposted</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
        {fb.blocked.length > 0 && (
          <p className="mt-6 text-xs text-slate-500">
            Kept off Facebook ({fb.blocked.length}): {fb.blocked.map((p) => p.part_type).join(", ")} — Facebook bans catalytic converters, airbags and emissions
            parts.
          </p>
        )}
      </section>
    </div>
  );
}
