"use client";

import { useActionState } from "react";
import { addYard, type ActionResult } from "./actions";
import { Notice, SubmitButton } from "./ui";

export default function AddYardForm() {
  const [state, action] = useActionState<ActionResult, FormData>(addYard, null);
  const input = "rounded-lg border border-slate-300 px-3 py-2 text-sm";
  return (
    <form action={action} className="rounded-xl border border-dashed border-slate-300 bg-white p-4 space-y-2">
      <p className="font-semibold text-slate-900">Add a yard</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input name="name" placeholder="Yard name" required className={input} />
        <input name="slug" placeholder="web name, e.g. smiths" required className={input} />
        <SubmitButton>Add</SubmitButton>
      </div>
      <Notice result={state} />
    </form>
  );
}
