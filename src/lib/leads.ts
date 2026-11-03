import { db } from "./db";
import type { Lead, LeadKind } from "./types";

export type LeadInput = {
  yardId: number | null;
  kind: LeadKind;
  partId?: number | null;
  name?: string;
  phone?: string;
  email?: string;
  zip?: string;
  data?: Record<string, unknown>;
};

const clip = (s: string | undefined, n = 200) => (s ?? "").toString().trim().slice(0, n);

export async function createLead(input: LeadInput): Promise<number> {
  const res = await db()
    .prepare("insert into leads (yard_id, kind, part_id, name, phone, email, zip, data) values (?,?,?,?,?,?,?,?)")
    .run(
      input.yardId,
      input.kind,
      input.partId ?? null,
      clip(input.name),
      clip(input.phone, 40),
      clip(input.email),
      clip(input.zip, 10),
      JSON.stringify(input.data ?? {}).slice(0, 8000),
    );
  return Number(res.lastInsertRowid);
}

export async function listLeads(yardId: number | null, kind?: LeadKind, limit = 200): Promise<Lead[]> {
  const yardClause = yardId == null ? "yard_id is null" : "yard_id = ?";
  const args: (number | string)[] = yardId == null ? [] : [yardId];
  let sql = `select * from leads where ${yardClause}`;
  if (kind) {
    sql += " and kind = ?";
    args.push(kind);
  }
  sql += " order by id desc limit ?";
  args.push(limit);
  return (await db().prepare(sql).all(...args)) as Lead[];
}

export async function setLeadStatus(yardId: number | null, id: number, status: Lead["status"]): Promise<void> {
  if (yardId == null) await db().prepare("update leads set status = ? where id = ? and yard_id is null").run(status, id);
  else await db().prepare("update leads set status = ? where id = ? and yard_id = ?").run(status, id, yardId);
}

export async function newLeadCounts(yardId: number): Promise<Record<string, number>> {
  const rows = (await db()
    .prepare("select kind, count(*) as n from leads where yard_id = ? and status = 'new' group by kind")
    .all(yardId)) as { kind: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.kind, r.n]));
}

export function leadData(lead: Pick<Lead, "data">): Record<string, unknown> {
  try {
    return JSON.parse(lead.data) as Record<string, unknown>;
  } catch {
    return {};
  }
}
