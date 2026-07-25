/**
 * Supabase admin client (server-side only).
 *
 * Uses the service_role key which bypasses Row Level Security.
 * NEVER expose this key or this client to the browser.
 *
 * All database access from route handlers goes through this module.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Disable the Supabase Auth helpers — we manage auth ourselves via JWT
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Detect a network-level failure to reach Supabase (project paused/deleted,
 * DNS not resolving, or no internet) and turn it into a clear, actionable
 * 503 instead of a cryptic "fetch failed".
 */
function reachabilityError(err: any): Error | null {
  const msg = String(err?.message ?? '');
  const cause = String(err?.cause?.code ?? err?.cause?.message ?? '');
  // The Supabase/Cloudflare error object often has NO .message — the useful
  // fields (error_name, status:521, title) live on the object itself, so
  // include a full stringify in the haystack.
  let dump = '';
  try { dump = JSON.stringify(err); } catch { dump = String(err); }
  const haystack = `${msg} ${cause} ${dump}`;
  const looksUnreachable =
    // Network-level failures (DNS, refused, timeout, no internet)
    /fetch failed|network|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|getaddrinfo/i.test(
      haystack
    ) ||
    // Paused/offline Supabase project → Cloudflare origin-down (521/522/523)
    /origin_down|web server is down|cloudflare_error|error 52[0-3]|"status":\s*52[0-3]/i.test(
      haystack
    );
  if (looksUnreachable) {
    return Object.assign(
      new Error(
        'Cannot reach the database. The Supabase project may be paused or offline — ' +
          'restore it from your Supabase dashboard, then try again.'
      ),
      { status: 503 }
    );
  }
  return null;
}

/**
 * Thin helper: throw a readable error if the Supabase query failed.
 * Usage:  const rows = sb(await supabase.from('User').select());
 */
export function sb<T>(result: { data: T | null; error: any }): T {
  if (result.error) {
    const unreachable = reachabilityError(result.error);
    if (unreachable) throw unreachable;
    const msg = result.error.message ?? JSON.stringify(result.error);
    throw Object.assign(new Error(`DB error: ${msg}`), { status: 500 });
  }
  if (result.data === null) {
    throw Object.assign(new Error('DB returned null'), { status: 500 });
  }
  return result.data;
}

/**
 * Same as `sb` but returns null when the row doesn't exist
 * (Supabase returns [] for .eq() + .single() misses, so we handle both).
 */
export function sbMaybe<T>(result: { data: T | null; error: any }): T | null {
  if (result.error && result.error.code !== 'PGRST116') {
    const unreachable = reachabilityError(result.error);
    if (unreachable) throw unreachable;
    const msg = result.error.message ?? JSON.stringify(result.error);
    throw Object.assign(new Error(`DB error: ${msg}`), { status: 500 });
  }
  return result.data;
}
