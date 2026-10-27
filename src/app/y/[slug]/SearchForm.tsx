"use client";

import { useState } from "react";

type Props = {
  action: string;
  makes: string[];
  models: Record<string, string[]>;
  years: number[];
  partTypes: string[];
  initial?: { year?: string; make?: string; model?: string; part?: string; q?: string };
  compact?: boolean;
};

export default function SearchForm({ action, makes, models, years, partTypes, initial = {}, compact }: Props) {
  const [mode, setMode] = useState<"vehicle" | "vin">("vehicle");
  const [make, setMake] = useState(initial.make ?? "");
  const select = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]";

  return (
    <div className={compact ? "" : "rounded-2xl bg-white shadow-xl border border-slate-200 p-4 sm:p-5"}>
      {!compact && (
        <div className="flex gap-2 mb-4 text-sm font-semibold">
          <button type="button" onClick={() => setMode("vehicle")} className={`px-3 py-1.5 rounded-full ${mode === "vehicle" ? "bg-[var(--brand)] text-white" : "bg-slate-100 text-slate-600"}`}>
            By vehicle
          </button>
          <button type="button" onClick={() => setMode("vin")} className={`px-3 py-1.5 rounded-full ${mode === "vin" ? "bg-[var(--brand)] text-white" : "bg-slate-100 text-slate-600"}`}>
            By VIN
          </button>
        </div>
      )}
      {mode === "vin" ? (
        <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input name="vin" required minLength={17} maxLength={17} placeholder="17-character VIN" className={`${select} uppercase tracking-wider`} />
          <select name="part" className={select} defaultValue="">
            <option value="">Any part</option>
            {partTypes.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <button className="rounded-lg bg-[var(--brand)] text-white font-semibold px-6 py-2.5 hover:opacity-90">Find parts</button>
        </form>
      ) : (
        <form action={action} className={`grid gap-3 ${compact ? "sm:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
          <select name="year" className={select} defaultValue={initial.year ?? ""}>
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select name="make" className={select} value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">Any make</option>
            {makes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select name="model" className={select} defaultValue={initial.model ?? ""} key={make}>
            <option value="">Any model</option>
            {(make ? models[make] ?? [] : []).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select name="part" className={select} defaultValue={initial.part ?? ""}>
            <option value="">Any part</option>
            {partTypes.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {compact && <input name="q" defaultValue={initial.q} placeholder="Keyword, stock #, interchange" className={select} />}
          <button className="rounded-lg bg-[var(--brand)] text-white font-semibold px-6 py-2.5 hover:opacity-90">Search</button>
        </form>
      )}
    </div>
  );
}
