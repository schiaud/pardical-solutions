export function Problem() {
  const painPoints = [
    {
      before: "Manually checking Chase statements every day",
      after: "Bank charges auto-matched to orders in real time",
    },
    {
      before: "Spreadsheets to track orders, returns, and shipments",
      after: "One dashboard with live status on every ticket",
    },
    {
      before: "Calling suppliers and searching Car-Part.com by hand",
      after: "Instant pricing from Car-Part.com built into every order",
    },
    {
      before: "No visibility into which employees are productive",
      after: "Performance metrics per employee, per day, per task",
    },
    {
      before: "Checking if supplier refund credits ever came back",
      after: "Automatic 30-day refund tracking with overdue alerts",
    },
    {
      before: "Listing parts on eBay one at a time",
      after: "Integrated eBay listing and message management",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark">
            Your VAs Are Spending Hours on Work That Should Be Automatic
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Every hour spent on manual data entry, statement checking, and spreadsheet juggling
            is an hour not spent finding and selling parts.
          </p>
        </div>

        <div className="space-y-4">
          {painPoints.map((point, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-0 md:gap-4 items-stretch">
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-center gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-sm">
                  ✕
                </div>
                <span className="text-slate-700">{point.before}</span>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                  ✓
                </div>
                <span className="text-slate-700">{point.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
