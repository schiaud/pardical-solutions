"use client";

import { useActionState } from "react";
import { saveSettings, setOwnerPassword, type ActionResult } from "../../actions";
import { Notice, SubmitButton } from "../../ui";
import type { YardEditable } from "@/lib/yards";

export type EditableYard = Record<YardEditable | "slug", string>;

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-primary";

function Field({ label, name, value, area, hint }: { label: string; name: string; value: string; area?: number; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-700 font-medium">{label}</span>
      {area ? <textarea name={name} defaultValue={value} rows={area} className={input} /> : <input name={name} defaultValue={value} className={input} />}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function SettingsForm({ yard }: { yard: EditableYard }) {
  const [state, action] = useActionState<ActionResult, FormData>(saveSettings, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={yard.slug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Yard name" name="name" value={yard.name} />
        <Field label="Phone" name="phone" value={yard.phone} />
        <Field label="Email" name="email" value={yard.email} />
        <Field label="Headline on your homepage" name="tagline" value={yard.tagline} />
        <Field label="Street address" name="address" value={yard.address} />
        <div className="grid grid-cols-[1fr_70px_100px] gap-2">
          <Field label="City" name="city" value={yard.city} />
          <Field label="State" name="state" value={yard.state} />
          <Field label="ZIP" name="zip" value={yard.zip} />
        </div>
      </div>
      <Field label="Hours (one line per day/range)" name="hours" value={yard.hours} area={3} />
      <Field label="About the yard" name="about_text" value={yard.about_text} area={3} />
      <Field label="Warranty" name="warranty_text" value={yard.warranty_text} area={3} />
      <Field label="Returns" name="returns_text" value={yard.returns_text} area={3} />
      <Field label="Pickup & shipping" name="pickup_note" value={yard.pickup_note} area={2} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Brand color" name="brand_color" value={yard.brand_color} hint="Hex color, e.g. #1e3a5f" />
        <Field label="Logo image URL" name="logo_url" value={yard.logo_url} />
        <Field
          label="Your domain"
          name="custom_domain"
          value={yard.custom_domain}
          hint="e.g. smithsautoparts.com — then point its DNS at Pardical (we'll walk you through it)."
        />
      </div>
      <Notice result={state} />
      <SubmitButton pendingText="Saving…">Save website settings</SubmitButton>
    </form>
  );
}

export function PasswordForm({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const [state, action] = useActionState<ActionResult, FormData>(setOwnerPassword, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      {isOwner && (
        <label className="block text-sm">
          <span className="text-slate-700 font-medium">Current password</span>
          <input name="current" type="password" className={input} />
        </label>
      )}
      <label className="block text-sm">
        <span className="text-slate-700 font-medium">New owner password</span>
        <input name="password" type="password" minLength={8} className={input} />
      </label>
      <Notice result={state} />
      <SubmitButton>Save password</SubmitButton>
    </form>
  );
}
