import Link from "next/link";
import { requireYardAdmin } from "@/lib/auth";
import { newLeadCounts } from "@/lib/leads";
import { stats } from "@/lib/parts";
import { isDemoYard } from "@/lib/yards";
import { logout } from "../actions";

export default async function YardAdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { yard, session } = await requireYardAdmin(slug);
  const s = stats(yard.id);
  const leads = Object.values(newLeadCounts(yard.id)).reduce((a, b) => a + b, 0);
  const nav: [string, string, number?][] = [
    ["Overview", ""],
    ["Inventory", "/inventory"],
    ["Prices", "/pricing", s.suggestions],
    ["Channels", "/channels"],
    ["Leads", "/leads", leads],
    ["Settings", "/settings"],
  ];
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {session.role === "operator" ? (
              <Link href="/admin" className="text-white/70 hover:text-white text-sm shrink-0">
                ← All yards
              </Link>
            ) : (
              <span className="font-bold shrink-0">Pardical</span>
            )}
            <span className="font-semibold truncate">{yard.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/y/${yard.slug}`} target="_blank" className="text-white/80 hover:text-white">
              View website ↗
            </Link>
            <form action={logout}>
              <button className="text-white/80 hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto text-sm">
          {nav.map(([label, path, badge]) => (
            <Link key={label} href={`/admin/${yard.slug}${path}`} className="px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-t-md whitespace-nowrap">
              {label}
              {badge ? <span className="ml-1.5 rounded-full bg-accent text-primary-dark text-xs font-bold px-1.5">{badge}</span> : null}
            </Link>
          ))}
        </nav>
      </header>
      {isDemoYard(yard.slug) && session.role === "owner" && (
        <div className="bg-amber-400 text-amber-950 text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <b>Public demo</b> — look around freely; saving is turned off and visitors&apos; contact details are hidden.{" "}
            <Link href="/#book-demo" className="font-semibold underline">
              Book a demo
            </Link>{" "}
            to get your own yard set up.
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
