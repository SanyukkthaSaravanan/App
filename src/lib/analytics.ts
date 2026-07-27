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

export { posthog };
