import type { ReactNode } from "react";
import { Icon, type IconName } from "../marketing/Icon";
import { SectionHeading } from "../marketing/SectionHeading";

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
          <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={2} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CardTitle({ icon, title, lead }: { icon: IconName; title: string; lead: string }) {
  return (
    <>
      <CardIcon name={icon} />
      <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 leading-relaxed text-slate-600">{lead}</p>
    </>
  );
}

function SampleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {children}
    </p>
  );
}

const card =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8";

// Sample data for the small panels. Made up; no real orders.
const needsYou = [
  { order: "#2431", text: "Yard hasn't confirmed in 24 hours", tone: "bg-amber-500" },
  { order: "#2418", text: "Ship-by is today, no tracking yet", tone: "bg-red-500" },
  { order: "#2402", text: "Return request, reply due Friday", tone: "bg-slate-400" },
];

const margin = [
  { label: "List price", value: "$214.95" },
  { label: "Part cost (yard)", value: "−$95.00" },
  { label: "eBay fees", value: "−$28.78" },
  { label: "Shipping label", value: "−$24.60" },
];

export function BrokerFeatures() {
  return (
    <section id="what-it-does" className="scroll-mt-16 bg-surface px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="What it does"
          title="An assistant that never drops an order."
          subtitle="It works every order from sale to delivery, answers your buyers and keeps your prices honest. You decide how much it does on its own."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Every order tracked */}
          <div className={`${card} md:col-span-2`}>
            <div className="grid gap-8 md:grid-cols-2 md:items-start">
              <div>
                <CardTitle
                  icon="clipboardList"
                  title="Every order tracked, start to finish"
                  lead="Each sale becomes a ticket with everything in one place. Nothing lives in someone's head or a spreadsheet."
                />
                <Checklist
                  items={[
                    "The buyer, the part and the supplier",
                    "Your cost, the label and the tracking",
                    "The ship-by deadline, front and center",
                  ]}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-surface p-4">
                <SampleLabel>Sample · What needs you today</SampleLabel>
                <ul className="mt-3 space-y-2">
                  {needsYou.map((item) => (
                    <li
                      key={item.order}
                      className="flex items-start gap-3 rounded-lg bg-white p-3 text-sm ring-1 ring-slate-200"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.tone}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="font-semibold text-slate-900">{item.order}</span>
                        <span className="text-slate-600"> · {item.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="check" className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                  Everything else is on track.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Orders that move themselves */}
          <div className={card}>
            <CardTitle
              icon="bolt"
              title="Orders that move themselves"
              lead="From sale to shipped, without the copy-paste."
            />
            <Checklist
              items={[
                "Sources the part, sends the quote request and reads the yard's email reply",
                "Handles the card authorization form and a prepaid blind-ship label, so the yard ships straight to your buyer",
                "For new parts, places the order with the retailer, inside spending limits you set",
              ]}
            />
          </div>

          {/* 3. Shipments and tracking */}
          <div className={card}>
            <CardTitle
              icon="truck"
              title="Shipments and tracking, handled"
              lead="Tracking goes to eBay before the ship-by date."
            />
            <Checklist
              items={[
                "Labels bought at the right size",
                "Chases yards that haven't shipped and flags carrier problems",
                "Calls out missing tracking fast, because eBay can hold your money until delivery",
              ]}
            />
          </div>

          {/* 4. eBay managed to the T */}
          <div className={`${card} md:col-span-2`}>
            <div className="grid gap-8 md:grid-cols-2 md:items-start">
              <div>
                <CardTitle
                  icon="shield"
                  title="eBay, managed to the T"
                  lead="Fast, straight answers for your buyers, and an account that stays healthy."
                />
                <Checklist
                  items={[
                    "Buyer messages answered in minutes: fitment and VIN questions before the sale, “where’s my part” after",
                    "Returns, cases and disputes caught with their deadlines",
                    "Account health watched: late shipment rate, tracking upload, item not received",
                  ]}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-surface p-4">
                <SampleLabel>Sample · Buyer messages</SampleLabel>
                <p className="mt-3 text-xs font-medium text-slate-500">Before the sale</p>
                <p className="mt-1.5 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                  Will this fit my 2015 Silverado 1500, 5.3?
                </p>
                <p className="mt-2 max-w-[90%] rounded-2xl rounded-bl-sm bg-primary px-3 py-2 text-sm text-white">
                  It came off a 2015 Silverado 1500 with the 5.3. Send your VIN
                  and we&apos;ll confirm the part number before you buy.
                </p>
                <p className="mt-4 text-xs font-medium text-slate-500">After the sale</p>
                <p className="mt-1.5 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                  Where&apos;s my part?
                </p>
                <p className="mt-2 max-w-[90%] rounded-2xl rounded-bl-sm bg-primary px-3 py-2 text-sm text-white">
                  It shipped Tuesday. The carrier shows delivery Friday, and
                  the tracking is on your order.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Proactive, never pushy */}
          <div className={card}>
            <CardTitle
              icon="bell"
              title="Proactive, never pushy"
              lead="Your buyer hears from you at the moments that matter."
            />
            <Checklist
              items={[
                "When it ships, with real tracking",
                "A heads-up if something runs late, before they have to ask",
                "A straight answer if they write twice",
                "No spam, no fake promises. It never invents stock, fitment or delivery dates.",
              ]}
            />
            <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-500">
              Too quiet and buyers open cases. Too chatty and they leave bad
              feedback. It stays in between.
            </p>
          </div>

          {/* 6. Repricing */}
          <div className={`${card} lg:col-span-2`}>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div>
                <CardTitle
                  icon="tag"
                  title="Repricing that protects your margin"
                  lead="Modest, steady markups that keep parts selling, checked against what the part really costs you."
                />
                <Checklist
                  items={[
                    "Your real cost from yards and retailers, plus eBay fees and real shipping",
                    "Slim-margin listings flagged before they lose money",
                    "Revised in place, never ended and relisted",
                    "Sold-out listings brought back",
                  ]}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-surface p-4">
                <SampleLabel>Sample · Margin check</SampleLabel>
                <div className="mt-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-slate-900">
                    Power Steering Pump, 2016 Ram 1500
                  </p>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    {margin.map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <dt className="text-slate-500">{row.label}</dt>
                        <dd className="font-medium text-slate-800 tabular-nums">{row.value}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 border-t border-slate-100 pt-2">
                      <dt className="font-semibold text-slate-900">Left for you</dt>
                      <dd className="font-bold text-emerald-700 tabular-nums">$66.57</dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 text-sm ring-1 ring-slate-200">
                  <span className="text-slate-700">Tail light, 2019 Camry</span>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    Slim margin · flagged
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. You stay in control */}
          <div className="relative overflow-hidden rounded-2xl bg-primary-dark p-6 text-white sm:p-10 md:col-span-2 lg:col-span-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-primary-light/60 blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary-dark">
                  <Icon name="adjustments" className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold sm:text-3xl">You stay in control.</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-white/75">
                  Every new task starts by proposing, and you approve. It earns
                  autopilot one task at a time, once it has proven itself.
                  Spending money always stays inside limits you set.
                </p>
              </div>
              <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { title: "It proposes", body: "The reply, the quote request, the price change. You look it over and approve." },
                  { title: "It proves itself", body: "You watch it get your real orders right." },
                  { title: "You switch on autopilot", body: "Task by task, only where you choose." },
                ].map((item, i) => (
                  <li key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-accent-light">
                      {i + 1}. {item.title}
                    </p>
                    <p className="mt-1 text-sm text-white/70">{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
