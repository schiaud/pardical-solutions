import Image from "next/image";
import { Icon } from "./Icon";

// An illustration of a yard's part page. Sample data; the photo is a real used part
// (BMW 5 Series G30 LCI LED headlight) by UAB Partecha, CC BY-SA 4.0, via Wikimedia Commons.
const PHOTO_CREDIT_URL = "https://commons.wikimedia.org/wiki/File:Car_headlamp.png";

const specs = [
  { label: "Grade", value: "A" },
  { label: "Mileage", value: "38,950 mi" },
  { label: "Donor vehicle", value: "2021 BMW 530i" },
  { label: "Warranty", value: "90 days + options" },
];

const channels = ["eBay", "Google Shopping", "Facebook"];

export function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-white/50 uppercase lg:text-left">
        Sample part page
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
        {/* Browser bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
            yourYard.com/parts/bmw-530i-led-headlight
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Vehicle search */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1 text-slate-400">
              <Icon name="search" className="h-4 w-4" />
            </span>
            {["2021", "BMW", "530i", "Headlight"].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-surface-dark px-2.5 py-1 text-slate-700"
              >
                {chip}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-slate-400">
              or VIN
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-[8.5rem_1fr]">
            <figure className="min-w-0">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 sm:aspect-square">
                <Image
                  src="/marketing/headlight-bmw-g30-led.png"
                  alt="Used LED headlight assembly, removed from the car"
                  width={500}
                  height={500}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <figcaption className="mt-1 text-[10px] leading-tight text-slate-400">
                Photo:{" "}
                <a href={PHOTO_CREDIT_URL} target="_blank" rel="noreferrer" className="underline hover:text-slate-600">
                  UAB Partecha, CC BY-SA 4.0
                </a>
              </figcaption>
            </figure>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In stock
              </span>
              <h3 className="mt-2 text-lg leading-snug font-bold text-slate-900">
                LED Headlight Assembly
              </h3>
              <p className="text-sm text-slate-500">
                Fits 2021–2023 BMW 5 Series (G30)
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="min-w-0">
                    <dt className="text-xs text-slate-400">{spec.label}</dt>
                    <dd className="truncate font-medium text-slate-800">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-5">
            <div>
              <p className="text-2xl font-bold text-primary-dark">$895</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Icon name="truck" className="h-4 w-4" />
                Ships for about $25 to your zip
              </p>
            </div>
            <span className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
              Request this part
            </span>
          </div>
        </div>

        {/* Channels */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-surface px-4 py-3 text-xs sm:px-6">
          <span className="font-medium text-slate-500">Also listed on</span>
          {channels.map((channel) => (
            <span
              key={channel}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200"
            >
              <Icon name="check" className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
              {channel}
            </span>
          ))}
        </div>
      </div>

      {/* Chat bubble */}
      <div className="relative mt-4 rounded-2xl bg-white p-4 shadow-xl shadow-black/30 ring-1 ring-slate-200 md:absolute md:-bottom-36 md:-left-10 md:mt-0 md:w-72">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Icon name="chat" className="h-4 w-4" />
          Parts chat · answers 24/7
        </p>
        <p className="mt-3 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-surface-dark px-3 py-2 text-sm text-slate-700">
          Will this fit my 2022 530i?
        </p>
        <p className="mt-2 max-w-[90%] rounded-2xl rounded-bl-sm bg-primary px-3 py-2 text-sm text-white">
          It came off a 2021 530i — send your VIN and we&apos;ll confirm
          the fit. In stock, ships for about $25.
        </p>
      </div>
    </div>
  );
}
