import { Icon, type IconName } from "../marketing/Icon";
import { SectionHeading } from "../marketing/SectionHeading";

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "calendar",
    title: "20-minute call",
    body: "We look at your eBay account and your order flow together, and show you what we'd take off your plate first.",
  },
  {
    icon: "link",
    title: "Connect eBay and your parts email",
    body: "So it can see your orders, your buyer messages and your suppliers' replies.",
  },
  {
    icon: "inbox",
    title: "It starts in propose mode",
    body: "On your real orders, it drafts each step and you approve. Nothing goes out without you.",
  },
  {
    icon: "bolt",
    title: "Turn on autopilot, task by task",
    body: "Once a task has proven itself, switch it on. Keep the rest on propose as long as you like.",
  },
];

export function BrokerHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="From first call to autopilot."
          subtitle="Four steps. Nothing runs on its own until you say so."
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
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
