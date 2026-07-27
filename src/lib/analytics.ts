/**
 * PostHog analytics.
 *
 * Configured via env vars so no key is hard-coded:
 *   VITE_POSTHOG_KEY   – your project's PUBLIC api key (starts with "phc_")
 *   VITE_POSTHOG_HOST  – ingestion host (US: https://us.i.posthog.com,
 *                        EU: https://eu.i.posthog.com). Defaults to US.
 *
 * If VITE_POSTHOG_KEY is unset (e.g. local dev), every call here is a safe
 * no-op, so analytics simply stays off.
 *
 * Privacy: this is a health app, so we use identified-only person profiles and
 * disable session recording. We never send health data (conditions, symptoms,
 * triggers) to PostHog — only an id + basic account fields on identify.
 */
import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

export const analyticsEnabled = Boolean(KEY);

let inited = false;

export function initAnalytics() {
  if (!analyticsEnabled || inited) return;
  inited = true;
  posthog.init(KEY as string, {
    api_host: HOST,
    // Only create person profiles for logged-in users, not anonymous visitors.
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    // Never record the screen — this app shows sensitive health information.
    disable_session_recording: true,
  });
  // Expose for debugging / manual capture from the browser console.
  if (typeof window !== 'undefined') (window as unknown as { posthog: typeof posthog }).posthog = posthog;
}

/** Tie subsequent events to a user. Only non-health account fields are sent. */
export function identifyUser(
  id: string,
  props?: { email?: string | null; username?: string | null; name?: string | null }
) {
  if (!analyticsEnabled) return;
  const clean: Record<string, unknown> = {};
  if (props?.email) clean.email = props.email;
  if (props?.username) clean.username = props.username;
  if (props?.name) clean.name = props.name;
  posthog.identify(id, clean);
}

/** Clear the identified user (call on logout). */
export function resetAnalytics() {
  if (!analyticsEnabled) return;
  posthog.reset();
}

/** Track a custom event (no-op when analytics is disabled). */
export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (!analyticsEnabled) return;
  posthog.capture(event, props);
}

// ── Log-duration timing ─────────────────────────────────────────────────────
// Measures how long a user takes to complete a log (symptom / medication /
// diet), so we can prove logging stays under 60s. Uses a monotonic clock
// (performance.now) so it's immune to system-clock changes.
export type LogType = 'symptom' | 'medication' | 'diet';

const logTimers = new Map<LogType, number>();

/** Start the clock for a log — call when the form/dialog opens. */
export function startLogTimer(logType: LogType) {
  logTimers.set(logType, performance.now());
}

/**
 * Fire a `log_completed` event with how long it took. No-op if analytics is
 * off or no timer was started (so a save without a matching open is ignored).
 */
export function trackLogCompleted(logType: LogType, props: Record<string, unknown> = {}) {
  const start = logTimers.get(logType);
  logTimers.delete(logType);
  if (!analyticsEnabled || start == null) {
    // Helps diagnose a missing event: shows whether analytics is on and whether
    // a matching startLogTimer ran before this save.
    console.debug('[analytics] log_completed skipped', { logType, analyticsEnabled, hadTimer: start != null });
    return;
  }
  const durationMs = Math.round(performance.now() - start);
  const durationSeconds = Math.round((durationMs / 1000) * 10) / 10;
  console.debug('[analytics] log_completed', { logType, durationSeconds, ...props });
  posthog.capture('log_completed', {
    log_type: logType,
    duration_ms: durationMs,
    duration_seconds: durationSeconds,
    under_60s: durationSeconds <= 60,
    ...props,
  });
}

export { posthog };
