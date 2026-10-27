import Link from "next/link";
import { Logo, type Audience } from "./Navbar";

const COPY: Record<
  Audience,
  { tagline: string; links: { href: string; label: string }[] }
> = {
  recyclers: {
    tagline: "Websites, listings and pricing for full-service auto recyclers.",
    links: [
      { href: "/#what-you-get", label: "What you get" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#demo", label: "Demo" },
    ],
  },
  brokers: {
    tagline:
      "Order tracking, shipping, buyer messages and repricing for auto parts brokers on eBay.",
    links: [
      { href: "/brokers#what-it-does", label: "What it does" },
      { href: "/brokers#how-it-works", label: "How it works" },
      { href: "/brokers#pricing", label: "Pricing" },
      { href: "/brokers#book-call", label: "Book a call" },
    ],
  },
};

const audienceLinks = [
  { href: "/", label: "For recyclers" },
  { href: "/brokers", label: "For brokers" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/eula", label: "EULA" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-white/40 uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-3 text-sm text-white/60">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ audience = "recyclers" }: { audience?: Audience }) {
  const copy = COPY[audience];

  return (
    <footer className="border-t border-white/10 bg-primary-dark px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href={audience === "brokers" ? "/brokers" : "/"}
              aria-label="Pardical home"
              className="inline-block"
            >
              <Logo dark />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              {copy.tagline}
            </p>
            <a
              href="mailto:hello@pardical.com"
              className="mt-4 inline-block text-sm font-semibold text-white hover:text-accent-light"
            >
              hello@pardical.com
            </a>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 sm:gap-x-14"
          >
            <FooterColumn title="Who it's for" links={audienceLinks} />
            <FooterColumn title="Explore" links={copy.links} />
            <FooterColumn title="Legal" links={legalLinks} />
          </nav>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-sm text-white/40">
          &copy; {new Date().getFullYear()} Pardical LLC, Des Plaines, IL
        </p>
      </div>
    </footer>
  );
}
