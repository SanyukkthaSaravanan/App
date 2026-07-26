/**
 * AI health-analysis service.
 *
 * Loads everything the user has logged (symptoms, diet, medications, check-ins,
 * flares) over the last ~60 days, summarises it, and asks OpenAI to produce:
 *   - trends          (key patterns, e.g. "pain down 30% this week")
 *   - recommendations (prioritised, personalised suggestions)
 *   - triggerFoods    (foods correlating with negative reactions/symptoms)
 *
 * Falls back to a deterministic rule-based analysis when OPENAI_API_KEY is
 * absent or the API call fails, so the page always has real, data-derived
 * content (never the old hardcoded copy).
 */

import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

export interface Trend {
  title: string;
  description: string;
  severity: 'positive' | 'warning' | 'info';
}
export interface Recommendation {
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}
export interface TriggerFood {
  name: string;
  reason: string;
}
export interface HealthAnalysis {
  trends: Trend[];
  recommendations: Recommendation[];
  triggerFoods: TriggerFood[];
  summary: string;
  usedAI: boolean;
  hasData: boolean;
  // True only when there's enough logged data to assign meaningful priorities.
  enoughForPriority: boolean;
}

const DAYS = 60;
// Below this many logged entries, priorities aren't reliable → hide them.
const PRIORITY_MIN_ENTRIES = 8;

// ── Data loading ─────────────────────────────────────────────────────────────

async function loadData(userId: string) {
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  const [symptoms, diet, meds, checkins, flares] = await Promise.all([
    supabase.from('Symptom').select().eq('userId', userId).gte('loggedAt', since),
    supabase.from('DietLog').select().eq('userId', userId).gte('ateAt', since),
    supabase.from('Medication').select().eq('userId', userId).eq('active', true),
    supabase.from('DailyCheckIn').select().eq('userId', userId).gte('date', since),
    supabase.from('FlareEvent').select().eq('userId', userId).gte('startedAt', since),
  ]);
  return {
    symptoms: (symptoms.data ?? []) as any[],
    diet: (diet.data ?? []) as any[],
    meds: (meds.data ?? []) as any[],
    checkins: (checkins.data ?? []) as any[],
    flares: (flares.data ?? []) as any[],
  };
}

// ── Aggregation ──────────────────────────────────────────────────────────────

function asArray(v: any): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function aggregate(data: Awaited<ReturnType<typeof loadData>>) {
  const { symptoms, diet, meds, checkins, flares } = data;

  // Symptom counts + severity, and recent-vs-earlier trend
  const symName = new Map<string, { count: number; sevSum: number }>();
  for (const s of symptoms) {
    for (const name of asArray(s.symptoms)) {
      const e = symName.get(name.toLowerCase()) ?? { count: 0, sevSum: 0 };
      e.count += 1;
      e.sevSum += s.severity ?? 0;
      symName.set(name.toLowerCase(), e);
    }
  }
  const now = Date.now();
  const wk = 7 * 24 * 60 * 60 * 1000;
  const recentSev = symptoms.filter((s) => +new Date(s.loggedAt) >= now - wk).map((s) => s.severity ?? 0);
  const priorSev = symptoms
    .filter((s) => +new Date(s.loggedAt) >= now - 2 * wk && +new Date(s.loggedAt) < now - wk)
    .map((s) => s.severity ?? 0);
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

  // Foods tied to negative reactions (DietLog.triggers is the trigger list)
  const foodTrigger = new Map<string, number>();
  for (const d of diet) {
    for (const t of asArray(d.triggers)) {
      foodTrigger.set(t.toLowerCase(), (foodTrigger.get(t.toLowerCase()) ?? 0) + 1);
    }
  }

  // Check-in aggregates
  const energies = checkins.map((c) => c.energy).filter((v: any) => typeof v === 'number');
  const stresses = checkins.map((c) => c.stress).filter((v: any) => typeof v === 'number');
  const sleepCounts = { poor: 0, okay: 0, good: 0 } as Record<string, number>;
  for (const c of checkins) if (c.sleep && sleepCounts[c.sleep] !== undefined) sleepCounts[c.sleep] += 1;

  // Flare triggers
  const flareTrigger = new Map<string, number>();
  for (const f of flares) for (const t of asArray(f.triggers)) flareTrigger.set(t.toLowerCase(), (flareTrigger.get(t.toLowerCase()) ?? 0) + 1);

  return {
    symptomTotals: [...symName.entries()]
      .map(([name, e]) => ({ name, count: e.count, avgSeverity: +(e.sevSum / e.count).toFixed(1) }))
      .sort((a, b) => b.count - a.count),
    recentAvgSeverity: +avg(recentSev).toFixed(1),
    priorAvgSeverity: +avg(priorSev).toFixed(1),
    foodTriggers: [...foodTrigger.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    medications: meds.map((m) => m.name),
    checkinCount: checkins.length,
    avgEnergy: +avg(energies).toFixed(1),
    avgStress: +avg(stresses).toFixed(1),
    sleepCounts,
    flareCount: flares.length,
    flareTriggers: [...flareTrigger.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    counts: {
      symptoms: symptoms.length,
      diet: diet.length,
      checkins: checkins.length,
      flares: flares.length,
    },
  };
}

// ── OpenAI path ──────────────────────────────────────────────────────────────

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

const SYSTEM_PROMPT = `You are a health-data analyst for a chronic-illness tracking app. You are given a JSON summary of ONE user's logged data (symptoms, diet, medications, check-ins, flares) over the last ~60 days. Analyse ONLY this data and respond with a JSON object of this exact shape:

{
  "trends": [ { "title": string, "description": string, "severity": "positive"|"warning"|"info" } ],
  "recommendations": [ { "title": string, "reason": string, "priority": "high"|"medium"|"low" } ],
  "triggerFoods": [ { "name": string, "reason": string } ],
  "summary": string
}

Rules:
- Base EVERY statement strictly on the numbers provided. Quote real figures (e.g. "average severity fell from 6.2 to 4.3"). Never invent data or foods that aren't in the summary.
- trends: 2-4 of the most important patterns. "positive" = improving, "warning" = worsening/risk, "info" = neutral pattern.
- recommendations: 3-5 specific, kind, actionable suggestions, each tied to the data, with an honest priority.
- triggerFoods: only foods that appear as triggers/negative reactions in the data, with a short reason. Empty array if none.
- Do NOT give medical diagnoses or prescribe treatment. Keep it supportive and practical.
- If the data is sparse, say so plainly in fewer items rather than padding with guesses.`;

async function analyzeWithOpenAI(agg: ReturnType<typeof aggregate>): Promise<Omit<HealthAnalysis, 'usedAI' | 'hasData' | 'enoughForPriority'>> {
  const resp = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(agg) },
    ],
  });
  const data = JSON.parse(resp.choices[0]?.message?.content ?? '{}');
  return normalise(data);
}

// ── Rule-based fallback ──────────────────────────────────────────────────────

function analyzeRuleBased(agg: ReturnType<typeof aggregate>): Omit<HealthAnalysis, 'usedAI' | 'hasData' | 'enoughForPriority'> {
  const trends: Trend[] = [];
  const recommendations: Recommendation[] = [];

  if (agg.recentAvgSeverity && agg.priorAvgSeverity) {
    const delta = agg.recentAvgSeverity - agg.priorAvgSeverity;
    const pct = Math.round((Math.abs(delta) / agg.priorAvgSeverity) * 100);
    if (delta < -0.4) {
      trends.push({ title: 'Symptom improvement', description: `Your average symptom severity fell ~${pct}% this week (${agg.priorAvgSeverity} → ${agg.recentAvgSeverity}/10).`, severity: 'positive' });
    } else if (delta > 0.4) {
      trends.push({ title: 'Symptoms trending up', description: `Your average symptom severity rose ~${pct}% this week (${agg.priorAvgSeverity} → ${agg.recentAvgSeverity}/10).`, severity: 'warning' });
    }
  }
  if (agg.symptomTotals.length) {
    const top = agg.symptomTotals[0];
    trends.push({ title: `Most reported: ${top.name}`, description: `Logged ${top.count} time(s), average severity ${top.avgSeverity}/10.`, severity: 'info' });
  }
  if (agg.foodTriggers.length) {
    const f = agg.foodTriggers[0];
    trends.push({ title: 'Possible food pattern', description: `${f.name} appears as a trigger in ${f.count} of your diet logs.`, severity: 'warning' });
    recommendations.push({ title: `Watch your ${f.name} intake`, reason: `It's your most frequently flagged trigger food (${f.count} logs).`, priority: 'high' });
  }
  if (agg.avgStress >= 6) {
    recommendations.push({ title: 'Try stress management', reason: `Your average stress is ${agg.avgStress}/10 - a common symptom driver.`, priority: 'high' });
  }
  if (agg.sleepCounts.good >= agg.sleepCounts.poor && agg.checkinCount > 0) {
    recommendations.push({ title: 'Keep your sleep routine', reason: 'Your check-ins show mostly good sleep - a protective factor.', priority: 'low' });
  } else if (agg.sleepCounts.poor > 0) {
    recommendations.push({ title: 'Prioritise sleep', reason: `You logged poor sleep on ${agg.sleepCounts.poor} day(s); it often precedes flares.`, priority: 'medium' });
  }
  if (agg.medications.length) {
    recommendations.push({ title: 'Stay consistent with medications', reason: `You're tracking ${agg.medications.length} medication(s) - consistency helps stability.`, priority: 'low' });
  }

  const triggerFoods: TriggerFood[] = agg.foodTriggers.slice(0, 5).map((f) => ({
    name: f.name,
    reason: `Flagged as a trigger in ${f.count} of your diet logs`,
  }));

  const summary = `Analysed ${agg.counts.symptoms} symptom, ${agg.counts.diet} diet, ${agg.counts.checkins} check-in and ${agg.counts.flares} flare entries from the last ${DAYS} days.`;

  return { trends, recommendations, triggerFoods, summary };
}

// ── Normalisation ────────────────────────────────────────────────────────────

function normalise(data: any): Omit<HealthAnalysis, 'usedAI' | 'hasData' | 'enoughForPriority'> {
  const sev = (v: any): Trend['severity'] => (['positive', 'warning', 'info'].includes(v) ? v : 'info');
  const pri = (v: any): Recommendation['priority'] => (['high', 'medium', 'low'].includes(v) ? v : 'medium');
  const str = (v: any) => (typeof v === 'string' ? v : '');

  return {
    trends: Array.isArray(data?.trends)
      ? data.trends.filter((t: any) => t?.title).map((t: any) => ({ title: str(t.title), description: str(t.description), severity: sev(t.severity) }))
      : [],
    recommendations: Array.isArray(data?.recommendations)
      ? data.recommendations.filter((r: any) => r?.title).map((r: any) => ({ title: str(r.title), reason: str(r.reason), priority: pri(r.priority) }))
      : [],
    triggerFoods: Array.isArray(data?.triggerFoods)
      ? data.triggerFoods.filter((f: any) => f?.name).map((f: any) => ({ name: str(f.name), reason: str(f.reason) }))
      : [],
    summary: str(data?.summary),
  };
}

// ── Public entrypoint ────────────────────────────────────────────────────────

export async function analyzeUserHealth(userId: string): Promise<HealthAnalysis> {
  const data = await loadData(userId);
  const totalEntries =
    data.symptoms.length + data.diet.length + data.checkins.length + data.flares.length;
  const hasData = totalEntries > 0;
  const enoughForPriority = totalEntries >= PRIORITY_MIN_ENTRIES;

  if (!hasData) {
    return { trends: [], recommendations: [], triggerFoods: [], summary: '', usedAI: false, hasData: false, enoughForPriority: false };
  }

  const agg = aggregate(data);

  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await analyzeWithOpenAI(agg);
      return { ...result, usedAI: true, hasData: true, enoughForPriority };
    } catch {
      // fall through to rule-based
    }
  }
  return { ...analyzeRuleBased(agg), usedAI: false, hasData: true, enoughForPriority };
}
