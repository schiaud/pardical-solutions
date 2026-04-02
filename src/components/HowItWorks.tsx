const steps = [
  {
    number: "01",
    title: "We Set It Up For You",
    description:
      "We configure the platform for your business — your suppliers, your eBay account, your QuickBooks. Takes about a day. You don't touch any code.",
  },
  {
    number: "02",
    title: "Your Team Starts Working",
    description:
      "Your employees log in and start managing orders immediately. The interface is simple — if they can use a spreadsheet, they can use this. We train your team.",
  },
  {
    number: "03",
    title: "Watch Efficiency Climb",
    description:
      "Automated pricing, bank reconciliation, and order tracking mean your VAs handle 2-3x the volume. You see the results in real-time performance dashboards.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark">
            Up and Running in Days, Not Months
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            No complex IT projects. No consultants. We handle the setup and your team
            starts using it immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-slate-200 -translate-x-1/2 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold mb-5">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
