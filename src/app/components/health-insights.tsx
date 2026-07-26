import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { insights as insightsApi, type HealthAnalysis } from '../../lib/api';
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

const triggerDataByPeriod = {
  days: [
    { trigger: 'Stress', count: 5 },
    { trigger: 'Weather', count: 3 },
    { trigger: 'Diet', count: 2 },
    { trigger: 'Sleep', count: 2 },
    { trigger: 'Exercise', count: 1 },
  ],
  weeks: [
    { trigger: 'Stress', count: 8 },
    { trigger: 'Weather', count: 6 },
    { trigger: 'Diet', count: 5 },
    { trigger: 'Sleep', count: 4 },
    { trigger: 'Exercise', count: 3 },
  ],
  months: [
    { trigger: 'Stress', count: 24 },
    { trigger: 'Weather', count: 18 },
    { trigger: 'Diet', count: 15 },
    { trigger: 'Sleep', count: 12 },
    { trigger: 'Exercise', count: 10 },
  ],
  years: [
    { trigger: 'Stress', count: 180 },
    { trigger: 'Weather', count: 120 },
    { trigger: 'Diet', count: 95 },
    { trigger: 'Sleep', count: 85 },
    { trigger: 'Exercise', count: 60 },
  ],
  custom: [
    { trigger: 'Stress', count: 5 },
    { trigger: 'Weather', count: 3 },
    { trigger: 'Diet', count: 2 },
    { trigger: 'Sleep', count: 2 },
    { trigger: 'Exercise', count: 1 },
  ],
};

const medicationAdherenceByPeriod = {
  days: [
    { period: 'Mon', adherence: 100 },
    { period: 'Tue', adherence: 75 },
    { period: 'Wed', adherence: 100 },
    { period: 'Thu', adherence: 100 },
    { period: 'Fri', adherence: 50 },
    { period: 'Sat', adherence: 100 },
    { period: 'Sun', adherence: 100 },
  ],
  weeks: [
    { period: 'Week 1', adherence: 85 },
    { period: 'Week 2', adherence: 90 },
    { period: 'Week 3', adherence: 75 },
    { period: 'Week 4', adherence: 95 },
  ],
  months: [
    { period: 'Jan', adherence: 82 },
    { period: 'Feb', adherence: 88 },
    { period: 'Mar', adherence: 91 },
    { period: 'Apr', adherence: 85 },
    { period: 'May', adherence: 93 },
    { period: 'Jun', adherence: 89 },
  ],
  years: [
    { period: '2022', adherence: 78 },
    { period: '2023', adherence: 85 },
    { period: '2024', adherence: 88 },
    { period: '2025', adherence: 92 },
  ],
  custom: [
    { period: '2023-01-01', adherence: 100 },
    { period: '2023-01-02', adherence: 75 },
    { period: '2023-01-03', adherence: 100 },
    { period: '2023-01-04', adherence: 100 },
    { period: '2023-01-05', adherence: 50 },
    { period: '2023-01-06', adherence: 100 },
    { period: '2023-01-07', adherence: 100 },
  ],
};

export function HealthInsights() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('days');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(true);

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

  const symptomData = symptomDataByPeriod[timePeriod];
  const triggerData = triggerDataByPeriod[timePeriod];
  const medicationAdherence = medicationAdherenceByPeriod[timePeriod];

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

      {/* Symptom Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Symptom Trends - {timePeriodLabels[timePeriod]}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart id="symptom-trends-area-chart" data={symptomData}>
              <CartesianGrid strokeDasharray="3 3" key="symptom-grid" />
              <XAxis dataKey="date" key="symptom-xaxis" />
              <YAxis domain={[0, 10]} key="symptom-yaxis" />
              <Tooltip key="symptom-tooltip" />
              <Legend key="symptom-legend" />
              <Area
                type="monotone"
                dataKey="pain"
                stackId="1"
                stroke="#B48CBF"
                fill="#B48CBF"
                fillOpacity={0.6}
                name="Pain"
                key="symptom-pain-area"
              />
              <Area
                type="monotone"
                dataKey="fatigue"
                stackId="1"
                stroke="#7293BB"
                fill="#7293BB"
                fillOpacity={0.6}
                name="Fatigue"
                key="symptom-fatigue-area"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Triggers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Symptom Triggers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your logged data
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart id="triggers-bar-chart" data={triggerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" key="triggers-grid" />
                <XAxis type="number" key="triggers-xaxis" />
                <YAxis dataKey="trigger" type="category" width={80} key="triggers-yaxis" />
                <Tooltip key="triggers-tooltip" />
                <Bar dataKey="count" fill="#7293BB" radius={[0, 8, 8, 0]} key="triggers-bar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medication Adherence */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence</CardTitle>
            <p className="text-sm text-muted-foreground">Weekly tracking</p>
          </CardHeader>
          <CardContent>
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