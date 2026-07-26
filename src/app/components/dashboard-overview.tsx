import React, { useState, useEffect } from 'react';
import {
  checkins as checkinsApi,
  symptoms as symptomsApi,
  medications as medsApi,
} from '../../lib/api';
import { useAuth } from '../../context/auth-context';
import { DailyCheckInModal } from './daily-checkin-modal';
import { trackerFor, TRACKERS } from '../../lib/trackers';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import fullLogoImage from '../../imports/Flaire_name_logo_updated.png';
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Pill,
  Apple,
  FileText,
  Flame,
  User,
  Heart,
  Mic,
  Share2,
  Download,
  Users,
  Moon,
  Zap,
  Brain,
  X,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Gauge,
  Settings,
  Plus,
  Trash2,
  Mail,
  Lock,
  Chrome,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  onEnableFlareMode: () => void;
}

// Tracking factor types
type InputType = 'checkbox' | 'slider' | 'emoji';

interface TrackingFactor {
  id: string;
  name: string;
  inputType: InputType;
  icon: string;
  color: string;
  enabled: boolean;
  min?: number;
  max?: number;
  emojiOptions?: { emoji: string; label: string; value: number }[];
}

// Default tracking factors
const defaultFactors: TrackingFactor[] = [
  {
    id: 'water',
    name: 'Water Intake',
    inputType: 'slider',
    icon: '💧',
    color: '#7293BB',
    enabled: false,
    min: 0,
    max: 12,
  },
  {
    id: 'stress',
    name: 'Stress Level',
    inputType: 'slider',
    icon: '🧠',
    color: '#E89BA1',
    enabled: false,
    min: 0,
    max: 10,
  },
  {
    id: 'sleep',
    name: 'Sleep Quality',
    inputType: 'emoji',
    icon: '🌙',
    color: '#B48CBF',
    enabled: false,
    emojiOptions: [
      { emoji: '😫', label: 'Terrible', value: 1 },
      { emoji: '😴', label: 'Poor', value: 2 },
      { emoji: '😐', label: 'Okay', value: 3 },
      { emoji: '🙂', label: 'Good', value: 4 },
      { emoji: '😊', label: 'Great', value: 5 },
    ],
  },
  {
    id: 'period',
    name: 'Period',
    inputType: 'checkbox',
    icon: '🩸',
    color: '#E89BA1',
    enabled: false,
  },
  {
    id: 'exercise',
    name: 'Exercise',
    inputType: 'checkbox',
    icon: '🏃',
    color: '#A5D3CF',
    enabled: false,
  },
  {
    id: 'meditation',
    name: 'Meditation',
    inputType: 'checkbox',
    icon: '🧘',
    color: '#B48CBF',
    enabled: false,
  },
];

// Local-timezone date key (YYYY-MM-DD) so days bucket by the user's location.
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface WeekSeries {
  energy: number[];
  pain: number[];
  sleep: number[];
  stress: number[];
}

const MAX_CHECKINS_PER_DAY = 3;

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { user } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [medsToday, setMedsToday] = useState<{ taken: number; total: number } | null>(null);

  // Factors chosen in onboarding/settings drive the check-in (default if none).
  const checkinTrackers = (
    user?.trackedFactors && user.trackedFactors.length > 0
      ? user.trackedFactors.map(trackerFor)
      : [trackerFor('Fatigue / Energy'), trackerFor('Pain'), trackerFor('Mood')]
  );
  const [weekSeries, setWeekSeries] = useState<WeekSeries>({
    energy: [], pain: [], sleep: [], stress: [],
  });

  const refreshTodayCount = () =>
    checkinsApi.today().then((list) => setTodayCount(list.length)).catch(() => {});

  useEffect(() => {
    refreshTodayCount();

    // Medication count for the dashboard card (Task 4)
    medsApi
      .today(dateKey(new Date()))
      .then((r) => setMedsToday({ taken: r.taken, total: r.total }))
      .catch(() => setMedsToday({ taken: 0, total: 0 }));

    // Last-7-days series from real logged data (Task 8)
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    Promise.all([
      checkinsApi.list(from.toISOString(), now.toISOString()).catch(() => []),
      symptomsApi.list().catch(() => []),
    ]).then(([checkins, symptoms]) => {
      const days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        days.push(dateKey(d));
      }

      const checkinByDay = new Map(checkins.map((c) => [dateKey(new Date(c.date)), c]));
      const sevByDay = new Map<string, number[]>();
      for (const s of symptoms) {
        const k = dateKey(new Date(s.loggedAt));
        if (!sevByDay.has(k)) sevByDay.set(k, []);
        sevByDay.get(k)!.push(s.severity);
      }

      const energy: number[] = [], pain: number[] = [], sleep: number[] = [], stress: number[] = [];
      for (const k of days) {
        const c = checkinByDay.get(k);
        energy.push(c?.energy ? Math.min(10, c.energy * 2) : 0); // energy stored 1-5 → 0-10
        stress.push(c?.stress ?? 0);
        sleep.push(
          c?.sleep === 'good' ? 8 : c?.sleep === 'okay' ? 5 : c?.sleep === 'poor' ? 2 : 0
        );
        const sev = sevByDay.get(k);
        pain.push(
          sev && sev.length
            ? Math.round(sev.reduce((a, b) => a + b, 0) / sev.length)
            : c?.painIntensity === 'severe' ? 8 : c?.painIntensity === 'moderate' ? 5 : c?.painIntensity === 'mild' ? 3 : 0
        );
      }
      setWeekSeries({ energy, pain, sleep, stress });
    });
  }, []);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const atCheckinLimit = todayCount >= MAX_CHECKINS_PER_DAY;

  const handleCheckInSaved = () => {
    setShowCheckInModal(false);
    refreshTodayCount();
  };

  return (
    <div className="space-y-6">
      {/* Primary Action: Daily Check-In */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
      <Card className="border-2" style={{ borderColor: '#7293BB' }}>
        <CardHeader className="text-center pb-2">
          <p className="text-lg">Hey there San!</p>
          <p className="text-sm text-muted-foreground">{todayStr}</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-center space-y-4">
            <h3 className="text-xl">
              {todayCount === 0
                ? 'How are you doing?'
                : atCheckinLimit
                ? "You've checked in 3 times today ✓"
                : `Checked in ${todayCount}/${MAX_CHECKINS_PER_DAY} today`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {atCheckinLimit
                ? 'Come back tomorrow'
                : 'Log how you feel — takes seconds. You can check in up to 3 times a day.'}
            </p>
            <Button
              size="lg"
              className="w-full"
              style={{ backgroundColor: '#7293BB' }}
              onClick={() => setShowCheckInModal(true)}
              disabled={atCheckinLimit}
            >
              {todayCount === 0 ? 'Check in' : 'Check in again'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Dynamic daily check-in (factors from onboarding/settings) */}
      <DailyCheckInModal
        open={showCheckInModal}
        onOpenChange={setShowCheckInModal}
        trackers={checkinTrackers}
        onSaved={handleCheckInSaved}
      />

      {/* Core Symptom Snapshot - Last 7 Days (real logged data) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h4>Last 7 days</h4>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('insights')}>
            View insights
          </Button>
        </div>
        {(() => {
          const metrics = [
            { label: 'Energy', icon: Zap, color: '#A5D3CF', series: weekSeries.energy, goodDir: 'up' as const },
            { label: 'Pain', icon: Activity, color: '#E89BA1', series: weekSeries.pain, goodDir: 'down' as const },
            { label: 'Sleep', icon: Moon, color: '#B48CBF', series: weekSeries.sleep, goodDir: 'up' as const },
            { label: 'Stress', icon: Brain, color: '#7293BB', series: weekSeries.stress, goodDir: 'down' as const },
          ];
          const hasData = metrics.some((m) => m.series.some((v) => v > 0));

          const trendOf = (arr: number[]): 'up' | 'down' | 'stable' => {
            const nz = arr.filter((v) => v > 0);
            if (nz.length < 2) return 'stable';
            const half = Math.floor(nz.length / 2);
            const firstAvg = nz.slice(0, half).reduce((a, b) => a + b, 0) / half;
            const secondAvg = nz.slice(half).reduce((a, b) => a + b, 0) / (nz.length - half);
            if (secondAvg > firstAvg + 0.5) return 'up';
            if (secondAvg < firstAvg - 0.5) return 'down';
            return 'stable';
          };

          if (!hasData) {
            return (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No data yet this week. Check in daily and log symptoms to see your trends here.
                  </p>
                </CardContent>
              </Card>
            );
          }

          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const trend = trendOf(metric.series);
                // A trend is "good" (green) when it moves in the metric's good direction.
                const good = trend !== 'stable' && trend === metric.goodDir;
                return (
                  <motion.div key={metric.label} whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded" style={{ backgroundColor: metric.color }}>
                                <Icon className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm">{metric.label}</span>
                            </div>
                            {trend === 'up' && (
                              <TrendingUp className={`h-3 w-3 ${good ? 'text-green-600' : 'text-amber-600'}`} />
                            )}
                            {trend === 'down' && (
                              <TrendingDown className={`h-3 w-3 ${good ? 'text-green-600' : 'text-amber-600'}`} />
                            )}
                          </div>
                          <div className="flex items-end gap-0.5 h-8">
                            {metric.series.map((value, idx) => (
                              <div
                                key={idx}
                                title={`${value || '—'}`}
                                className="flex-1 rounded-sm bg-gray-100"
                                style={{ minHeight: '2px' }}
                              >
                                <div
                                  className="w-full rounded-sm"
                                  style={{
                                    backgroundColor: metric.color,
                                    height: `${(value / 10) * 100}%`,
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          );
        })()}
      </motion.div>

      {/* Body Map Summary */}
      

      {/* Medication Status — reflects the Medications page */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" style={{ color: '#CDADD0' }} />
            Medication taken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-5 w-5 ${
                    medsToday && medsToday.total > 0 && medsToday.taken === medsToday.total
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
                <span>
                  {medsToday === null
                    ? 'Loading…'
                    : medsToday.total === 0
                    ? 'No medications yet'
                    : `${medsToday.taken} of ${medsToday.total} doses taken today`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                {medsToday === null
                  ? ''
                  : medsToday.total === 0
                  ? 'Add your medications to start tracking doses'
                  : medsToday.taken === medsToday.total
                  ? 'All done for today ✓'
                  : 'Mark doses as taken on the Medications page'}
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('medications')}>
              {medsToday && medsToday.total === 0 ? 'Add meds' : 'Log meds'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Gentle Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <Card style={{ backgroundColor: '#F8F6FF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: '#B48CBF' }} />
            Patterns & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              insight: 'Flares often follow poor sleep',
              confidence: 'Strong pattern',
            },
            {
              insight: 'Pain is higher on high-stress days',
              confidence: 'Moderate pattern',
            },
            {
              insight: 'Energy improves when meds are taken consistently',
              confidence: 'Strong pattern',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-lg border flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-medium mb-1">{item.insight}</p>
                <p className="text-xs text-muted-foreground">{item.confidence}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => onNavigate('insights')}>
            View details
          </Button>
        </CardContent>
      </Card>
      </motion.div>

      {/* Notes & Voice Logs */}
      

      {/* Empty State (shown when no data) */}
      {false && ( // Toggle this based on data presence
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="mb-2">You don't need perfect data to get value here.</h3>
            <p className="text-muted-foreground mb-6">
              Start with how today feels.
            </p>
            <Button size="lg" style={{ backgroundColor: '#7293BB' }}>
              First check-in
            </Button>
          </CardContent>
        </Card>
      )}


    </div>
  );
}