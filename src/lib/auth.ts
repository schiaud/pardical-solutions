import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getYardBySlug } from "./yards";
import type { Yard } from "./types";

// Two roles: the Pardical operator (runs every yard, done-for-you) and a yard owner (their own yard only).
export type Session = { role: "operator" } | { role: "owner"; yard: string };

const COOKIE = "pm_session";
const MAX_AGE_S = 60 * 60 * 24 * 14;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (16+ chars) in production.");
  return "dev-only-session-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(12).toString("hex");
  return `scrypt$${salt}$${crypto.scryptSync(password, salt, 32).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, salt, hex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const want = Buffer.from(hex, "hex");
  const got = crypto.scryptSync(password, salt, want.length);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Operator password comes from ADMIN_PASSWORD; locally it defaults to "pardical". */
export function checkOperatorPassword(password: string): boolean {
  const want = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "pardical");
  return !!want && safeEqual(password, want);
}

export async function startSession(session: Session): Promise<void> {
  const body = Buffer.from(JSON.stringify({ ...session, exp: Date.now() + MAX_AGE_S * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig || !safeEqual(sig, sign(body))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as Session & { exp: number };
    if (data.exp < Date.now()) return null;
    return data.role === "operator" ? { role: "operator" } : { role: "owner", yard: data.yard };
  } catch {
    return null;
  }
}

/** Admin pages call this: returns the yard if the session may manage it, otherwise sends to login. */
export async function requireYardAdmin(slug: string): Promise<{ yard: Yard; session: Session }> {
  const yard = await getYardBySlug(slug);
  if (!yard) redirect("/admin");
  const session = await getSession();
  if (!session || (session.role === "owner" && session.yard !== slug)) redirect(`/admin/login?yard=${encodeURIComponent(slug)}`);
  return { yard, session };
}

export async function requireOperator(): Promise<void> {
  const session = await getSession();
  if (session?.role !== "operator") redirect("/admin/login");
}
