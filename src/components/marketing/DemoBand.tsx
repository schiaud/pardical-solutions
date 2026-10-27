import Link from "next/link";
import { Icon } from "./Icon";

export function DemoBand() {
  return (
    <section
      id="demo"
      className="scroll-mt-16 bg-white px-4 pb-20 sm:px-6 sm:pb-28"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary-dark px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-wider text-accent-light uppercase">
              Live demo
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
              Click around a demo yard.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">
              No sign-up. See what your buyers would see, and what you would
              see behind the counter.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/y/demo"
              className="group flex flex-col rounded-2xl bg-white p-6 shadow-xl shadow-black/20 transition-transform hover:-translate-y-0.5"
            >
              <Icon name="storefront" className="h-7 w-7 text-primary" />
              <p className="mt-4 text-lg font-bold text-slate-900">
                Demo yard site
              </p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">
                What buyers see: search by vehicle, part pages, shipping
                estimates and chat.
              </p>
              <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-primary-dark transition-colors group-hover:bg-accent-light">
                See a demo yard site
                <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2} />
              </span>
            </Link>

            <Link
              href="/admin/demo"
              className="group flex flex-col rounded-2xl border border-white/15 bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <Icon name="chart" className="h-7 w-7 text-accent-light" />
              <p className="mt-4 text-lg font-bold text-white">Demo admin</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-white/70">
                What you see: suggested prices to approve, your listings and
                every lead.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Open the demo admin
                <Icon
                  name="arrowRight"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
