import { batchInSlices, db, type Arg, type Statement } from "./db";
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

export async function searchParts(yardId: number, query: PartQuery = {}): Promise<{ parts: Part[]; total: number }> {
  const { sql, args } = where(yardId, query);
  const [count, parts] = await Promise.all([
    db().prepare(`select count(*) as n from parts where ${sql}`).get(...args),
    db().prepare(`select * from parts where ${sql} order by updated_at desc, id desc limit ? offset ?`).all(...args, query.limit ?? 24, query.offset ?? 0),
  ]);
  return { parts: parts as Part[], total: (count as { n: number }).n };
}

export async function getPart(yardId: number, id: number): Promise<Part | null> {
  return ((await db().prepare("select * from parts where yard_id = ? and id = ?").get(yardId, id)) as Part | undefined) ?? null;
}

export async function partsByIds(yardId: number, ids: number[]): Promise<Part[]> {
  if (!ids.length) return [];
  return (await db()
    .prepare(`select * from parts where yard_id = ? and id in (${ids.map(() => "?").join(",")})`)
    .all(yardId, ...ids)) as Part[];
}

export async function facets(yardId: number): Promise<{ makes: string[]; models: Record<string, string[]>; years: number[]; partTypes: string[] }> {
  const [vehicles, yearRows, typeRows] = await Promise.all([
    db().prepare("select distinct make, model from parts where yard_id = ? and status = 'available' and make <> '' order by make, model").all(yardId),
    db().prepare("select distinct year from parts where yard_id = ? and status = 'available' and year is not null order by year desc").all(yardId),
    db().prepare("select part_type, count(*) as n from parts where yard_id = ? and status = 'available' and part_type <> '' group by part_type order by n desc, part_type").all(yardId),
  ]);
  const models: Record<string, string[]> = {};
  for (const r of vehicles as { make: string; model: string }[]) (models[r.make] ??= []).push(r.model);
  const years = (yearRows as { year: number }[]).map((r) => r.year);
  const partTypes = (typeRows as { part_type: string }[]).map((r) => r.part_type);
  return { makes: Object.keys(models), models, years, partTypes };
}

export async function stats(yardId: number) {
  const row = (await db()
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
    .get(yardId)) as Record<string, number | null>;
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

const UPSERT_PART = `insert into parts (yard_id, stock_no, year, make, model, part_type, description, interchange, oem_number, grade, mileage, donor_vin, price_cents, core_charge_cents, location, photos, status)
  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  on conflict (yard_id, stock_no) do update set
    year=excluded.year, make=excluded.make, model=excluded.model, part_type=excluded.part_type, description=excluded.description,
    interchange=excluded.interchange, oem_number=excluded.oem_number, grade=excluded.grade, mileage=excluded.mileage, donor_vin=excluded.donor_vin,
    price_cents=coalesce(excluded.price_cents, price_cents), core_charge_cents=excluded.core_charge_cents, location=excluded.location,
    photos=excluded.photos, status=excluded.status, updated_at=datetime('now')`;

/**
 * Upsert an inventory export. With fullFile, anything the yard no longer exports is
 * treated as sold so it comes off the store and every feed. Importing the same file again is
 * safe, and marking parts sold comes last, so a failed import never takes parts off sale.
 */
export async function importParts(yardId: number, rows: PartInput[], fullFile: boolean) {
  const existing = (await db().prepare("select id, stock_no, status from parts where yard_id = ?").all(yardId)) as { id: number; stock_no: string; status: string }[];
  const known = new Set(existing.map((p) => p.stock_no));
  const seen = new Set<string>();
  let added = 0;
  let updated = 0;
  const writes: Statement[] = rows.map((r) => {
    seen.add(r.stock_no);
    if (known.has(r.stock_no)) updated++;
    else {
      known.add(r.stock_no);
      added++;
    }
    return {
      sql: UPSERT_PART,
      args: [
        yardId, r.stock_no, r.year, r.make, r.model, r.part_type, r.description, r.interchange, r.oem_number, r.grade, r.mileage, r.donor_vin,
        r.price_cents, r.core_charge_cents, r.location, JSON.stringify(r.photos), r.status ?? "available",
      ],
    };
  });
  const gone = fullFile && seen.size ? existing.filter((p) => p.status === "available" && !seen.has(p.stock_no)).map((p) => p.id) : [];
  for (let i = 0; i < gone.length; i += 500) {
    const ids = gone.slice(i, i + 500);
    writes.push({ sql: `update parts set status = 'sold', updated_at = datetime('now') where id in (${ids.map(() => "?").join(",")})`, args: ids });
  }
  await batchInSlices(writes);
  return { added, updated, removed: gone.length };
}

export async function setStatus(yardId: number, id: number, status: PartStatus): Promise<void> {
  await db().prepare("update parts set status = ?, updated_at = datetime('now') where yard_id = ? and id = ?").run(status, yardId, id);
}

export async function setSuggestions(items: { id: number; cents: number | null; source: string; note: string }[]): Promise<void> {
  await batchInSlices(
    items.map(({ id, cents, source, note }) => ({
      sql: "update parts set suggested_price_cents = ?, suggestion_source = ?, suggestion_note = ?, suggested_at = datetime('now') where id = ?",
      args: [cents, source, note, id] as Arg[],
    })),
  );
}

/** Owner approves suggestions: the suggested price becomes the live price everywhere. */
export async function approveSuggestions(yardId: number, ids: number[]): Promise<number> {
  if (!ids.length) return 0;
  const res = await db()
    .prepare(
      `update parts set price_cents = suggested_price_cents, price_approved_at = datetime('now'), updated_at = datetime('now')
       where yard_id = ? and suggested_price_cents is not null and id in (${ids.map(() => "?").join(",")})`,
    )
    .run(yardId, ...ids);
  return Number(res.changes);
}

export async function setPrice(yardId: number, id: number, cents: number | null): Promise<void> {
  await db().prepare("update parts set price_cents = ?, price_approved_at = datetime('now'), updated_at = datetime('now') where yard_id = ? and id = ?").run(cents, yardId, id);
}

export async function markFbPosted(yardId: number, id: number, posted: boolean): Promise<void> {
  await db()
    .prepare(`update parts set fb_posted_at = ${posted ? "datetime('now')" : "null"} where yard_id = ? and id = ?`)
    .run(yardId, id);
}

export async function postedTodayCount(yardId: number): Promise<number> {
  const { n } = (await db()
    .prepare("select count(*) as n from parts where yard_id = ? and fb_posted_at >= datetime('now', 'start of day')")
    .get(yardId)) as { n: number };
  return n;
}

export async function hasCreditedPhotos(yardId: number): Promise<boolean> {
  return !!(await db().prepare("select 1 from parts where yard_id = ? and photo_credit <> '' limit 1").get(yardId));
}

export async function allAvailable(yardId: number): Promise<Part[]> {
  return (await db().prepare("select * from parts where yard_id = ? and status = 'available' order by id").all(yardId)) as Part[];
}

export async function partsNeedingPrice(yardId: number, limit = 500): Promise<Part[]> {
  return (await db()
    .prepare(
      `select * from parts where yard_id = ? and status = 'available'
       order by (suggested_price_cents is null) desc, suggested_at asc, id limit ?`,
    )
    .all(yardId, limit)) as Part[];
}
