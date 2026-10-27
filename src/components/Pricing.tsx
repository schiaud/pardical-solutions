import { Icon } from "./marketing/Icon";
import { SectionHeading } from "./marketing/SectionHeading";

// The price itself is not decided yet. Do not add dollar amounts here.
const terms = [
  { title: "One setup fee, then one monthly fee", body: "Both quoted on your demo call." },
  { title: "No long contract", body: "Stay because it's working, not because you're locked in." },
  { title: "Your domain always stays yours", body: "If you ever leave, your domain goes with you." },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-16 bg-surface px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing. No long contract."
        />

        <div className="mx-auto mt-14 grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 md:grid-cols-[1fr_1.1fr]">
          <div className="bg-primary-dark p-8 text-white sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wide text-primary-dark uppercase">
              Founding yards
            </span>
            <p className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Founding-yard rates for the first 5 yards.
            </p>
            <p className="mt-4 leading-relaxed text-white/75">
              Your exact price is quoted on the demo call, after we&apos;ve
              priced five of your parts together.
            </p>
            <a
              href="#book-demo"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-bold text-primary-dark transition-colors hover:bg-accent-light sm:w-auto"
            >
              Book a demo
              <Icon name="arrowRight" className="h-5 w-5" strokeWidth={2} />
            </a>
          </div>

          <ul className="flex flex-col justify-center gap-6 p-8 sm:p-10">
            {terms.map((term) => (
              <li key={term.title} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon name="check" className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{term.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{term.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
