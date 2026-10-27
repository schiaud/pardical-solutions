import { headers } from "next/headers";

// Light abuse protection for public forms: per-IP rate limits (in memory, per server instance)
// and a honeypot field ("website") that people never see and bots tend to fill in.

const hits = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export function filledHoneypot(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}
