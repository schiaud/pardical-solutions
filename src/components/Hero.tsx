import Link from "next/link";
import { HeroMock } from "./marketing/HeroMock";
import { Icon } from "./marketing/Icon";

const reassurances = [
  "Your own domain",
  "No new software to learn",
  "Live in about a week",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary-dark pt-28 pb-24 sm:pt-36 sm:pb-32">
      {/* Background: soft glow + faint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[32rem] w-[32rem] translate-x-1/3 rounded-full bg-primary-light/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/3 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            For full-service auto recyclers
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-balance text-white sm:text-6xl">
            Sell more parts, <span className="text-accent">faster.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-white/75 lg:mx-0">
            We put your yard&apos;s parts everywhere buyers shop: a brand-new
            website and parts store on your own domain, eBay, Facebook
            Marketplace and Google Shopping. Prices come from live market data.
            AI answers the questions.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/y/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 text-base font-bold text-primary-dark shadow-lg shadow-accent/20 transition-colors hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              See a demo yard site
              <Icon name="arrowRight" className="h-5 w-5" strokeWidth={2} />
            </Link>
            <a
              href="#book-demo"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-7 py-4 text-base font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Book a demo
            </a>
          </div>

          <p className="mt-4 text-sm text-white/60">
            Or look behind the counter:{" "}
            <Link
              href="/admin/demo"
              className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent"
            >
              Demo admin
            </Link>
          </p>

          <ul className="mt-10 flex flex-col items-center gap-3 text-sm text-white/80 sm:flex-row sm:justify-center sm:gap-6 lg:justify-start">
            {reassurances.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Icon
                  name="check"
                  className="h-4 w-4 text-accent"
                  strokeWidth={2.5}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroMock />
      </div>
    </section>
  );
}
