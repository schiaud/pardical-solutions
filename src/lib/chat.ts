import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { facets, searchParts } from "./parts";
import { money, partTitle } from "./format";
import { estimateShipping } from "./shipping";
import { hoursLines } from "./yards";
import type { Part, Yard } from "./types";

// Website chat: answers "do you have it / how much / shipping / hours" from the yard's live inventory.
// With ANTHROPIC_API_KEY set, Claude writes the reply from the matched parts; without it, a plain
// rules-based answer is returned. Either way the answer only uses inventory and yard facts we pass in.

export type ChatReply = { reply: string; parts: { id: number; title: string; price: string; url: string }[] };

// Counter-talk → the part names yard systems use.
const ALIASES: [RegExp, string][] = [
  [/\btrans\b|\btranny\b/g, "transmission"],
  [/\bmotor\b(?! mount)/g, "engine"],
  [/\b(ecu|pcm|ecm|computer)\b/g, "engine control module"],
  [/\bhead ?lamps?\b|\bheadlights?\b/g, "headlight"],
  [/\btail ?lamps?\b|\btaillights?\b/g, "tail light"],
  [/\b(cluster|speedo|gauges?)\b/g, "instrument cluster"],
  [/\b(rack and pinion|power steering rack)\b/g, "steering rack"],
  [/\bcat\b|\bcats\b/g, "catalytic converter"],
  [/\brims?\b/g, "wheel"],
  [/\bmirrors?\b/g, "door mirror"],
];
const STOP = new Set(["assembly", "front", "rear", "left", "right", "side", "driver", "passenger", "with", "without", "and", "the"]);

function bestPartType(partTypes: string[], text: string): string | undefined {
  let best: { p: string; score: number; size: number } | undefined;
  for (const p of partTypes) {
    const tokens = p.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP.has(t));
    const score = tokens.filter((t) => new RegExp(`\\b${t}`).test(text)).length;
    if (!score) continue;
    // More matched words wins; on a tie, the name with fewer unmatched words is the better fit.
    if (!best || score > best.score || (score === best.score && tokens.length < best.size)) best = { p, score, size: tokens.length };
  }
  return best?.p;
}

function understand(yardId: number, message: string) {
  const f = facets(yardId);
  let text = message.toLowerCase();
  for (const [re, to] of ALIASES) text = text.replace(re, to);
  const year = Number(text.match(/\b(19[5-9]\d|20[0-4]\d)\b/)?.[1]) || null;
  const twoDigit = !year ? text.match(/\b'?(\d{2})\s+(?=[a-z])/)?.[1] : undefined;
  const yy = twoDigit ? (Number(twoDigit) > 40 ? 1900 : 2000) + Number(twoDigit) : null;
  const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const flat = squash(text);
  const make = f.makes.find((m) => text.includes(m.toLowerCase())) ?? (/\bchevy\b/.test(text) ? "Chevrolet" : undefined);
  const models = make ? f.models[make] ?? [] : Object.values(f.models).flat();
  const model = models
    .slice()
    .sort((a, b) => b.length - a.length)
    .find((m) => flat.includes(squash(m)) || flat.includes(squash(m.split(" ")[0])));
  const part = bestPartType(f.partTypes, text);
  return { year: year ?? yy, make, model, part };
}

/** "How much to ship it?" carries the earlier part forward; a question naming a new vehicle or part doesn't. */
function isFollowUp(yardId: number, message: string): boolean {
  const u = understand(yardId, message);
  if (u.year || u.make || u.model || u.part) return false;
  return /\b(it|that|this|one|ship|shipping|price|cost|how much|fit|fits|still|available|condition|miles|warranty)\b/i.test(message);
}

function findParts(yardId: number, message: string): Part[] {
  const u = understand(yardId, message);
  const tries = [
    { year: u.year, make: u.make, model: u.model, part: u.part },
    { make: u.make, model: u.model, part: u.part },
    { make: u.make, part: u.part },
    { part: u.part, make: u.make },
  ];
  if (!u.part && !u.make && !u.model) return [];
  for (const t of tries) {
    if (!t.part && !t.make) continue;
    const { parts } = searchParts(yardId, { ...t, limit: 6 });
    if (parts.length) return parts;
  }
  return [];
}

function factsFor(yard: Yard, parts: Part[], base: string): string {
  const yardFacts = [
    `Yard: ${yard.name}, ${[yard.address, yard.city, yard.state, yard.zip].filter(Boolean).join(", ")}. Phone ${yard.phone}.`,
    `Hours: ${hoursLines(yard).join("; ")}.`,
    `Warranty: ${yard.warranty_text}`,
    `Returns: ${yard.returns_text}`,
    `Pickup and shipping: ${yard.pickup_note}`,
  ].join("\n");
  const partFacts = parts.length
    ? parts
        .map((p) => {
          const s = estimateShipping(p.part_type);
          return `- ${partTitle(p)} | stock #${p.stock_no} | ${money(p.price_cents)} | grade ${p.grade || "n/a"} | ${p.mileage ? p.mileage.toLocaleString() + " miles" : "miles n/a"} | ${p.description || "no notes"} | shipping ${
            s.method === "freight" ? "freight, about " + money(s.typicalCents) + " or free pickup" : "about " + money(s.typicalCents)
          } | link ${base}/parts/${p.id}`;
        })
        .join("\n")
    : "- No matching parts in stock right now.";
  return `${yardFacts}\n\nMatching inventory:\n${partFacts}`;
}

function plainReply(yard: Yard, parts: Part[], message: string): string {
  if (/\b(hours?|open|close[sd]?|when)\b/i.test(message) && !parts.length) {
    return `We're open ${hoursLines(yard).join(", ")}. Call us at ${yard.phone} anytime during those hours.`;
  }
  if (/\b(address|where are you|located|location|directions)\b/i.test(message) && !parts.length) {
    return `We're at ${[yard.address, yard.city, yard.state, yard.zip].filter(Boolean).join(", ")}. ${hoursLines(yard)[0] ?? ""}`.trim();
  }
  if (/\b(warranty|guarantee)\b/i.test(message) && !parts.length) return yard.warranty_text;
  if (/\b(return|refund)\b/i.test(message) && !parts.length) return yard.returns_text;
  if (parts.length) {
    const top = parts.slice(0, 3).map((p) => `• ${partTitle(p)} — ${money(p.price_cents)}${p.grade ? `, grade ${p.grade}` : ""}${p.mileage ? `, ${Math.round(p.mileage / 1000)}k miles` : ""} (stock #${p.stock_no})`);
    return `Yes — here's what we have:\n${top.join("\n")}\nTap a part below to see details and shipping, or call ${yard.phone} to confirm it fits your VIN.`;
  }
  return `I don't see that on our shelf right now. Tell me the year, make, model and part (or your VIN) and we'll check the yard — or leave your number with "Request a part" and we'll call you back. You can also reach us at ${yard.phone}.`;
}

const SYSTEM = `You answer website chat for a used auto parts recycler (salvage yard).
Use ONLY the yard facts and matching inventory given in the latest system note. Never invent stock, prices, fitment, condition or delivery dates.
If nothing matches, say so plainly and invite the customer to give year/make/model/part or their VIN, or to leave a phone number for a callback.
Fitment: suggest confirming with their VIN or the interchange number; never guarantee fit.
Keep replies short (2-5 sentences, plain text, no markdown headings). Mention price and stock # when you name a part. Prices are not negotiable in chat.`;

async function claudeReply(history: { role: "user" | "assistant"; content: string }[], facts: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: process.env.CHAT_MODEL || "claude-opus-5-5",
      max_tokens: 1024,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [...history, { role: "system" as const, content: facts }] as Anthropic.Beta.BetaMessageParam[],
    });
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    console.error("chat: Claude call failed", err);
    return null;
  }
}

export async function answerChat(yard: Yard, sessionId: string, message: string, base: string): Promise<ChatReply> {
  const msg = message.trim().slice(0, 1000);
  const conn = db();
  conn.prepare("insert into chat_messages (yard_id, session_id, role, content) values (?,?,?,?)").run(yard.id, sessionId, "user", msg);
  const history = (
    conn
      .prepare("select role, content from chat_messages where yard_id = ? and session_id = ? order by id desc limit 12")
      .all(yard.id, sessionId) as { role: "user" | "assistant"; content: string }[]
  ).reverse();
  // Search on the whole recent conversation so "how much is shipping on it?" still finds the part.
  // A question about the yard itself (hours, address, warranty…) is answered on its own, not with the last part.
  const context = history.filter((h) => h.role === "user").map((h) => h.content).slice(-3).join(" ");
  const direct = findParts(yard.id, msg);
  const aboutYard = /\b(hours?|open|close[sd]?|address|where are you|located|location|directions|warranty|guarantee|return|refund)\b/i.test(msg);
  const parts = direct.length || aboutYard || !isFollowUp(yard.id, msg) ? direct : findParts(yard.id, context);
  const reply = (await claudeReply(history, factsFor(yard, parts, base))) ?? plainReply(yard, parts, msg);
  conn.prepare("insert into chat_messages (yard_id, session_id, role, content) values (?,?,?,?)").run(yard.id, sessionId, "assistant", reply);
  return {
    reply,
    parts: parts.slice(0, 3).map((p) => ({ id: p.id, title: partTitle(p), price: money(p.price_cents), url: `${base}/parts/${p.id}` })),
  };
}

export function recentChats(yardId: number, limit = 30) {
  return db()
    .prepare(
      `select session_id, min(created_at) as started, max(created_at) as last, count(*) as n,
              (select content from chat_messages c2 where c2.yard_id = c.yard_id and c2.session_id = c.session_id and role = 'user' order by id limit 1) as first_question
       from chat_messages c where yard_id = ? group by session_id order by last desc limit ?`,
    )
    .all(yardId, limit) as { session_id: string; started: string; last: string; n: number; first_question: string }[];
}

export function chatTranscript(yardId: number, sessionId: string) {
  return db()
    .prepare("select role, content, created_at from chat_messages where yard_id = ? and session_id = ? order by id")
    .all(yardId, sessionId) as { role: string; content: string; created_at: string }[];
}
