import Link from "next/link";
import { MobileMenu } from "./marketing/MobileMenu";
import { BrokerMobileMenu } from "./brokers/BrokerMobileMenu";

export type Audience = "recyclers" | "brokers";

// Hash links start with "/" (or "/brokers") so they also work from other pages.
const NAV = {
  recyclers: {
    home: { href: "/", label: "Pardical home" },
    links: [
      { href: "/#what-you-get", label: "What you get" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#demo", label: "Demo" },
    ],
    other: { href: "/brokers", label: "For brokers" },
    cta: { href: "/#book-demo", label: "Book a demo" },
  },
  brokers: {
    home: { href: "/brokers", label: "Pardical for brokers home" },
    links: [
      { href: "/brokers#what-it-does", label: "What it does" },
      { href: "/brokers#how-it-works", label: "How it works" },
      { href: "/brokers#pricing", label: "Pricing" },
    ],
    other: { href: "/", label: "For recyclers" },
    cta: { href: "/brokers#book-call", label: "Book a call" },
  },
} as const;

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          dark ? "bg-accent text-primary-dark" : "bg-primary text-white"
        }`}
        aria-hidden="true"
      >
        <span className="text-sm font-bold">P</span>
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${
          dark ? "text-white" : "text-primary-dark"
        }`}
      >
        Pardical
      </span>
    </span>
  );
}

export function Navbar({ audience = "recyclers" }: { audience?: Audience }) {
  const nav = NAV[audience];
  const mobileLinks = [...nav.links, nav.other];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={nav.home.href} aria-label={nav.home.label} className="shrink-0">
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-4 text-sm font-medium whitespace-nowrap text-slate-600 md:flex lg:gap-8"
          aria-label="Main"
        >
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <span aria-hidden="true" className="h-5 w-px bg-slate-200" />
          <Link
            href={nav.other.href}
            className="font-semibold text-primary transition-colors hover:text-primary-light"
          >
            {nav.other.label}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={nav.cta.href}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {nav.cta.label}
          </Link>
          {audience === "brokers" ? (
            <BrokerMobileMenu links={mobileLinks} cta={nav.cta} />
          ) : (
            <MobileMenu links={mobileLinks} />
          )}
        </div>
      </div>
    </header>
  );
}
