import { supabase, sb } from '../lib/supabase';

/**
 * Computes pattern insights for a user by analyzing their:
 *   - symptom log history (most-affected body parts, recurring symptoms)
 *   - daily check-ins (correlations between sleep/stress and flares)
 *   - diet logs (food that precedes a flare within 24h)
 *
 * Returns a list of Insight records that the frontend renders as cards.
 */
export async function computeInsights(userId: string) {
  // Wipe prior computed insights
  await supabase.from('Insight').delete().eq('userId', userId);

  const [symptomsRes, checkInsRes, dietLogsRes, flaresRes] = await Promise.all([
    supabase.from('Symptom').select().eq('userId', userId),
    supabase.from('DailyCheckIn').select().eq('userId', userId),
    supabase.from('DietLog').select().eq('userId', userId),
    supabase.from('FlareEvent').select().eq('userId', userId),
  ]);

  const symptoms  = (symptomsRes.data  ?? []) as any[];
  const checkIns  = (checkInsRes.data  ?? []) as any[];
  const dietLogs  = (dietLogsRes.data  ?? []) as any[];
  const flares    = (flaresRes.data    ?? []) as any[];

  const insights: Array<{
    type: string;
    title: string;
    description: string;
    data?: unknown;
    severity?: 'info' | 'warning' | 'positive';
  }> = [];

  // 1. Most-affected body part
  const partCounts = new Map<string, number>();
  for (const s of symptoms) {
    if (!s.bodyPartName) continue;
    partCounts.set(s.bodyPartName, (partCounts.get(s.bodyPartName) ?? 0) + 1);
  }
  const topPart = [...partCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topPart) {
    insights.push({
      type: 'pattern',
      title: `Most affected: ${topPart[0]}`,
      description: `You've logged ${topPart[1]} symptom entries for ${topPart[0]} — it's your most reported area.`,
      data: Object.fromEntries(partCounts),
      severity: 'info',
    });
  }

  // 2. Average severity trend (last 30 vs prior 30 days)
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const recent = symptoms.filter((s) => +new Date(s.loggedAt) >= now - 30 * day);
  const prior  = symptoms.filter(
    (s) => +new Date(s.loggedAt) >= now - 60 * day && +new Date(s.loggedAt) < now - 30 * day
  );
  const avg = (arr: any[]) =>
    arr.length ? arr.reduce((a, b) => a + b.severity, 0) / arr.length : 0;
  const recentAvg = avg(recent);
  const priorAvg  = avg(prior);
  if (recent.length >= 3 && prior.length >= 3) {
    const delta     = recentAvg - priorAvg;
    const direction = delta < -0.5 ? 'improving' : delta > 0.5 ? 'worsening' : 'stable';
    insights.push({
      type: 'trend',
      title: `Severity trend: ${direction}`,
      description: `Your average symptom severity over the last 30 days is ${recentAvg.toFixed(1)}/10 — a shift of ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} vs the previous month.`,
      data: { recentAvg, priorAvg, delta },
      severity: direction === 'improving' ? 'positive' : direction === 'worsening' ? 'warning' : 'info',
    });
  }

  // 3. Sleep ↔ flare correlation
  const checkInsByDate = new Map<string, any>();
  for (const c of checkIns) {
    checkInsByDate.set(new Date(c.date).toISOString().slice(0, 10), c);
  }
  const flareDaysPoor: number[] = [];
  const flareDaysGood: number[] = [];
  for (const f of flares) {
    const key = new Date(f.startedAt).toISOString().slice(0, 10);
    const c = checkInsByDate.get(key);
    if (!c) continue;
    if (c.sleep === 'poor') flareDaysPoor.push(f.severity);
    if (c.sleep === 'good') flareDaysGood.push(f.severity);
  }
  if (flareDaysPoor.length >= 2) {
    const poorAvg = flareDaysPoor.reduce((a, b) => a + b, 0) / flareDaysPoor.length;
    insights.push({
      type: 'correlation',
      title: 'Poor sleep links to worse flares',
      description: `${flareDaysPoor.length} of your flares happened on days you slept poorly. Their average severity was ${poorAvg.toFixed(1)}/10.`,
      data: { poor: flareDaysPoor, good: flareDaysGood },
      severity: 'warning',
    });
  }

  // 4. Diet trigger detection — foods appearing ≤24h before a flare
  const triggerCounts = new Map<string, number>();
  for (const f of flares) {
    const windowStart = +new Date(f.startedAt) - day;
    const windowEnd   = +new Date(f.startedAt);
    const recentMeals = dietLogs.filter(
      (d) => +new Date(d.ateAt) >= windowStart && +new Date(d.ateAt) <= windowEnd
    );
    for (const m of recentMeals) {
      const foods: string[] = Array.isArray(m.foods) ? m.foods : [];
      for (const food of foods) {
        triggerCounts.set(food, (triggerCounts.get(food) ?? 0) + 1);
      }
    }
  }
  const suspectFoods = [...triggerCounts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (suspectFoods.length) {
    insights.push({
      type: 'trigger',
      title: 'Possible food triggers',
      description: `${suspectFoods.map(([f, n]) => `${f} (${n}×)`).join(', ')} appeared in the 24h before a flare more than once.`,
      data: Object.fromEntries(suspectFoods),
      severity: 'warning',
    });
  }

  // 5. Stress ↔ severity correlation
  const highStress = checkIns.filter((c) => (c.stress ?? 0) >= 7);
  const lowStress  = checkIns.filter((c) => (c.stress ?? 0) <= 3);
  const dateSeverity = new Map<string, number[]>();
  for (const s of symptoms) {
    const k = new Date(s.loggedAt).toISOString().slice(0, 10);
    if (!dateSeverity.has(k)) dateSeverity.set(k, []);
    dateSeverity.get(k)!.push(s.severity);
  }
  const avgOn = (list: any[]) => {
    const sevs: number[] = [];
    for (const c of list) {
      const arr = dateSeverity.get(new Date(c.date).toISOString().slice(0, 10));
      if (arr) sevs.push(...arr);
    }
    return sevs.length ? sevs.reduce((a, b) => a + b, 0) / sevs.length : 0;
  };
  const hs = avgOn(highStress);
  const ls = avgOn(lowStress);
  if (highStress.length >= 3 && lowStress.length >= 3 && hs - ls > 0.8) {
    insights.push({
      type: 'correlation',
      title: 'Stress amplifies symptoms',
      description: `High-stress days show ${(hs - ls).toFixed(1)} points more symptom severity on average (${hs.toFixed(1)} vs ${ls.toFixed(1)}/10).`,
      data: { highStressAvg: hs, lowStressAvg: ls },
      severity: 'warning',
    });
  }

  // Persist all computed insights
  if (insights.length > 0) {
    await supabase.from('Insight').insert(
      insights.map((i) => ({
        id: crypto.randomUUID(),
        userId,
        type: i.type,
        title: i.title,
        description: i.description,
        data: i.data ?? null,
        severity: i.severity ?? 'info',
      }))
    );
  }

  const result = await supabase
    .from('Insight')
    .select()
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  return sb(result);
}
