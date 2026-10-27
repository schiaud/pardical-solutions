import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seedDemoYard } from "./seed";

// One SQLite file for the MVP. Swap this module for Postgres when a yard goes live on hosting.
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db");

const SCHEMA = `
create table if not exists yards (
  id integer primary key,
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  hours text not null default '',
  about_text text not null default '',
  warranty_text text not null default '',
  returns_text text not null default '',
  pickup_note text not null default '',
  brand_color text not null default '#1e3a5f',
  logo_url text not null default '',
  custom_domain text,
  owner_password_hash text,
  created_at text not null default (datetime('now'))
);

create table if not exists parts (
  id integer primary key,
  yard_id integer not null references yards(id),
  stock_no text not null,
  year integer,
  make text not null default '',
  model text not null default '',
  part_type text not null default '',
  description text not null default '',
  interchange text not null default '',
  oem_number text not null default '',
  grade text not null default '',
  mileage integer,
  donor_vin text not null default '',
  price_cents integer,
  core_charge_cents integer not null default 0,
  location text not null default '',
  photos text not null default '[]',
  status text not null default 'available',
  suggested_price_cents integer,
  suggestion_source text,
  suggestion_note text,
  suggested_at text,
  price_approved_at text,
  fb_posted_at text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  unique (yard_id, stock_no)
);
create index if not exists parts_search on parts (yard_id, status, make, model, year);

create table if not exists leads (
  id integer primary key,
  yard_id integer references yards(id),
  kind text not null,
  part_id integer references parts(id),
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  zip text not null default '',
  data text not null default '{}',
  status text not null default 'new',
  created_at text not null default (datetime('now'))
);
create index if not exists leads_yard on leads (yard_id, kind, created_at);

create table if not exists chat_messages (
  id integer primary key,
  yard_id integer not null references yards(id),
  session_id text not null,
  role text not null,
  content text not null,
  created_at text not null default (datetime('now'))
);
create index if not exists chat_session on chat_messages (yard_id, session_id, id);
`;

/** Columns added after the first release. */
function migrate(conn: DatabaseSync): void {
  const cols = (conn.prepare("pragma table_info(parts)").all() as { name: string }[]).map((c) => c.name);
  // Credit line for photos used under a Creative Commons license (e.g. "UAB Partecha · CC BY-SA 4.0|<source url>").
  if (!cols.includes("photo_credit")) conn.exec("alter table parts add column photo_credit text not null default ''");
}

const globalForDb = globalThis as unknown as { __pardicalDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (globalForDb.__pardicalDb) return globalForDb.__pardicalDb;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const conn = new DatabaseSync(DB_PATH);
  conn.exec("pragma journal_mode = wal; pragma foreign_keys = on; pragma busy_timeout = 5000;");
  conn.exec(SCHEMA);
  migrate(conn);
  const { n } = conn.prepare("select count(*) as n from yards").get() as { n: number };
  if (n === 0) seedDemoYard(conn);
  globalForDb.__pardicalDb = conn;
  return conn;
}

/** Run several statements atomically. */
export function tx<T>(fn: () => T): T {
  const conn = db();
  conn.exec("begin");
  try {
    const out = fn();
    conn.exec("commit");
    return out;
  } catch (err) {
    conn.exec("rollback");
    throw err;
  }
}
