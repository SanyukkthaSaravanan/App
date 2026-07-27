import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  insights as insightsApi,
  checkins as checkinsApi,
  symptoms as symptomsApi,
  medications as medsApi,
  type HealthAnalysis,
  type DoctorSummary,
} from '../../lib/api';
import { useAuth } from '../../context/auth-context';
import { trackerFor } from '../../lib/trackers';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  AlertCircle,
  Lightbulb,
  X,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';

type TimePeriod = 'days' | 'weeks' | 'months' | 'years' | 'custom';

// Sample data for different time periods
const symptomDataByPeriod = {
  days: [
    { date: 'Mon', severity: 4, fatigue: 3, pain: 5 },
    { date: 'Tue', severity: 5, fatigue: 4, pain: 6 },
    { date: 'Wed', severity: 7, fatigue: 6, pain: 8 },
    { date: 'Thu', severity: 6, fatigue: 5, pain: 7 },
    { date: 'Fri', severity: 5, fatigue: 4, pain: 6 },
    { date: 'Sat', severity: 4, fatigue: 3, pain: 5 },
    { date: 'Sun', severity: 3, fatigue: 2, pain: 4 },
  ],
  weeks: [
    { date: 'Week 1', severity: 5, fatigue: 4, pain: 6 },
    { date: 'Week 2', severity: 6, fatigue: 5, pain: 7 },
    { date: 'Week 3', severity: 4, fatigue: 3, pain: 5 },
    { date: 'Week 4', severity: 5, fatigue: 4, pain: 6 },
  ],
  months: [
    { date: 'Jan', severity: 4, fatigue: 3, pain: 5 },
    { date: 'Feb', severity: 5, fatigue: 4, pain: 6 },
    { date: 'Mar', severity: 6, fatigue: 5, pain: 7 },
    { date: 'Apr', severity: 5, fatigue: 4, pain: 6 },
    { date: 'May', severity: 4, fatigue: 3, pain: 5 },
    { date: 'Jun', severity: 3, fatigue: 2, pain: 4 },
  ],
  years: [
    { date: '2022', severity: 6, fatigue: 5, pain: 7 },
    { date: '2023', severity: 5, fatigue: 4, pain: 6 },
    { date: '2024', severity: 4, fatigue: 3, pain: 5 },
    { date: '2025', severity: 3, fatigue: 2, pain: 4 },
  ],
  custom: [
    { date: '2023-01-01', severity: 4, fatigue: 3, pain: 5 },
    { date: '2023-01-02', severity: 5, fatigue: 4, pain: 6 },
    { date: '2023-01-03', severity: 7, fatigue: 6, pain: 8 },
    { date: '2023-01-04', severity: 6, fatigue: 5, pain: 7 },
    { date: '2023-01-05', severity: 5, fatigue: 4, pain: 6 },
    { date: '2023-01-06', severity: 4, fatigue: 3, pain: 5 },
    { date: '2023-01-07', severity: 3, fatigue: 2, pain: 4 },
  ],
};

// Distinct colours cycled across the user's tracked factors.
const FACTOR_COLORS = ['#B48CBF', '#7293BB', '#A5D3CF', '#E89BA1', '#F59E0B', '#8BA888', '#CDADD0', '#6C8EBF'];

interface Bucket { label: string; start: number; end: number }

function generateBuckets(period: TimePeriod): Bucket[] {
  const now = new Date();
  const out: Bucket[] = [];
  if (period === 'weeks') {
    for (let i = 3; i >= 0; i--) {
      const end = new Date(now); end.setDate(now.getDate() - i * 7); end.setHours(23, 59, 59, 999);
      const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0, 0, 0, 0);
      out.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, start: +start, end: +end });
    }
  } else if (period === 'months') {
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      out.push({ label: start.toLocaleDateString('en-US', { month: 'short' }), start: +start, end: +end });
    }
  } else if (period === 'years') {
    for (let i = 2; i >= 0; i--) {
      const y = now.getFullYear() - i;
      out.push({ label: String(y), start: +new Date(y, 0, 1), end: +new Date(y, 11, 31, 23, 59, 59, 999) });
    }
  } else {
    // days (also the fallback for custom): last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      out.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), start: +d, end: +end });
    }
  }
  return out;
}

// Value of a factor from a single check-in row (0–10), or null if absent.
function checkinValue(factorId: string, c: any): number | null {
  if (factorId === 'energy') return c.energy != null ? Math.min(10, c.energy * 2) : null;
  if (factorId === 'stress') return c.stress ?? null;
  if (factorId === 'mood') return c.mood != null ? Math.min(10, c.mood * 2) : null;
  if (factorId === 'sleep') return c.sleep === 'good' ? 8 : c.sleep === 'okay' ? 5 : c.sleep === 'poor' ? 2 : null;
  if (factorId === 'pain') return c.painIntensity === 'severe' ? 8 : c.painIntensity === 'moderate' ? 5 : c.painIntensity === 'mild' ? 3 : null;
  const f = c.factors?.[factorId];
  return typeof f === 'number' ? f : null;
}

function buildChartData(period: TimePeriod, checkins: any[], symptoms: any[], labels: string[]) {
  const buckets = generateBuckets(period);
  return buckets.map((b) => {
    const cks = checkins.filter((c) => { const t = +new Date(c.date); return t >= b.start && t <= b.end; });
    const syms = symptoms.filter((s) => { const t = +new Date(s.loggedAt); return t >= b.start && t <= b.end; });
    const point: Record<string, number | string> = { date: b.label };

    for (const label of labels) {
      const t = trackerFor(label);
      const l = label.toLowerCase();

      // Symptom logs whose name matches this factor (e.g. "brain fog", "pain")
      const matched = syms.filter((s) =>
        (Array.isArray(s.symptoms) ? s.symptoms : []).some(
          (n: any) => String(n).toLowerCase() === l || (l === 'pain' && String(n).toLowerCase().includes('pain'))
        )
      );
      const symAvg = matched.length
        ? matched.reduce((a, s) => a + (s.severity || 0), 0) / matched.length
        : undefined;

      // Check-in values for this factor across the bucket
      const ckVals = cks.map((c) => checkinValue(t.id, c)).filter((v): v is number => v != null);
      const ckAvg = ckVals.length ? ckVals.reduce((a, v) => a + v, 0) / ckVals.length : undefined;

      // Prefer check-ins for mood/energy/stress/sleep; symptom severity for pain/custom.
      const value = ['energy', 'stress', 'mood', 'sleep'].includes(t.id)
        ? ckAvg ?? symAvg ?? 0
        : symAvg ?? ckAvg ?? 0;

      point[label] = Math.round(value * 10) / 10;
    }
    return point;
  });
}

// Most frequently logged symptoms in the period — a plain count from the data.
function buildTopSymptoms(period: TimePeriod, symptoms: any[]) {
  const buckets = generateBuckets(period);
  if (buckets.length === 0) return [] as { trigger: string; count: number }[];
  const start = buckets[0].start;
  const end = buckets[buckets.length - 1].end;
  const counts = new Map<string, number>();
  symptoms.forEach((s) => {
    const t = +new Date(s.loggedAt);
    if (t < start || t > end) return;
    (Array.isArray(s.symptoms) ? s.symptoms : []).forEach((n: any) => {
      const raw = String(n).trim();
      if (!raw) return;
      const name = raw.charAt(0).toUpperCase() + raw.slice(1);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    // Only symptoms logged more than once are "frequent" enough to chart;
    // a one-off still shows on the calendar + summary, just not here.
    .filter(([, count]) => count > 1)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

// Medication adherence per bucket = doses taken ÷ doses expected (× 100).
//
// History is FROZEN: each PAST day's expected/taken is derived from the dose
// records that actually exist for that day, NOT the medication's current
// schedule. So editing a med today (e.g. adding a second daily dose) can never
// rewrite an earlier day's adherence — yesterday's 1-of-1 stays 100%. Only
// TODAY uses the current schedule, so new doses count from today onward.
// As-needed meds are excluded; days with nothing scheduled/logged return null
// (no data) rather than a misleading 0%.
function buildAdherence(period: TimePeriod, meds: any[], allDoses: any[][]) {
  const buckets = generateBuckets(period);
  const pad = (n: number) => String(n).padStart(2, '0');
  const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const isAsNeeded = (m: any) => String(m.frequency ?? '').toLowerCase() === 'as needed';

  // Only scheduled meds count toward adherence.
  const scheduledIds = new Set(meds.filter((m) => !isAsNeeded(m)).map((m) => m.id));

  // Tally dose records per local day. The day comes from scheduledAt
  // (`YYYY-MM-DD…`), which is the local date the dose was logged for.
  const byDay = new Map<string, { records: number; taken: number }>();
  for (const d of allDoses.flat()) {
    if (!scheduledIds.has(d.medicationId) || !d.scheduledAt) continue;
    const key = String(d.scheduledAt).slice(0, 10);
    const rec = byDay.get(key) ?? { records: 0, taken: 0 };
    rec.records += 1;
    if (d.takenAt) rec.taken += 1;
    byDay.set(key, rec);
  }

  const now = new Date();
  const todayKey = keyOf(now);
  // Current scheduled doses/day — applied to TODAY only.
  const todaySchedule = meds.reduce((a, m) => {
    if (isAsNeeded(m)) return a;
    const started = m.startDate ? new Date(m.startDate) <= now : true;
    const notEnded = m.endDate ? new Date(m.endDate) >= now : true;
    const perDay = Array.isArray(m.scheduleTimes) && m.scheduleTimes.length ? m.scheduleTimes.length : 1;
    return a + (started && notEnded ? perDay : 0);
  }, 0);

  return buckets.map((b) => {
    let expected = 0;
    let taken = 0;
    const startDay = new Date(b.start);
    for (
      let dd = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
      +dd <= b.end;
      dd.setDate(dd.getDate() + 1)
    ) {
      if (+dd > +now) break; // ignore future days
      const key = keyOf(dd);
      const rec = byDay.get(key) ?? { records: 0, taken: 0 };
      taken += rec.taken;
      expected += key === todayKey ? Math.max(todaySchedule, rec.records) : rec.records;
    }
    const adherence = expected > 0 ? Math.min(100, Math.round((taken / expected) * 100)) : null;
    return { period: b.label, adherence };
  });
}

export function HealthInsights() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('days');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(true);

  const { user } = useAuth();
  // The factors the user chose to track drive which trend lines appear.
  const trackedLabels =
    user?.trackedFactors && user.trackedFactors.length > 0
      ? user.trackedFactors
      : ['Pain', 'Fatigue / Energy'];
  const [chartData, setChartData] = useState<Record<string, number | string>[]>([]);
  // Real bar/line data derived from logged symptoms + medication doses.
  const [triggerData, setTriggerData] = useState<{ trigger: string; count: number }[]>([]);
  const [medicationAdherence, setMedicationAdherence] = useState<{ period: string; adherence: number | null }[]>([]);

  // Doctor-ready summary
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummary | null>(null);
  const [doctorPeriod, setDoctorPeriod] = useState<'week' | 'month'>('week');
  const [generatingDoctor, setGeneratingDoctor] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDoctorSummary = () => {
    setGeneratingDoctor(true);
    setCopied(false);
    insightsApi
      .doctorSummary(doctorPeriod)
      .then(setDoctorSummary)
      .catch(() => setDoctorSummary(null))
      .finally(() => setGeneratingDoctor(false));
  };

  const copyDoctorSummary = () => {
    if (!doctorSummary) return;
    const text = [doctorSummary.narrative, '', ...doctorSummary.highlights.map((h) => `• ${h}`)].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    insightsApi
      .analyze()
      .then(setAnalysis)
      .catch(() => setAnalysis(null))
      .finally(() => setAnalyzing(false));
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  // Build the trend chart from real logged data for the selected period.
  useEffect(() => {
    const period = timePeriod === 'custom' ? 'days' : timePeriod;
    const spanDays = period === 'weeks' ? 28 : period === 'months' ? 190 : period === 'years' ? 1100 : 7;
    const from = new Date();
    from.setDate(from.getDate() - spanDays);
    from.setHours(0, 0, 0, 0);
    Promise.all([
      checkinsApi.list(from.toISOString(), new Date().toISOString()).catch(() => []),
      symptomsApi.list().catch(() => []),
      medsApi.list().catch(() => [] as any[]),
    ]).then(async ([cks, syms, meds]) => {
      setChartData(buildChartData(period, cks, syms, trackedLabels));
      setTriggerData(buildTopSymptoms(period, syms));
      // Pull each medication's dose history, then compute adherence per bucket.
      const doseLists = await Promise.all(
        (meds as any[]).map((m) => medsApi.doses(m.id).catch(() => [] as any[]))
      );
      setMedicationAdherence(buildAdherence(period, meds as any[], doseLists));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod, user?.trackedFactors]);

  const handleRefreshInsights = () => runAnalysis();

  const timePeriodLabels: Record<TimePeriod, string> = {
    days: 'Last 7 Days',
    weeks: 'Last 4 Weeks',
    months: 'Last 6 Months',
    years: 'Last 4 Years',
    custom: dateRange.from && dateRange.to
      ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
      : 'Custom Date Range',
  };

  const hasChartData = chartData.some((pt) =>
    trackedLabels.some((l) => typeof pt[l] === 'number' && (pt[l] as number) > 0)
  );

  const handleApplyCustomRange = () => {
    if (dateRange.from && dateRange.to) {
      setTimePeriod('custom');
      setIsDatePickerOpen(false);
    }
  };

  const handleClearCustomRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setTimePeriod('days');
  };

  const trends = analysis?.trends ?? [];
  const recommendations = analysis?.recommendations ?? [];

  const trendStyle = (severity: 'positive' | 'warning' | 'info') =>
    severity === 'positive'
      ? { bg: 'bg-green-50', icon: TrendingUp, color: '#A5D3CF' }
      : severity === 'warning'
      ? { bg: 'bg-amber-50', icon: TrendingDown, color: '#F59E0B' }
      : { bg: 'bg-blue-50', icon: Lightbulb, color: '#7293BB' };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Time Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold">Health Trends & Insights</h3>
                <Button size="sm" variant="outline" onClick={handleRefreshInsights}>
                  Refresh insights
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                View your health patterns over time
              </p>
              {timePeriod === 'custom' && dateRange.from && dateRange.to && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" style={{ backgroundColor: '#7293BB20', borderColor: '#7293BB' }}>
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                  </Badge>
                  <button
                    onClick={handleClearCustomRange}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['days', 'weeks', 'months', 'years'] as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                  className={timePeriod === period ? '' : ''}
                  style={
                    timePeriod === period
                      ? { backgroundColor: '#7293BB', color: 'white' }
                      : {}
                  }
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={timePeriod === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    className={timePeriod === 'custom' ? '' : ''}
                    style={
                      timePeriod === 'custom'
                        ? { backgroundColor: '#7293BB', color: 'white' }
                        : {}
                    }
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Custom
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium">Select Date Range</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose start and end dates for your custom analytics
                    </p>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={(range) => {
                      if (range?.from || range?.to) {
                        setDateRange({ from: range?.from, to: range?.to });
                      }
                    }}
                    numberOfMonths={2}
                    className="rounded-md"
                  />
                  <div className="flex items-center justify-between p-3 border-t bg-muted/30">
                    <div className="text-sm text-muted-foreground">
                      {dateRange.from && dateRange.to ? (
                        <span>
                          {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span>Select a date range</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearCustomRange}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApplyCustomRange}
                        disabled={!dateRange.from || !dateRange.to}
                        style={
                          dateRange.from && dateRange.to
                            ? { backgroundColor: '#A5D3CF', color: 'white' }
                            : {}
                        }
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor-ready summary */}
      <Card style={{ backgroundColor: '#F8F6FF' }}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: '#7293BB' }} />
                Doctor-ready summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                A clinical summary of your logs to share at appointments
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(['week', 'month'] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={doctorPeriod === p ? 'default' : 'outline'}
                  style={doctorPeriod === p ? { backgroundColor: '#7293BB', color: 'white' } : {}}
                  onClick={() => setDoctorPeriod(p)}
                >
                  {p === 'week' ? 'This week' : 'This month'}
                </Button>
              ))}
              <Button
                size="sm"
                onClick={generateDoctorSummary}
                disabled={generatingDoctor}
                style={{ backgroundColor: '#A5D3CF', color: 'white' }}
              >
                {generatingDoctor ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!doctorSummary ? (
            <p className="text-sm text-muted-foreground">
              Pick a period and tap <strong>Generate</strong> to create a summary from your logged data.
            </p>
          ) : !doctorSummary.hasData ? (
            <p className="text-sm text-muted-foreground">
              Not enough logged data for this period yet. Keep logging symptoms, meds, and check-ins.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm leading-relaxed whitespace-pre-line">{doctorSummary.narrative}</p>
                {doctorSummary.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {doctorSummary.highlights.map((h, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span>•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={copyDoctorSummary}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Generated {new Date(doctorSummary.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-generated insight cards (from the user's real logged data) */}
      {analyzing && !analysis ? (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="w-4 h-4 border-2 border-[#7293BB] border-t-transparent rounded-full animate-spin" />
            Analysing your logged data…
          </CardContent>
        </Card>
      ) : analysis && !analysis.hasData ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Not enough data yet to spot patterns. Log symptoms, meals, and daily check-ins for a few days and your personalised insights will appear here.
          </CardContent>
        </Card>
      ) : trends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((trend, idx) => {
            const s = trendStyle(trend.severity);
            const Icon = s.icon;
            return (
              <Card key={idx} className={`${s.bg} border-0 ${idx === 0 ? 'md:col-span-2' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg h-fit" style={{ backgroundColor: s.color }}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{trend.title}</h4>
                      <p className="text-sm text-muted-foreground">{trend.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Your Trends — lines are the factors you chose to track */}
      <Card>
        <CardHeader>
          <CardTitle>Your Trends - {timePeriodLabels[timePeriod]}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on what you track: {trackedLabels.join(', ')}
          </p>
        </CardHeader>
        <CardContent>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart id="symptom-trends-area-chart" data={chartData}>
                <CartesianGrid strokeDasharray="3 3" key="symptom-grid" />
                <XAxis dataKey="date" key="symptom-xaxis" />
                <YAxis domain={[0, 10]} key="symptom-yaxis" />
                <Tooltip key="symptom-tooltip" />
                <Legend key="symptom-legend" />
                {trackedLabels.map((label, i) => (
                  <Area
                    key={`area-${label}`}
                    type="monotone"
                    dataKey={label}
                    stroke={FACTOR_COLORS[i % FACTOR_COLORS.length]}
                    fill={FACTOR_COLORS[i % FACTOR_COLORS.length]}
                    fillOpacity={0.25}
                    name={label}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No trend data yet. Log check-ins and symptoms for the factors you track and they'll chart here.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most frequent symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Most Frequent Symptoms</CardTitle>
            <p className="text-sm text-muted-foreground">
              How often each symptom was logged
            </p>
          </CardHeader>
          <CardContent>
            {triggerData.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nothing recurring yet — a symptom appears here once it's logged more than once.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart id="triggers-bar-chart" data={triggerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" key="triggers-grid" />
                  <XAxis type="number" allowDecimals={false} key="triggers-xaxis" />
                  <YAxis dataKey="trigger" type="category" width={90} key="triggers-yaxis" />
                  <Tooltip key="triggers-tooltip" />
                  <Bar dataKey="count" fill="#7293BB" radius={[0, 8, 8, 0]} key="triggers-bar" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Medication Adherence */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence</CardTitle>
            <p className="text-sm text-muted-foreground">Doses taken vs. scheduled</p>
          </CardHeader>
          <CardContent>
            {medicationAdherence.every((d) => !d.adherence) ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No medication doses recorded yet. Mark doses as taken to track adherence.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart id="adherence-line-chart" data={medicationAdherence}>
                  <CartesianGrid strokeDasharray="3 3" key="adherence-grid" />
                  <XAxis dataKey="period" key="adherence-xaxis" />
                  <YAxis domain={[0, 100]} key="adherence-yaxis" />
                  <Tooltip key="adherence-tooltip" />
                  <Line
                    type="monotone"
                    dataKey="adherence"
                    stroke="#A5D3CF"
                    strokeWidth={3}
                    dot={{ fill: '#A5D3CF', r: 6 }}
                    name="Adherence %"
                    key="adherence-line"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" style={{ color: '#7293BB' }} />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              {analyzing
                ? 'Generating recommendations…'
                : 'Keep logging and your personalised recommendations will appear here.'}
            </p>
          ) : (
            recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="flex-1">{rec.title}</h4>
                  {analysis?.enoughForPriority && (
                    <Badge
                      variant={
                        rec.priority === 'high'
                          ? 'destructive'
                          : rec.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {rec.priority}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}