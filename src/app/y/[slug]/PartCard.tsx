import Link from "next/link";
import type { Part } from "@/lib/types";
import { money, partTitle, photosOf } from "@/lib/format";

export default function PartCard({ part, base }: { part: Part; base: string }) {
  const photo = photosOf(part)[0] ?? `${base}/parts/${part.id}/image`;
  return (
    <Link
      href={`${base}/parts/${part.id}`}
      className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:border-[var(--brand)] transition"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={partTitle(part)} className="w-full aspect-[4/3] object-cover bg-slate-100" loading="lazy" />
      <div className="p-3">
        <p className="text-xs text-slate-500">
          {[part.year, part.make, part.model].filter(Boolean).join(" ")}
        </p>
        <p className="font-semibold text-slate-900 group-hover:text-[var(--brand)]">{part.part_type}</p>
        <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
          {part.grade && <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-medium">Grade {part.grade}</span>}
          {part.mileage != null && <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">{Math.round(part.mileage / 1000)}k mi</span>}
          <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">#{part.stock_no}</span>
        </div>
        <p className="mt-2 text-lg font-bold text-slate-900">{money(part.price_cents)}</p>
      </div>
    </Link>
  );
}
