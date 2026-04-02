export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-white to-surface">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm font-medium text-amber-700">
          Built by a broker, for brokers
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-primary-dark leading-tight tracking-tight">
          The Operating System for
          <br />
          <span className="text-primary">Auto Parts Brokers</span>
        </h1>

        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Orders, pricing, warehouse, banking, eBay — all in one platform.
          Your team focuses on selling parts, not shuffling spreadsheets.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white text-lg font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Schedule a Demo
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto border-2 border-slate-300 hover:border-primary text-slate-700 hover:text-primary text-lg font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            See Features
          </a>
        </div>

        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 h-8 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 bg-slate-700 rounded h-4 max-w-xs" />
            </div>
            <div className="p-6 md:p-10">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Active Orders", value: "47", color: "bg-blue-50 text-blue-700" },
                  { label: "Ready to Ship", value: "12", color: "bg-green-50 text-green-700" },
                  { label: "Pending Returns", value: "5", color: "bg-amber-50 text-amber-700" },
                  { label: "Revenue Today", value: "$3,240", color: "bg-purple-50 text-purple-700" },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="text-sm mt-1 opacity-80">{card.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-16 h-4 bg-slate-200 rounded" />
                    <div className="flex-1 h-4 bg-slate-200 rounded max-w-xs" />
                    <div className="w-20 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-7 bg-green-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
