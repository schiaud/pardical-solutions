"use client";

import { Honeypot } from "@/components/marketing/Honeypot";

import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "../marketing/Icon";

// POSTs JSON to /api/demo-request.
// Body:     { audience: "broker", name, businessName, phone, email, ebayStore, ordersPerMonth, message }
// Response: { ok: true } | { ok: false, error: string }

const ORDERS_PER_MONTH = ["Under 100", "100–500", "500–2,000", "2,000+"];

const FIELDS = [
  "name",
  "businessName",
  "phone",
  "email",
  "ebayStore",
  "ordersPerMonth",
  "message",
] as const;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; name: string }
  | { kind: "error"; message: string; offerEmail: boolean };

const FALLBACK_ERROR = "Something went wrong sending your details. Please try again.";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-slate-50";

function Field({
  id,
  label,
  required = false,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function BrokerDemoForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const sending = status.kind === "sending";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const fields = Object.fromEntries(
      FIELDS.map((key) => [key, String(data.get(key) ?? "").trim()]),
    ) as Record<(typeof FIELDS)[number], string>;

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience: "broker", ...fields, website: String(data.get("website") ?? "") }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (res.ok && body?.ok) {
        form.reset();
        setStatus({ kind: "success", name: fields.name });
        return;
      }
      setStatus({
        kind: "error",
        message: body?.error || FALLBACK_ERROR,
        offerEmail: !body?.error,
      });
    } catch {
      setStatus({
        kind: "error",
        message: "We couldn't reach the server. Check your connection and try again.",
        offerEmail: true,
      });
    }
  }

  if (status.kind === "success") {
    const firstName = status.name.split(" ")[0];
    return (
      <div role="status" className="py-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="check" className="h-7 w-7" strokeWidth={2} />
        </div>
        <h3 className="mt-5 text-2xl font-bold text-slate-900">
          Thanks{firstName ? `, ${firstName}` : ""}. We got it.
        </h3>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-slate-600">
          We&apos;ll call you to pick a time for your 20-minute call. We&apos;ll
          look at your eBay account and order flow together.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-light"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={sending} className="relative">
      <Honeypot />
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900">Book a 20-minute call</h3>
        <p className="shrink-0 text-xs text-slate-500">
          <span className="text-red-600" aria-hidden="true">
            *
          </span>{" "}
          Required
        </p>
      </div>

      <fieldset disabled={sending} className="mt-6 grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Your details</legend>

        <Field id="bd-name" label="Your name" required>
          <input
            id="bd-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>

        <Field id="bd-businessName" label="Business name" required>
          <input
            id="bd-businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            required
            className={inputClass}
          />
        </Field>

        <Field id="bd-phone" label="Phone" required>
          <input
            id="bd-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className={inputClass}
          />
        </Field>

        <Field id="bd-email" label="Email">
          <input
            id="bd-email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
          />
        </Field>

        <Field id="bd-ebayStore" label="eBay store name or link">
          <input
            id="bd-ebayStore"
            name="ebayStore"
            type="text"
            autoComplete="off"
            placeholder="ebay.com/str/yourstore"
            className={inputClass}
          />
        </Field>

        <Field id="bd-ordersPerMonth" label="Orders per month">
          <select
            id="bd-ordersPerMonth"
            name="ordersPerMonth"
            defaultValue=""
            className={inputClass}
          >
            <option value="">Choose one</option>
            {ORDERS_PER_MONTH.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field id="bd-message" label="Anything we should know?" className="sm:col-span-2">
          <textarea
            id="bd-message"
            name="message"
            rows={3}
            placeholder="Best time to call, where your parts come from, what eats most of your day…"
            className={inputClass}
          />
        </Field>
      </fieldset>

      {status.kind === "error" && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <Icon name="close" className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p>
            {status.message}
            {status.offerEmail && (
              <>
                {" "}
                Or email us at{" "}
                <a
                  href="mailto:david@pardical.com"
                  className="font-semibold underline underline-offset-2"
                >
                  david@pardical.com
                </a>
                .
              </>
            )}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-white transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {sending ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
            Sending…
          </>
        ) : (
          "Book my call"
        )}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        No obligation. We&apos;ll call you to pick a time.
      </p>
    </form>
  );
}
