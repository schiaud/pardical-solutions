import { headers } from "next/headers";
import type { Yard } from "./types";

// proxy.ts sets this header when a request arrives on a yard's own domain and is rewritten to /y/<slug>.
export const DOMAIN_HEADER = "x-yard-domain";

/** Path prefix for links inside the yard site: "" on the yard's own domain, "/y/<slug>" otherwise. */
export async function linkBase(yard: Pick<Yard, "slug">): Promise<string> {
  const h = await headers();
  return h.get(DOMAIN_HEADER) ? "" : `/y/${yard.slug}`;
}

export async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Absolute base for feeds and shared links: the yard's own domain once connected, else this app's /y/<slug>. */
export async function absoluteYardBase(yard: Pick<Yard, "slug" | "custom_domain">): Promise<string> {
  if (yard.custom_domain) return `https://${yard.custom_domain}`;
  return `${await origin()}/y/${yard.slug}`;
}
