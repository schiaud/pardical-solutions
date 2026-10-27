"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "../marketing/Icon";

// Same look as marketing/MobileMenu, but the call-to-action is passed in
// (MobileMenu always points at the recycler demo form).
export function BrokerMobileMenu({
  links,
  cta,
}: {
  links: { href: string; label: string }[];
  cta: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white shadow-lg"
        >
          <nav className="flex flex-col px-4 py-3" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-surface hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-3 text-center text-base font-semibold text-white hover:bg-primary-light"
            >
              {cta.label}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
