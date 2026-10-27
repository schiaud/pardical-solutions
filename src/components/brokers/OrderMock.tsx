import { Icon } from "../marketing/Icon";

// An illustration of one order ticket. Sample data only: no real buyer,
// yard or order.
const facts = [
  { label: "Buyer", value: "Columbus, OH" },
  { label: "Supplier", value: "Salvage yard, Joliet, IL" },
  { label: "Cost / sold", value: "$142 / $259" },
  { label: "Ship by", value: "Wed, 5:00 PM" },
];

const steps: { time: string; title: string; detail: string; highlight?: boolean }[] = [
  { time: "9:14 AM", title: "Sold on eBay", detail: "$259.00, buyer paid" },
  {
    time: "9:22 AM",
    title: "Quote requests sent",
    detail: "3 yards with the part in stock",
  },
  {
    time: "10:05 AM",
    title: "Yard confirmed",
    detail: "$142, read from the yard's email reply",
  },
  {
    time: "10:18 AM",
    title: "Card form and prepaid label sent",
    detail: "Blind ship, straight to your buyer",
  },
  {
    time: "2:41 PM",
    title: "Shipped, tracking on eBay",
    detail: "1Z 8V2 ··· 4471, a day before ship-by",
    highlight: true,
  },
  { time: "2:42 PM", title: "Buyer updated", detail: "With the real tracking number" },
];

export function OrderMock() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-white/50 uppercase lg:text-left">
        Sample order
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
        {/* Ticket header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              Order #2417 · Sold 9:14 AM
            </p>
            <p className="truncate font-bold text-slate-900">
              ABS Pump Module, 2014 Ford F-150
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            On track
          </span>
        </div>

        {/* Ticket facts */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-100 px-4 py-4 text-sm sm:grid-cols-4 sm:px-6">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs text-slate-400">{fact.label}</dt>
              <dd className="truncate font-medium text-slate-800">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {/* Timeline */}
        <ol className="px-4 py-5 sm:px-6">
          {steps.map((step) => (
            <li key={step.title} className="relative flex gap-3 pb-4">
              {/* Connector line */}
              <span
                aria-hidden="true"
                className="absolute top-6 bottom-0 left-[11.5px] w-px bg-slate-200"
              />
              <span
                className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  step.highlight
                    ? "bg-accent text-primary-dark"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p
                    className={`text-sm font-semibold ${
                      step.highlight ? "text-primary-dark" : "text-slate-800"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">{step.time}</p>
                </div>
                <p className="text-xs text-slate-500">{step.detail}</p>
              </div>
            </li>
          ))}
          <li className="flex gap-3">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400"
              aria-hidden="true"
            >
              <Icon name="truck" className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500">Delivery</p>
              <p className="text-xs text-slate-400">Watching the carrier until it lands</p>
            </div>
          </li>
        </ol>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-slate-200 bg-surface px-4 py-3 text-xs sm:px-6 md:justify-end">
          <Icon name="badgeCheck" className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-medium text-slate-600">Needs you: nothing</span>
        </div>
      </div>

      {/* Buyer update */}
      <div className="relative mt-4 rounded-2xl bg-white p-4 shadow-xl shadow-black/30 ring-1 ring-slate-200 md:absolute md:-bottom-24 md:-left-10 md:mt-0 md:w-72">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Icon name="chat" className="h-4 w-4" />
          Message to buyer · 2:42 PM
        </p>
        <p className="mt-3 max-w-[95%] rounded-2xl rounded-bl-sm bg-primary px-3 py-2 text-sm text-white">
          Good news: your ABS module shipped today. The tracking number is on
          your eBay order. Message us any time.
        </p>
      </div>
    </div>
  );
}
