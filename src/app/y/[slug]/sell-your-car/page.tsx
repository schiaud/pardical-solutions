import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getYardBySlug } from "@/lib/yards";
import SellCarForm from "./SellCarForm";

export const metadata: Metadata = { title: "Sell your car" };

export default async function SellYourCar({ params }: { params: Promise<{ slug: string }> }) {
  const yard = await getYardBySlug((await params).slug);
  if (!yard) notFound();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sell us your car</h1>
        <p className="mt-3 text-slate-600">
          Running or not, wrecked or worn out — {yard.name} buys cars and trucks for parts. Tell us about it and we&apos;ll call with an offer,
          usually the same business day.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-700">
          {["Fast offer by phone", "Free towing in our area", "Paid on pickup", "We handle the paperwork"].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-slate-500">Rather talk? Call {yard.phone}.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
        <SellCarForm slug={yard.slug} />
      </div>
    </div>
  );
}
