import { Icon, type IconName } from "./marketing/Icon";
import { SectionHeading } from "./marketing/SectionHeading";

function CardIcon({ name }: { name: IconName }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon name={name} className="h-6 w-6" />
    </div>
  );
}

function Checklist({ items, columns = false }: { items: string[]; columns?: boolean }) {
  return (
    <ul
      className={`mt-5 grid gap-x-6 gap-y-2.5 text-[0.95rem] text-slate-700 ${
        columns ? "sm:grid-cols-2" : ""
      }`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <Icon
            name="check"
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
            strokeWidth={2}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const card =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8";

export function Features() {
  return (
    <section
      id="what-you-get"
      className="scroll-mt-16 bg-surface px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="What you get"
          title="Your parts, everywhere buyers shop."
          subtitle="One setup. We build it, connect it and keep it running. You approve prices and answer the leads."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Website and store */}
          <div className={`${card} md:col-span-2`}>
            <CardIcon name="storefront" />
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              A new website and parts store on your own domain
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              It replaces your old site. Buyers can find and request parts any
              time, not just when someone picks up the phone.
            </p>
            <Checklist
              columns
              items={[
                "Search by year, make, model, part or VIN",
                "Grade, mileage and donor vehicle on every part",
                "Warranty options on every part page",
                "A shipping estimate on every part page",
                "A “sell us your car” page",
                "Your hours, locations and warranty info",
              ]}
            />
          </div>

          {/* 2. List everywhere */}
          <div className={card}>
            <CardIcon name="share" />
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              List everywhere
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              Your store feeds eBay, Google Shopping (free listings) and
              Facebook.
            </p>
            <Checklist
              items={[
                "Facebook catalog feed for ads",
                "A daily Marketplace kit: ready-to-post listings for local pickup",
                "When a part sells in one place, it comes off the others",
              ]}
            />
          </div>

          {/* 3. Prices */}
          <div className={card}>
            <CardIcon name="dollar" />
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Prices from the market, not guesswork
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              Every part gets a suggested price built from what the same part
              sells for on eBay and Car-Part.com, adjusted for grade and
              mileage.
            </p>
            <Checklist items={["You approve the suggestions in bulk"]} />
          </div>

          {/* 4. Shipping */}
          <div className={card}>
            <CardIcon name="truck" />
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Real shipping costs
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              Estimates come from thousands of real used-part shipments, by
              part type.
            </p>
            <Checklist
              items={[
                "Bulky and freight parts default to local pickup or a freight quote, so you never give away margin on a bumper",
              ]}
            />
          </div>

          {/* 5. AI answers */}
          <div className={card}>
            <CardIcon name="chat" />
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Answers for buyers, 24/7
            </h3>
            <p className="mt-2 leading-relaxed text-slate-600">
              Website chat answers &ldquo;Do you have it? Does it fit?
              What&apos;s shipping?&rdquo; from your live inventory.
            </p>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-surface p-4">
              <Icon name="phone" className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="text-sm text-slate-600">
                <span className="mr-1.5 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  Coming soon
                </span>
                AI that picks up your parts calls, too.
              </p>
            </div>
          </div>

          {/* 6. Done for you */}
          <div className="relative overflow-hidden rounded-2xl bg-primary-dark p-6 text-white sm:p-10 md:col-span-2 lg:col-span-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-primary-light/60 blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary-dark">
                  <Icon name="badgeCheck" className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold sm:text-3xl">
                  Done for you. No new software to learn.
                </h3>
                <p className="mt-3 max-w-xl leading-relaxed text-white/75">
                  Send us your inventory export from Hollander Powerlink,
                  Car-Part.com Checkmate or CCC Pinnacle. We build and run
                  everything. You approve prices and see every lead.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { title: "We build it", body: "Site, store and listings, set up from your export." },
                  { title: "We run it", body: "Feeds, prices and chat kept up to date." },
                  { title: "You stay in charge", body: "Approve prices. See every lead." },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-semibold text-accent-light">{item.title}</p>
                    <p className="mt-1 text-sm text-white/70">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
