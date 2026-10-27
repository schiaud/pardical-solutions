"use client";

import { useActionState } from "react";
import { sellCar, type FormState } from "../actions";
import { Honeypot } from "@/components/marketing/Honeypot";

export default function SellCarForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sellCar, null);
  const input = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]";
  if (state?.ok) return <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-900">{state.message}</div>;

  return (
    <form action={action} className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="slug" value={slug} />
      <fieldset className="space-y-3">
        <legend className="font-semibold text-slate-900">Your vehicle</legend>
        <input name="vin" placeholder="VIN (fastest — or fill in year, make, model)" maxLength={17} className={`${input} uppercase`} />
        <div className="grid grid-cols-3 gap-2">
          <input name="year" placeholder="Year" maxLength={4} className={input} />
          <input name="make" placeholder="Make" className={input} />
          <input name="model" placeholder="Model" className={input} />
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          <select name="runs" className={input} defaultValue="">
            <option value="" disabled>Does it run?</option>
            <option>Runs and drives</option>
            <option>Runs, doesn&apos;t drive</option>
            <option>Doesn&apos;t run</option>
          </select>
          <select name="title" className={input} defaultValue="">
            <option value="" disabled>Title?</option>
            <option>Clean title</option>
            <option>Salvage title</option>
            <option>No title</option>
          </select>
          <select name="pickup" className={input} defaultValue="">
            <option value="" disabled>Pickup?</option>
            <option>Need it towed</option>
            <option>I&apos;ll drop it off</option>
          </select>
        </div>
        <textarea name="condition" rows={3} placeholder="Damage, missing parts, mileage…" className={input} />
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="font-semibold text-slate-900">How we reach you</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          <input name="name" placeholder="Name *" required className={input} />
          <input name="phone" type="tel" placeholder="Phone *" required className={input} />
          <input name="email" type="email" placeholder="Email" className={input} />
          <input name="zip" placeholder="ZIP where the car is" maxLength={10} className={input} />
        </div>
      </fieldset>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-[var(--brand)] text-white font-semibold py-3 hover:opacity-90 disabled:opacity-50">
        {pending ? "Sending…" : "Get my offer"}
      </button>
    </form>
  );
}
