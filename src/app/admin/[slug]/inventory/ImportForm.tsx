"use client";

import { useActionState } from "react";
import { importInventory, type ImportSummary } from "../../actions";
import { Notice, SubmitButton } from "../../ui";

export default function ImportForm({ slug }: { slug: string }) {
  const [state, action] = useActionState<ImportSummary, FormData>(importInventory, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="file"
        name="file"
        accept=".csv,.txt,.tsv,text/csv"
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:px-4 file:py-2 file:font-semibold"
      />
      <details className="text-sm">
        <summary className="cursor-pointer text-slate-500">…or paste the file contents</summary>
        <textarea name="pasted" rows={5} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs" placeholder="Stock#,Year,Make,Model,Part,Grade,Miles,Price,..." />
      </details>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" name="fullFile" defaultChecked className="mt-1" />
        <span>
          This is my <b>whole</b> inventory — mark anything missing from the file as sold (removes it from the website and every feed).
        </span>
      </label>
      <SubmitButton pendingText="Importing…">Import inventory</SubmitButton>
      <Notice result={state} />
      {state?.mapping && Object.keys(state.mapping).length > 0 && (
        <div className="text-xs text-slate-500">
          Columns matched:{" "}
          {Object.entries(state.mapping)
            .map(([f, h]) => `${h} → ${f.replace("_", " ")}`)
            .join(" · ")}
        </div>
      )}
    </form>
  );
}
