import Image from "next/image";

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
          <div className="rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden">
            <Image
              src="/screenshots/orders.png"
              alt="Pardical Solutions — Order management dashboard showing real-time order tracking, supplier details, and fulfillment status"
              width={1440}
              height={900}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { src: "/screenshots/performance.png", label: "Employee Performance" },
            { src: "/screenshots/warehouse-inventory.png", label: "Warehouse Inventory" },
            { src: "/screenshots/messages.png", label: "eBay Messages" },
            { src: "/screenshots/shipments.png", label: "Shipment Tracking" },
          ].map((item) => (
            <div key={item.label} className="group cursor-pointer">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-md group-hover:shadow-xl group-hover:border-primary/30 transition-all duration-300">
                <Image
                  src={item.src}
                  alt={item.label}
                  width={720}
                  height={450}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
