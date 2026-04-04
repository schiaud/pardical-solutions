"use client";

import Image from "next/image";
import { useState } from "react";

const screenshots = [
  { src: "/screenshots/orders.png", label: "Order Management" },
  { src: "/screenshots/performance.png", label: "Employee Performance" },
  { src: "/screenshots/warehouse-inventory.png", label: "Warehouse Inventory" },
  { src: "/screenshots/messages.png", label: "eBay Messages" },
  { src: "/screenshots/shipments.png", label: "Shipment Tracking" },
];

export function Hero() {
  const [active, setActive] = useState(0);

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

        {/* Main screenshot */}
        <div className="mt-16 relative">
          <div className="rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden">
            <Image
              src={screenshots[active].src}
              alt={screenshots[active].label}
              width={1440}
              height={900}
              className="w-full h-auto"
              priority
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-primary">
            {screenshots[active].label}
          </p>
        </div>

        {/* Thumbnail selector */}
        <div className="mt-8 grid grid-cols-5 gap-3">
          {screenshots.map((item, i) => (
            <button
              key={item.label}
              onClick={() => setActive(i)}
              className={`group cursor-pointer text-left transition-all duration-200 ${
                i === active
                  ? "ring-2 ring-primary rounded-xl scale-[1.02]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-md">
                <Image
                  src={item.src}
                  alt={item.label}
                  width={720}
                  height={450}
                  className="w-full h-auto"
                />
              </div>
              <p className={`mt-2 text-xs font-medium text-center transition-colors ${
                i === active ? "text-primary" : "text-slate-500"
              }`}>
                {item.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
