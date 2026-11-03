import { createClient, type ResultSet } from "@libsql/client/web";
import { demoYardStatements } from "./seed";

// Hosted: Turso over HTTP, because Vercel has no disk that survives a deploy.
// Local: a SQLite file at data/app.db. Turso is SQLite too, so the SQL is the same either way.

export type Arg = string | number | null;
export type Statement = { sql: string; args: Arg[] };
type Row = Record<string, unknown>;
type Written = { changes: number; lastInsertRowid: number };

type Backend = {
  query(s: Statement): Promise<Row[]>;
  write(s: Statement): Promise<Written>;
  batch(statements: Statement[]): Promise<void>;
  script(sql: string): Promise<void>;
};

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
  photo_credit text not null default '',
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

function connectTurso(url: string): Backend {
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  const written = (r: ResultSet): Written => ({ changes: r.rowsAffected, lastInsertRowid: Number(r.lastInsertRowid ?? 0) });
  return {
    // Copied to plain objects: libSQL's rows also carry numeric keys, and rows get passed around as data.
    query: async (s) => {
      const r = await client.execute(s);
      return r.rows.map((row) => Object.fromEntries(r.columns.map((c, i) => [c, row[i]])));
    },
    write: async (s) => written(await client.execute(s)),
    batch: async (statements) => {
      await client.batch(statements, "write");
    },
    script: (sql) => client.executeMultiple(sql),
  };
}

async function openLocalFile(): Promise<Backend> {
  const [{ DatabaseSync }, fs, path] = await Promise.all([import("node:sqlite"), import("node:fs"), import("node:path")]);
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const conn = new DatabaseSync(file);
  conn.exec("pragma journal_mode = wal; pragma foreign_keys = on; pragma busy_timeout = 5000;");
  const run = (s: Statement): Written => {
    const r = conn.prepare(s.sql).run(...s.args);
    return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
  };
  return {
    query: async (s) => conn.prepare(s.sql).all(...s.args).map((row) => ({ ...row })),
    write: async (s) => run(s),
    batch: async (statements) => {
      conn.exec("begin");
      try {
        statements.forEach(run);
        conn.exec("commit");
      } catch (err) {
        conn.exec("rollback");
        throw err;
      }
    },
    script: async (sql) => conn.exec(sql),
  };
}

async function open(): Promise<Backend> {
  const url = process.env.TURSO_DATABASE_URL;
  const backend = url ? connectTurso(url) : await openLocalFile();
  await backend.script(SCHEMA);
  const isEmpty = async () => (await backend.query({ sql: "select count(*) as n from yards", args: [] }))[0].n === 0;
  if (await isEmpty()) {
    try {
      await backend.batch(demoYardStatements());
    } catch (err) {
      // Two servers starting at once: the second one hits the unique slug and rolls back, which is fine.
      if (await isEmpty()) throw err;
    }
  }
  return backend;
}

const globalForDb = globalThis as unknown as { __pardicalDb?: Promise<Backend> };

function backend(): Promise<Backend> {
  // A failed start isn't kept, so the next request tries again.
  return (globalForDb.__pardicalDb ??= open().catch((err) => {
    globalForDb.__pardicalDb = undefined;
    throw err;
  }));
}

export function db() {
  return {
    prepare: (sql: string) => ({
      get: async (...args: Arg[]) => (await (await backend()).query({ sql, args }))[0] as Row | undefined,
      all: async (...args: Arg[]) => (await backend()).query({ sql, args }),
      run: async (...args: Arg[]) => (await backend()).write({ sql, args }),
    }),
  };
}

/** Run several writes all-or-nothing. */
export async function batch(statements: Statement[]): Promise<void> {
  if (statements.length) await (await backend()).batch(statements);
}

/** Large write jobs, sent in slices so no single request to the database gets huge. Each slice is all-or-nothing. */
export async function batchInSlices(statements: Statement[], size = 200): Promise<void> {
  for (let i = 0; i < statements.length; i += size) await batch(statements.slice(i, i + size));
}
