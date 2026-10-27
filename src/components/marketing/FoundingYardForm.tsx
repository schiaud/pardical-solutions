"use client";

import { Honeypot } from "./Honeypot";

import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

// POSTs JSON to /api/founding-yard.
// Body:     { name, yardName, phone, email, city, state, yardSoftware, message }
// Response: { ok: true } | { ok: false, error: string }

const YARD_SOFTWARE = [
  "Hollander Powerlink",
  "Car-Part Checkmate",
  "CCC Pinnacle",
  "Other",
  "None",
];

const FIELDS = [
  "name",
  "yardName",
  "phone",
  "email",
  "city",
  "state",
  "yardSoftware",
  "message",
] as const;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; name: string }
  | { kind: "error"; message: string };

const FALLBACK_ERROR =
  "Something went wrong sending your details. Please try again, or email hello@pardical.com.";

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

export function FoundingYardForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const sending = status.kind === "sending";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(
      FIELDS.map((key) => [key, String(data.get(key) ?? "").trim()]),
    ) as Record<(typeof FIELDS)[number], string>;

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/founding-yard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website: String(data.get("website") ?? "") }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (res.ok && body?.ok) {
        form.reset();
        setStatus({ kind: "success", name: payload.name });
        return;
      }
      setStatus({ kind: "error", message: body?.error || FALLBACK_ERROR });
    } catch {
      setStatus({
        kind: "error",
        message:
          "We couldn't reach the server. Check your connection and try again.",
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
          We&apos;ll call you to set up your 15-minute demo. Have five parts in
          mind and we&apos;ll price them together.
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
        <h3 className="text-xl font-bold text-slate-900">
          Become a founding yard
        </h3>
        <p className="text-xs text-slate-500">
          <span className="text-red-600" aria-hidden="true">
            *
          </span>{" "}
          Required
        </p>
      </div>

      <fieldset disabled={sending} className="mt-6 grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Your details</legend>

        <Field id="fy-name" label="Your name" required>
          <input
            id="fy-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>

        <Field id="fy-yardName" label="Yard name" required>
          <input
            id="fy-yardName"
            name="yardName"
            type="text"
            autoComplete="organization"
            required
            className={inputClass}
          />
        </Field>

        <Field id="fy-phone" label="Phone" required>
          <input
            id="fy-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className={inputClass}
          />
        </Field>

        <Field id="fy-email" label="Email">
          <input
            id="fy-email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
          />
        </Field>

        <Field id="fy-city" label="City">
          <input
            id="fy-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            className={inputClass}
          />
        </Field>

        <Field id="fy-state" label="State">
          <input
            id="fy-state"
            name="state"
            type="text"
            autoComplete="address-level1"
            placeholder="IL"
            className={inputClass}
          />
        </Field>

        <Field id="fy-yardSoftware" label="Yard software" className="sm:col-span-2">
          <select
            id="fy-yardSoftware"
            name="yardSoftware"
            defaultValue=""
            className={inputClass}
          >
            <option value="">Choose one</option>
            {YARD_SOFTWARE.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field id="fy-message" label="Anything we should know?" className="sm:col-span-2">
          <textarea
            id="fy-message"
            name="message"
            rows={3}
            placeholder="Best time to call, number of locations, what you sell most…"
            className={inputClass}
          />
        </Field>
      </fieldset>

      {status.kind === "error" && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <Icon name="close" className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{status.message}</span>
        </p>
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
          "Book my demo"
        )}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        No obligation. We&apos;ll call you to pick a time.
      </p>
    </form>
  );
}
