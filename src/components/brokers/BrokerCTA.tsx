import Link from "next/link";
import { Icon } from "../marketing/Icon";
import { BrokerDemoForm } from "./BrokerDemoForm";

const onTheCall = [
  "We look at your eBay account and order flow together",
  "We show you which tasks we'd take off your plate first",
  "You get a straight quote sized to your volume. No long contract.",
];

export function BrokerCTA() {
  return (
    <section
      id="book-call"
      className="relative scroll-mt-16 overflow-hidden bg-primary-dark px-4 py-20 sm:px-6 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary-light/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div className="lg:pt-6">
          <p className="text-sm font-semibold tracking-wider text-accent-light uppercase">
            Book a call
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Let&apos;s look at your orders together.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            Tell us a little about your store and we&apos;ll call you. We run
            an eBay parts business ourselves, so we&apos;ll speak your language.
          </p>

          <h3 className="mt-10 text-sm font-semibold tracking-wider text-white/50 uppercase">
            On the call
          </h3>
          <ul className="mt-4 space-y-3">
            {onTheCall.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/85">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 flex items-center gap-2 text-sm text-white/60">
            <Icon name="mail" className="h-5 w-5 shrink-0" />
            <span>
              Prefer email?{" "}
              <a
                href="mailto:david@pardical.com"
                className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent"
              >
                david@pardical.com
              </a>
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
          <BrokerDemoForm />
        </div>
      </div>
    </section>
  );
}

export function RecyclerCrossLink() {
  return (
    <div className="border-t border-slate-200 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:flex-row sm:gap-3 sm:px-6">
        <span className="flex items-center gap-2 text-slate-600">
          <Icon name="storefront" className="h-5 w-5 shrink-0 text-primary-light" />
          Run a salvage yard?
        </span>
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-light"
        >
          See what we do for recyclers
          <Icon
            name="arrowRight"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            strokeWidth={2}
          />
        </Link>
      </div>
    </div>
  );
}
