"use client";

import { useActionState } from "react";
import { login, type ActionResult } from "../actions";
import { Notice, SubmitButton } from "../ui";

export default function LoginForm({ yard }: { yard: string }) {
  const [state, action] = useActionState<ActionResult, FormData>(login, null);
  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-primary";
  return (
    <form action={action} className="mt-5 space-y-3">
      <label className="block text-sm">
        <span className="text-slate-600">Yard web name</span>
        <input name="yard" defaultValue={yard} placeholder="e.g. demo" className={`${input} mt-1`} />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Password</span>
        <input name="password" type="password" required autoFocus className={`${input} mt-1`} />
      </label>
      <Notice result={state} />
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
