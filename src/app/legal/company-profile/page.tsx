import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Company / owner profile for KYC and business verification. Deliberately not linked from any page,
// not in navigation or the sitemap, and marked noindex (also sent as an X-Robots-Tag header in next.config.ts).
// The personal details come from environment variables (KYC_*) so they are never committed to the repo.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company profile — Pardical LLC",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

function profile() {
  const owner = process.env.KYC_OWNER_NAME?.trim();
  const email = process.env.KYC_EMAIL?.trim();
  const phone = process.env.KYC_PHONE?.trim();
  const address = process.env.KYC_ADDRESS?.trim();
  if (!owner || !email || !phone || !address) return null;
  return { owner, email, phone, address: address.split(/\\n|\n|\|/).map((l) => l.trim()).filter(Boolean) };
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw;
}

export default function CompanyProfile() {
  const p = profile();
  if (!p) notFound();
  const digits = p.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const rows: [string, React.ReactNode][] = [
    ["Legal name", "Pardical LLC"],
    ["Owner", p.owner],
    [
      "Business address",
      <>
        {p.address.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </>,
    ],
    ["Phone", <a key="p" href={`tel:+1${digits}`} className="text-primary hover:underline">{formatPhone(p.phone)}</a>],
    ["Email", <a key="e" href={`mailto:${p.email}`} className="text-primary hover:underline">{p.email}</a>],
    ["Website", <a key="w" href="https://pardical.com" className="text-primary hover:underline">pardical.com</a>],
  ];
  return (
    <main className="min-h-screen bg-surface px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-primary-dark">
          Pardical
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Company profile</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Pardical LLC is an auto parts company based in Des Plaines, Illinois. We sell used OEM auto parts online — more than 11,000 parts sold on eBay — and
            build websites, online listing, pricing and order-automation tools for auto recyclers and auto parts brokers.
          </p>
          <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_1fr] gap-3 py-3 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-slate-400">This page is provided for business verification.</p>
        </div>
      </div>
    </main>
  );
}
