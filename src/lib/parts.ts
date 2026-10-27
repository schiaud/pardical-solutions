import { db, tx } from "./db";
import type { Part, PartStatus } from "./types";

export type PartQuery = {
  year?: number | null;
  make?: string;
  model?: string;
  part?: string;
  q?: string;
  status?: PartStatus | "all";
  limit?: number;
  offset?: number;
};

function where(yardId: number, query: PartQuery): { sql: string; args: (string | number)[] } {
  const clauses = ["yard_id = ?"];
  const args: (string | number)[] = [yardId];
  const status = query.status ?? "available";
  if (status !== "all") {
    clauses.push("status = ?");
    args.push(status);
  }
  if (query.year) {
    clauses.push("year = ?");
    args.push(query.year);
  }
  if (query.make) {
    clauses.push("lower(make) = lower(?)");
    args.push(query.make);
  }
  if (query.model) {
    clauses.push("lower(model) = lower(?)");
    args.push(query.model);
  }
  if (query.part) {
    clauses.push("lower(part_type) = lower(?)");
    args.push(query.part);
  }
  for (const word of (query.q ?? "").split(/\s+/).filter((w) => w.length > 1).slice(0, 6)) {
    clauses.push(
      "(lower(make || ' ' || model || ' ' || part_type || ' ' || description || ' ' || interchange || ' ' || oem_number || ' ' || stock_no || ' ' || coalesce(year,'')) like lower(?))",
    );
    args.push(`%${word}%`);
  }
  return { sql: clauses.join(" and "), args };
}

export function searchParts(yardId: number, query: PartQuery = {}): { parts: Part[]; total: number } {
  const { sql, args } = where(yardId, query);
  const { n } = db().prepare(`select count(*) as n from parts where ${sql}`).get(...args) as { n: number };
  const parts = db()
    .prepare(`select * from parts where ${sql} order by updated_at desc, id desc limit ? offset ?`)
    .all(...args, query.limit ?? 24, query.offset ?? 0) as Part[];
  return { parts, total: n };
}

export function getPart(yardId: number, id: number): Part | null {
  return (db().prepare("select * from parts where yard_id = ? and id = ?").get(yardId, id) as Part | undefined) ?? null;
}

export function partsByIds(yardId: number, ids: number[]): Part[] {
  if (!ids.length) return [];
  return db()
    .prepare(`select * from parts where yard_id = ? and id in (${ids.map(() => "?").join(",")})`)
    .all(yardId, ...ids) as Part[];
}

export function facets(yardId: number): { makes: string[]; models: Record<string, string[]>; years: number[]; partTypes: string[] } {
  const rows = db()
    .prepare("select distinct make, model from parts where yard_id = ? and status = 'available' and make <> '' order by make, model")
    .all(yardId) as { make: string; model: string }[];
  const models: Record<string, string[]> = {};
  for (const r of rows) (models[r.make] ??= []).push(r.model);
  const years = (
    db().prepare("select distinct year from parts where yard_id = ? and status = 'available' and year is not null order by year desc").all(yardId) as { year: number }[]
  ).map((r) => r.year);
  const partTypes = (
    db().prepare("select part_type, count(*) as n from parts where yard_id = ? and status = 'available' and part_type <> '' group by part_type order by n desc, part_type").all(yardId) as { part_type: string }[]
  ).map((r) => r.part_type);
  return { makes: Object.keys(models), models, years, partTypes };
}

export function stats(yardId: number) {
  const row = db()
    .prepare(
      `select
        sum(status = 'available') as available,
        sum(status = 'sold') as sold,
        sum(status = 'available' and price_cents is null) as unpriced,
        sum(status = 'available' and suggested_price_cents is not null and (price_cents is null or suggested_price_cents <> price_cents)) as suggestions,
        sum(status = 'available' and fb_posted_at is not null) as fb_posted,
        sum(case when status = 'available' then coalesce(price_cents, 0) else 0 end) as value_cents
       from parts where yard_id = ?`,
    )
    .get(yardId) as Record<string, number | null>;
  return {
    available: row.available ?? 0,
    sold: row.sold ?? 0,
    unpriced: row.unpriced ?? 0,
    suggestions: row.suggestions ?? 0,
    fbPosted: row.fb_posted ?? 0,
    valueCents: row.value_cents ?? 0,
  };
}

export type PartInput = {
  stock_no: string;
  year: number | null;
  make: string;
  model: string;
  part_type: string;
  description: string;
  interchange: string;
  oem_number: string;
  grade: string;
  mileage: number | null;
  donor_vin: string;
  price_cents: number | null;
  core_charge_cents: number;
  location: string;
  photos: string[];
  status?: PartStatus;
};

/**
 * Upsert an inventory export. With fullFile, anything the yard no longer exports is
 * treated as sold so it comes off the store and every feed.
 */
export function importParts(yardId: number, rows: PartInput[], fullFile: boolean) {
  let added = 0;
  let updated = 0;
  let removed = 0;
  tx(() => {
    const find = db().prepare("select id from parts where yard_id = ? and stock_no = ?");
    const insert = db().prepare(
      `insert into parts (yard_id, stock_no, year, make, model, part_type, description, interchange, oem_number, grade, mileage, donor_vin, price_cents, core_charge_cents, location, photos, status)
       values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );
    const update = db().prepare(
      `update parts set year=?, make=?, model=?, part_type=?, description=?, interchange=?, oem_number=?, grade=?, mileage=?, donor_vin=?,
         price_cents=coalesce(?, price_cents), core_charge_cents=?, location=?, photos=?, status=?, updated_at=datetime('now')
       where id = ?`,
    );
    const seen: string[] = [];
    for (const r of rows) {
      seen.push(r.stock_no);
      const status = r.status ?? "available";
      const existing = find.get(yardId, r.stock_no) as { id: number } | undefined;
      const common = [r.year, r.make, r.model, r.part_type, r.description, r.interchange, r.oem_number, r.grade, r.mileage, r.donor_vin] as const;
      if (existing) {
        update.run(...common, r.price_cents, r.core_charge_cents, r.location, JSON.stringify(r.photos), status, existing.id);
        updated++;
      } else {
        insert.run(yardId, r.stock_no, ...common, r.price_cents, r.core_charge_cents, r.location, JSON.stringify(r.photos), status);
        added++;
      }
    }
    if (fullFile && seen.length) {
      const res = db()
        .prepare(
          `update parts set status = 'sold', updated_at = datetime('now')
           where yard_id = ? and status = 'available' and stock_no not in (${seen.map(() => "?").join(",")})`,
        )
        .run(yardId, ...seen);
      removed = Number(res.changes);
    }
  });
  return { added, updated, removed };
}

export function setStatus(yardId: number, id: number, status: PartStatus): void {
  db().prepare("update parts set status = ?, updated_at = datetime('now') where yard_id = ? and id = ?").run(status, yardId, id);
}

export function setSuggestion(id: number, cents: number | null, source: string, note: string): void {
  db()
    .prepare("update parts set suggested_price_cents = ?, suggestion_source = ?, suggestion_note = ?, suggested_at = datetime('now') where id = ?")
    .run(cents, source, note, id);
}

/** Owner approves suggestions: the suggested price becomes the live price everywhere. */
export function approveSuggestions(yardId: number, ids: number[]): number {
  if (!ids.length) return 0;
  const res = db()
    .prepare(
      `update parts set price_cents = suggested_price_cents, price_approved_at = datetime('now'), updated_at = datetime('now')
       where yard_id = ? and suggested_price_cents is not null and id in (${ids.map(() => "?").join(",")})`,
    )
    .run(yardId, ...ids);
  return Number(res.changes);
}

export function setPrice(yardId: number, id: number, cents: number | null): void {
  db().prepare("update parts set price_cents = ?, price_approved_at = datetime('now'), updated_at = datetime('now') where yard_id = ? and id = ?").run(cents, yardId, id);
}

export function markFbPosted(yardId: number, id: number, posted: boolean): void {
  db()
    .prepare(`update parts set fb_posted_at = ${posted ? "datetime('now')" : "null"} where yard_id = ? and id = ?`)
    .run(yardId, id);
}

export function postedTodayCount(yardId: number): number {
  const { n } = db()
    .prepare("select count(*) as n from parts where yard_id = ? and fb_posted_at >= datetime('now', 'start of day')")
    .get(yardId) as { n: number };
  return n;
}

export function hasCreditedPhotos(yardId: number): boolean {
  return !!db().prepare("select 1 from parts where yard_id = ? and photo_credit <> '' limit 1").get(yardId);
}

export function allAvailable(yardId: number): Part[] {
  return db().prepare("select * from parts where yard_id = ? and status = 'available' order by id").all(yardId) as Part[];
}

export function partsNeedingPrice(yardId: number, limit = 500): Part[] {
  return db()
    .prepare(
      `select * from parts where yard_id = ? and status = 'available'
       order by (suggested_price_cents is null) desc, suggested_at asc, id limit ?`,
    )
    .all(yardId, limit) as Part[];
}
