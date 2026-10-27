import { Icon, type IconName } from "../marketing/Icon";
import { SectionHeading } from "../marketing/SectionHeading";

const painPoints: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "warning",
    title: "Late shipments and tracking defects",
    body: "Miss a ship-by date or upload tracking late and eBay counts it against you. Enough of them and your whole account pays for it.",
  },
  {
    icon: "banknotes",
    title: "Cash stuck on hold",
    body: "When eBay holds your payout until the part is delivered, an order with no tracking is money you can't touch.",
  },
  {
    icon: "chat",
    title: "Buyers asking twice",
    body: "A buyer who hasn't heard from you writes again. Then opens a case. Every one of those is a defect waiting to happen.",
  },
  {
    icon: "clock",
    title: "Yards that go quiet",
    body: "You paid, the yard said it ships today, and now nobody picks up. Days go by before anyone notices.",
  },
  {
    icon: "trendingDown",
    title: "Prices that drift",
    body: "Yard prices and shipping go up. Your listing doesn't. You find out when an order loses money.",
  },
  {
    icon: "copy",
    title: "A day of copy-paste",
    body: "car-part.com, email, eBay, the label site, back to email. Your day goes to moving the same order between tabs.",
  },
];

export function BrokerProblems() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Sound familiar?"
          title="The sale is the easy part."
          subtitle="After the buyer pays, the real work starts. Here's where brokers lose time, money and feedback."
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
              <h3 className="mt-5 text-lg font-bold text-slate-900">{point.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{point.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center">
          <a
            href="#what-it-does"
            className="group inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-light"
          >
            See how Pardical handles it
            <Icon
              name="arrowRight"
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              strokeWidth={2}
            />
          </a>
        </p>
      </div>
    </section>
  );
}
