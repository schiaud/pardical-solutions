import { Icon, type IconName } from "./marketing/Icon";
import { SectionHeading } from "./marketing/SectionHeading";

const painPoints: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "phone",
    title: "Missed calls",
    body: "The phone rings while everyone is out in the yard. Industry research says yards miss 15–40% of their calls, sometimes more. Each one is a buyer who calls the next yard.",
  },
  {
    icon: "archive",
    title: "Parts sitting unlisted",
    body: "The parts are pulled and on the shelf, but they're not online. If a buyer can't find it, it doesn't sell.",
  },
  {
    icon: "tag",
    title: "Prices all over the place",
    body: "The same part gets a different price depending on who picks up the phone. Too high and it sits. Too low and you leave money on the table.",
  },
  {
    icon: "user",
    title: "The owner does everything",
    body: "Pricing, listing, answering questions, shipping. It all runs through you, so there's no time left to grow.",
  },
  {
    icon: "window",
    title: "A website that can't take an order",
    body: "Your site shows your hours and a phone number. A buyer searching at 10 p.m. moves on to someone who lets them find the part.",
  },
];

export function Problem() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Sound familiar?"
          title="The parts are on your shelves. The buyers are online."
          subtitle="Good parts on the shelf don't help if buyers can't find them or can't reach you. Here's where sales slip away."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Icon name={point.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {point.title}
              </h3>
              <p className="mt-2 leading-relaxed text-slate-600">{point.body}</p>
            </div>
          ))}

          <a
            href="#what-you-get"
            className="group flex flex-col justify-between rounded-2xl bg-primary p-6 text-white transition-colors hover:bg-primary-light sm:p-7"
          >
            <div>
              <h3 className="text-lg font-bold">There&apos;s a simpler way.</h3>
              <p className="mt-2 leading-relaxed text-white/75">
                We put your parts online everywhere, price them from the market
                and answer buyers for you. You stay in charge.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-light">
              See what you get
              <Icon
                name="arrowRight"
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                strokeWidth={2}
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
