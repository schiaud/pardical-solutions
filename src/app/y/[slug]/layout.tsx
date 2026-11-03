import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getYardBySlug, hoursLines, isDemoYard } from "@/lib/yards";
import { linkBase } from "@/lib/site";
import { hasCreditedPhotos } from "@/lib/parts";
import ChatWidget from "./ChatWidget";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const yard = await getYardBySlug((await params).slug);
  if (!yard) return {};
  return {
    title: { default: `${yard.name} — Used OEM Auto Parts`, template: `%s | ${yard.name}` },
    description: yard.tagline || `Quality used OEM auto parts from ${yard.name} in ${yard.city}, ${yard.state}.`,
    // The demo yard is fictional sample data: keep it out of search results.
    ...(isDemoYard(yard.slug) ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function YardLayout({ children, params }: Props) {
  const { slug } = await params;
  const yard = await getYardBySlug(slug);
  if (!yard) notFound();
  const base = await linkBase(yard);
  const tel = yard.phone.replace(/[^\d+]/g, "");
  const style = { "--brand": yard.brand_color || "#1e3a5f" } as CSSProperties;

  return (
    <div style={style} className="min-h-screen flex flex-col bg-white text-slate-800">
      {isDemoYard(yard.slug) && (
        <div className="bg-amber-400 text-amber-950 text-sm">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <span>
              <b>Demo yard</b> — sample parts and a made-up business, to show what your new website could look like.
            </span>
            <Link href="/" className="font-semibold underline">
              ← Back to Pardical
            </Link>
          </div>
        </div>
      )}
      <div className="bg-[var(--brand)] text-white text-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="opacity-90">{hoursLines(yard)[0] ?? ""}</span>
          <span className="opacity-90">
            {yard.city && `${yard.city}, ${yard.state}`} · Nationwide shipping · Local pickup
          </span>
        </div>
      </div>
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href={base || "/"} className="flex items-center gap-2 min-w-0">
            {yard.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={yard.logo_url} alt="" className="h-9 w-auto" />
            ) : (
              <span className="h-9 w-9 rounded-lg bg-[var(--brand)] text-white grid place-items-center font-bold shrink-0">
                {yard.name.charAt(0)}
              </span>
            )}
            <span className="font-bold text-lg truncate">{yard.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href={`${base}/parts`} className="hover:text-[var(--brand)]">Shop parts</Link>
            <Link href={`${base}/sell-your-car`} className="hover:text-[var(--brand)]">Sell your car</Link>
            <Link href={`${base}/about`} className="hover:text-[var(--brand)]">About &amp; warranty</Link>
          </nav>
          {yard.phone && (
            <a href={`tel:${tel}`} className="shrink-0 rounded-lg bg-[var(--brand)] text-white text-sm font-semibold px-4 py-2 hover:opacity-90">
              Call {yard.phone}
            </a>
          )}
        </div>
        <nav className="md:hidden flex justify-around border-t border-slate-100 text-sm font-medium text-slate-600">
          <Link href={`${base}/parts`} className="py-2">Shop parts</Link>
          <Link href={`${base}/sell-your-car`} className="py-2">Sell your car</Link>
          <Link href={`${base}/about`} className="py-2">About</Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-300 text-sm mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">{yard.name}</p>
            <p className="mt-2">{yard.address}</p>
            <p>{[yard.city, yard.state, yard.zip].filter(Boolean).join(", ")}</p>
            {yard.phone && <p className="mt-2">{yard.phone}</p>}
            {yard.email && <p>{yard.email}</p>}
          </div>
          <div>
            <p className="font-semibold text-white">Hours</p>
            <ul className="mt-2 space-y-1">
              {hoursLines(yard).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Shop</p>
            <ul className="mt-2 space-y-1">
              <li><Link href={`${base}/parts`} className="hover:text-white">Search parts</Link></li>
              <li><Link href={`${base}/sell-your-car`} className="hover:text-white">Sell us your car</Link></li>
              <li><Link href={`${base}/about`} className="hover:text-white">Warranty &amp; returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {yard.name} · Site by Pardical
          {(await hasCreditedPhotos(yard.id)) && <p className="mt-1">Some photos are used under Creative Commons licenses — credits are on each part&apos;s page.</p>}
        </div>
      </footer>
      <ChatWidget slug={yard.slug} yardName={yard.name} />
    </div>
  );
}
