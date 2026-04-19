/**
 * Lightweight Supabase REST client (no SDK, no extra deps).
 *
 * We hit the PostgREST endpoint directly with fetch(). This keeps the
 * bundle tiny and avoids any esm.sh / import-map / CDN fragility on Vercel.
 *
 * Configuration — set these as environment variables on Vercel
 * (Project Settings → Environment Variables), or in a local `.env` file:
 *
 *   VITE_SUPABASE_URL        = https://xxxxxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY   = eyJhbGci... (the anon / public key)
 *
 * Public viewers use the anon key — they can READ posts and INSERT hearts,
 * nothing else. Owner write access is enforced server-side by RLS policies
 * that check `current_setting('request.headers')->>'x-owner-key'` against
 * a secret. The owner's browser sends that header after login.
 *
 *   VITE_OWNER_WRITE_KEY     = a long random string you choose
 *
 * If any of these are missing, `isRemoteEnabled()` returns false and the
 * app falls back to localStorage (good for local dev without secrets).
 */

const URL_RAW = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
const OWNER_KEY = (import.meta as any).env?.VITE_OWNER_WRITE_KEY as string | undefined;

const SUPABASE_URL = URL_RAW?.replace(/\/+$/, '') || '';

export function isRemoteEnabled(): boolean {
  return !!(SUPABASE_URL && ANON_KEY);
}

export function hasOwnerWriteKey(): boolean {
  return !!OWNER_KEY;
}

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'HEAD';
  path: string;                // e.g. "posts?select=*"
  body?: unknown;
  asOwner?: boolean;           // include x-owner-key
  prefer?: string;             // e.g. "return=representation"
  /** When true, returns the raw Response so callers can read headers */
  rawResponse?: boolean;
};

async function sbFetch<T = any>(opts: FetchOpts): Promise<T> {
  if (!isRemoteEnabled()) {
    throw new Error('Supabase is not configured.');
  }

  const headers: Record<string, string> = {
    apikey: ANON_KEY!,
    Authorization: `Bearer ${ANON_KEY!}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (opts.prefer) headers.Prefer = opts.prefer;
  if (opts.asOwner && OWNER_KEY) headers['x-owner-key'] = OWNER_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${opts.path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase ${res.status}: ${text || res.statusText}`);
  }

  if (opts.rawResponse) return res as unknown as T;

  // 204 = no content
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined as T;
  return (await res.json()) as T;
}

export const supa = {
  select: <T = any>(path: string) => sbFetch<T[]>({ method: 'GET', path }),
  insert: <T = any>(table: string, row: unknown, asOwner = false) =>
    sbFetch<T[]>({
      method: 'POST',
      path: table,
      body: row,
      asOwner,
      prefer: 'return=representation',
    }),
  /**
   * Insert that tolerates uniqueness-violation conflicts (returns null
   * instead of throwing). Useful for idempotent actions like hearting.
   */
  insertIgnoreConflict: async <T = any>(
    table: string,
    row: unknown
  ): Promise<T[] | null> => {
    try {
      return await sbFetch<T[]>({
        method: 'POST',
        path: table,
        body: row,
        prefer: 'return=representation,resolution=ignore-duplicates',
      });
    } catch (e: any) {
      // 409 conflict → row already exists, that's fine for idempotency
      if (String(e?.message || '').includes('409')) return null;
      throw e;
    }
  },
  update: <T = any>(path: string, patch: unknown, asOwner = false) =>
    sbFetch<T[]>({
      method: 'PATCH',
      path,
      body: patch,
      asOwner,
      prefer: 'return=representation',
    }),
  remove: (path: string, asOwner = false) =>
    sbFetch<void>({ method: 'DELETE', path, asOwner }),
  /**
   * Return an exact count of matching rows. Uses PostgREST's
   * `Prefer: count=exact` + `Range: 0-0` to fetch just the header.
   * This is the most reliable way to get a real-time count without
   * depending on triggers or cached materialized columns.
   */
  count: async (path: string): Promise<number> => {
    if (!isRemoteEnabled()) throw new Error('Supabase is not configured.');
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}${sep}select=id`, {
      method: 'GET',
      headers: {
        apikey: ANON_KEY!,
        Authorization: `Bearer ${ANON_KEY!}`,
        Prefer: 'count=exact',
        Range: '0-0',
        'Range-Unit': 'items',
      },
    });
    if (!res.ok && res.status !== 206) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase ${res.status}: ${text || res.statusText}`);
    }
    // Content-Range header looks like "0-0/42" or "*/0"
    const cr = res.headers.get('content-range') || '';
    const total = cr.split('/')[1];
    const n = parseInt(total || '0', 10);
    return isNaN(n) ? 0 : n;
  },
};
