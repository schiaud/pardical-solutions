import { Icon, type IconName } from "./marketing/Icon";
import { SectionHeading } from "./marketing/SectionHeading";

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "calendar",
    title: "15-minute demo",
    body: "We price five of your own parts live, so you see real numbers for your yard.",
  },
  {
    icon: "upload",
    title: "Send your inventory export",
    body: "One file from Powerlink, Checkmate or Pinnacle. We'll show you where to find it.",
  },
  {
    icon: "globe",
    title: "Go live in about a week",
    body: "Your new site goes up on your domain, and your listings go out to eBay, Google and Facebook.",
  },
  {
    icon: "inbox",
    title: "Approve prices, watch the leads",
    body: "Approve suggested prices in bulk. Every part request, chat and sell-your-car lead comes to you.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 bg-white px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="Live in about a week."
          subtitle="Four steps. Most of the work is ours."
        />

        <div className="relative mt-14">
          {/* Connector line on wide screens */}
          <div
            aria-hidden="true"
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-slate-200 lg:block"
          />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, i) => (
            <li key={step.title} className="relative text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <Icon name={step.icon} className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary-dark ring-4 ring-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-slate-600">
                {step.body}
              </p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
