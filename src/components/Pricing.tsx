const plans = [
  {
    name: "Starter",
    monthlyPrice: 500,
    annualPrice: 4000,
    annualSavings: 2000,
    users: "Up to 5 users",
    description: "Everything a small brokerage needs to go from spreadsheets to software.",
    features: [
      "Order & ticket management",
      "Real-time Car-Part.com pricing",
      "Warehouse tracking",
      "Employee performance dashboards",
      "Customer management",
      "Shipment tracking",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 800,
    annualPrice: 7500,
    annualSavings: 2100,
    users: "Up to 15 users",
    description: "Full platform with advanced automation for growing operations.",
    features: [
      "Everything in Starter",
      "Bank reconciliation (Chase/QuickBooks)",
      "Automatic refund tracking",
      "eBay listing & messaging",
      "Liquidation management",
      "AI-powered reply templates",
      "Priority support & training",
    ],
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark">
            Simple, Flat-Rate Pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            No per-seat fees, no hidden costs. One price for your whole team.
            Pay annually and save over $2,000.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-primary text-white ring-4 ring-primary/20 scale-[1.02]"
                  : "bg-white border border-slate-200"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block mb-4 px-3 py-1 bg-accent rounded-full text-xs font-bold text-primary-dark uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <h3 className={`text-2xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                {plan.name}
              </h3>

              <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/70" : "text-slate-500"}`}>
                {plan.users}
              </p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-primary"}`}>
                    ${plan.monthlyPrice}
                  </span>
                  <span className={plan.highlighted ? "text-white/70" : "text-slate-500"}>/mo</span>
                </div>
                <div className={`mt-1 text-sm ${plan.highlighted ? "text-white/70" : "text-slate-500"}`}>
                  or ${plan.annualPrice.toLocaleString()}/yr{" "}
                  <span className={`font-semibold ${plan.highlighted ? "text-accent-light" : "text-green-600"}`}>
                    (save ${plan.annualSavings.toLocaleString()})
                  </span>
                </div>
              </div>

              <p className={`mt-5 text-sm leading-relaxed ${plan.highlighted ? "text-white/80" : "text-slate-600"}`}>
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlighted ? "text-accent-light" : "text-green-500"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className={plan.highlighted ? "text-white/90" : "text-slate-700"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-8 block text-center font-semibold py-3.5 rounded-xl transition-colors ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-slate-100"
                    : "bg-primary text-white hover:bg-primary-light"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-slate-500 text-sm">
          All plans include setup, onboarding, and team training at no extra cost.
          <br />
          30-day pilot available — see the value before you commit.
        </p>
      </div>
    </section>
  );
}
