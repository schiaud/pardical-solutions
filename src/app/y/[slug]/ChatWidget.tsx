"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string; parts?: { id: number; title: string; price: string; url: string }[] };

function sessionId(): string {
  try {
    const key = "pm_chat_session";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function ChatWidget({ slug, yardName }: { slug: string; yardName: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: `Hi! Looking for a part? Tell me the year, make, model and part — I'll check ${yardName}'s shelves.` },
  ]);
  const sid = useRef<string>("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    if (!sid.current) sid.current = sessionId();
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(`/api/y/${slug}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sid.current }),
      });
      const data = (await res.json()) as { reply?: string; parts?: Msg["parts"]; error?: string };
      setMsgs((m) => [...m, { role: "assistant", text: data.reply ?? data.error ?? "Sorry, something went wrong.", parts: data.parts }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Sorry — I couldn't reach the shop. Please call us." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[min(92vw,360px)] h-[min(70vh,520px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-[var(--brand)] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{yardName}</p>
              <p className="text-xs opacity-80">Parts help · answers from live inventory</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/80 hover:text-white text-xl leading-none">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                    m.role === "user" ? "bg-[var(--brand)] text-white" : "bg-white border border-slate-200"
                  }`}
                >
                  {m.text}
                  {m.parts && m.parts.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {m.parts.map((p) => (
                        <a key={p.id} href={p.url} className="block rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs hover:border-[var(--brand)]">
                          <span className="font-medium text-slate-800">{p.title}</span> · <span className="text-slate-600">{p.price}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-slate-400">Checking the shelves…</p>}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="border-t border-slate-200 p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 2015 Silverado engine"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)]"
              maxLength={500}
            />
            <button disabled={busy} className="rounded-lg bg-[var(--brand)] text-white text-sm font-semibold px-3 disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex items-center gap-2 rounded-full bg-[var(--brand)] text-white shadow-lg px-5 py-3 text-sm font-semibold hover:opacity-90"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {open ? "Close" : "Ask about a part"}
      </button>
    </div>
  );
}
