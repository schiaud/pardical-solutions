import { FoundingYardForm } from "./marketing/FoundingYardForm";
import { Icon } from "./marketing/Icon";

const onTheCall = [
  "We price five of your own parts live, against the market",
  "We walk you through a demo yard site and admin",
  "You get a straight quote. No pressure, no long contract",
];

export function CTA() {
  return (
    <section
      id="book-demo"
      className="relative scroll-mt-16 overflow-hidden bg-primary-dark px-4 py-20 sm:px-6 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary-light/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div className="lg:pt-6">
          <p className="text-sm font-semibold tracking-wider text-accent-light uppercase">
            Founding yards
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Book your 15-minute demo.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            We&apos;re setting up our first 5 yards at founding-yard rates.
            Tell us a little about your yard and we&apos;ll call you.
          </p>

          <h3 className="mt-10 text-sm font-semibold tracking-wider text-white/50 uppercase">
            On the call
          </h3>
          <ul className="mt-4 space-y-3">
            {onTheCall.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/85">
                <Icon
                  name="check"
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                  strokeWidth={2.5}
                />
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
          <FoundingYardForm />
        </div>
      </div>
    </section>
  );
}
