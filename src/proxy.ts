import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getYardByDomain } from "@/lib/yards";

// A yard's own domain (e.g. parts.smithsautorecycling.com) serves its site from /y/<slug>.
// Anything on Pardical's own hosts passes straight through.
const OWN_HOSTS = (process.env.APP_HOSTS || "localhost,127.0.0.1,pardical.com,www.pardical.com")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

// Facebook buyers and the pricing tool at app.pardical.com check out through the Shopify store, which now lives
// at shop.pardical.com. Links already sent out still point at pardical.com, so send those paths on, query string intact.
const SHOPIFY_PATH = /^\/(cart|products|policies|pages|blogs|collections|checkouts|account)(\/|$)/;
const SHOPIFY_ORIGIN = "https://shop.pardical.com";

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().replace(/:\d+$/, "");
  const { pathname, search } = request.nextUrl;
  if ((host === "pardical.com" || host === "www.pardical.com") && SHOPIFY_PATH.test(pathname)) {
    return NextResponse.redirect(`${SHOPIFY_ORIGIN}${pathname}${search}`, 307);
  }
  if (!host || OWN_HOSTS.includes(host) || /\.vercel\.app$/.test(host)) {
    return NextResponse.next();
  }
  const yard = await getYardByDomain(host);
  if (!yard) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/y/${yard.slug}${url.pathname === "/" ? "" : url.pathname}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-yard-domain", host);
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  // Skip Next internals, API routes, feeds, generated icons/share images and static files.
  matcher: ["/((?!_next/|api/|feeds/|admin|icon|apple-icon|opengraph-image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|txt|xml)$).*)"],
};
