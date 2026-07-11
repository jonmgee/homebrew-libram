import { PREVIEW_ENTRIES, PREVIEW_USER } from "./previewFixtures";

/**
 * In-memory stand-in for the Supabase client, used only when
 * VITE_PREVIEW_MODE=1. Lets the whole app run — browse, detail,
 * create, edit, delete — against fixture data with no network,
 * no auth and no real database. Never active in production.
 */

type Row = Record<string, unknown>;

const stores: Record<string, Row[]> = {
  entries: PREVIEW_ENTRIES.map((e) => ({ ...e })),
  libram_shares: [],
};
let nextId = 1000;

const ok = <T>(data: T) => ({ data, error: null });
const notFound = () => ({
  data: null,
  error: { code: "PGRST116", message: "Row not found" },
});

const mockSession = {
  user: {
    id: PREVIEW_USER.id,
    email: PREVIEW_USER.email,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
  access_token: "preview",
  token_type: "bearer",
};

type Filter = (row: Row) => boolean;

class MockQuery {
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private filters: Filter[] = [];
  private orderKey: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private singleRow = false;
  private payload: Row | Row[] | null = null;

  constructor(private table: string) {}

  select(_cols?: string) {
    if (this.mode === "select") this.mode = "select";
    return this;
  }
  insert(rows: Row | Row[]) {
    this.mode = "insert";
    this.payload = rows;
    return this;
  }
  update(patch: Row) {
    this.mode = "update";
    this.payload = patch;
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  ilike(col: string, pattern: string) {
    const rx = new RegExp(
      "^" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$",
      "i",
    );
    this.filters.push((r) => rx.test(String(r[col] ?? "")));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderKey = col;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.singleRow = true;
    return this;
  }

  private run(): { data: unknown; error: unknown } {
    const store = stores[this.table] ?? [];
    const matches = () => store.filter((e) => this.filters.every((f) => f(e)));

    if (this.mode === "insert") {
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload]) as Row[];
      const created = rows.map((r) => {
        const defaults: Row =
          this.table === "libram_shares"
            ? { token: crypto.randomUUID(), created_at: new Date().toISOString() }
            : { created_at: new Date().toISOString(), tags: [], properties: {} };
        const row: Row = { ...defaults, ...r };
        if (this.table === "entries") row.id = `preview-${nextId++}`;
        store.push(row);
        return row;
      });
      const data = this.singleRow ? created[0] : created;
      return ok(data);
    }

    if (this.mode === "update") {
      const hit = matches();
      for (const row of hit) Object.assign(row, this.payload);
      return ok(this.singleRow ? (hit[0] ?? null) : hit);
    }

    if (this.mode === "delete") {
      const hit = new Set(matches());
      stores[this.table] = store.filter((e) => !hit.has(e));
      return ok(null);
    }

    let rows = matches();
    if (this.orderKey) {
      const k = this.orderKey;
      const dir = this.orderAsc ? 1 : -1;
      rows = [...rows].sort((a, b) =>
        String((a as unknown as Row)[k] ?? "").localeCompare(
          String((b as unknown as Row)[k] ?? ""),
        ) * dir,
      );
    }
    if (this.limitN !== null) rows = rows.slice(0, this.limitN);
    if (this.singleRow) {
      if (!rows.length) return notFound();
      return ok({ ...rows[0] });
    }
    return ok(rows.map((r) => ({ ...r })));
  }

  then<T>(resolve: (v: { data: unknown; error: unknown }) => T): Promise<T> {
    // Small delay so loading states render like the real client
    return new Promise((r) => setTimeout(r, 60)).then(() => resolve(this.run()));
  }
}

export function createMockClient() {
  return {
    from(table: string) {
      if (!stores[table]) {
        console.warn(`[preview] Unmocked table "${table}"`);
        stores[table] = [];
      }
      return new MockQuery(table);
    },
    rpc(fn: string, args: Record<string, unknown>) {
      const exec = (): { data: unknown; error: unknown } => {
        if (fn === "get_shared_entry") {
          return ok(
            stores.entries!
              .filter((e) => e.share_token && e.share_token === args.p_token)
              .map((e) => ({ ...e })),
          );
        }
        if (fn === "get_shared_libram") {
          const share = stores.libram_shares!.find((s) => s.token === args.p_token);
          if (!share) return ok([]);
          return ok(
            stores.entries!
              .filter((e) => !e.dm_only)
              .map((e) => ({ ...e }))
              .sort((a, b) => String(a.name).localeCompare(String(b.name))),
          );
        }
        return { data: null, error: { message: `Unmocked rpc "${fn}"` } };
      };
      return {
        then<T>(resolve: (v: { data: unknown; error: unknown }) => T): Promise<T> {
          return new Promise((r) => setTimeout(r, 60)).then(() => resolve(exec()));
        },
      };
    },
    auth: {
      getSession: async () => ok({ session: mockSession }),
      onAuthStateChange: (_cb: unknown) => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      signInWithPassword: async () => ok({ session: mockSession, user: mockSession.user }),
      signUp: async () => ok({ session: mockSession, user: mockSession.user }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
    },
    storage: {
      from(_bucket: string) {
        return {
          upload: async () => ({ error: null }),
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `/assets/all_items.webp#${path}` },
          }),
        };
      },
    },
  };
}
