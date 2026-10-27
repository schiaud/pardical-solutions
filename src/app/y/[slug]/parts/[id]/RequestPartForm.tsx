"use client";

import { useActionState, useState } from "react";
import { requestPart, type FormState } from "../../actions";
import { Honeypot } from "@/components/marketing/Honeypot";

type Props = { slug: string; partId: number; canShip: boolean; warrantyOptions: string[] };

export default function RequestPartForm({ slug, partId, canShip, warrantyOptions }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPart, null);
  const [delivery, setDelivery] = useState(canShip ? "ship" : "pickup");
  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)]";

  if (state?.ok) {
    return <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 text-sm">{state.message}</div>;
  }

  return (
    <form action={action} className="relative space-y-3">
      <Honeypot />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="partId" value={partId} />
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ["ship", canShip ? "Ship it to me" : "Ship by freight"],
          ["pickup", "Pick up at the yard"],
        ].map(([value, label]) => (
          <label
            key={value}
            className={`rounded-lg border px-3 py-2 cursor-pointer text-center font-medium ${
              delivery === value ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-slate-300 text-slate-700"
            }`}
          >
            <input type="radio" name="delivery" value={value} checked={delivery === value} onChange={() => setDelivery(value)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
      {warrantyOptions.length > 1 && (
        <select name="warranty" className={input} defaultValue={warrantyOptions[0]}>
          {warrantyOptions.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input name="name" placeholder="Your name *" required className={input} />
        <input name="phone" type="tel" placeholder="Phone *" required className={input} />
        <input name="email" type="email" placeholder="Email" className={input} />
        <input name="zip" placeholder={delivery === "ship" ? "Ship-to ZIP" : "ZIP"} className={input} maxLength={10} />
      </div>
      <input name="vin" placeholder="Your VIN (helps us confirm fitment)" className={`${input} uppercase`} maxLength={17} />
      <textarea name="notes" placeholder="Anything we should know?" rows={2} className={input} />
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-[var(--brand)] text-white font-semibold py-3 hover:opacity-90 disabled:opacity-50">
        {pending ? "Sending…" : "Request this part"}
      </button>
      <p className="text-xs text-slate-500">
        No payment yet. We confirm the part is on the shelf, then {delivery === "ship" ? "text you a secure payment link with shipping" : "hold it for you"}.
      </p>
    </form>
  );
}
