import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  calendar as calendarApi,
  insights as insightsApi,
  type CalendarEvent,
} from '../../lib/api';
import { useAuth } from '../../context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Flame, Pill, Apple, Activity, X, AlertCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

// Common/"potential" trigger foods, layered with the user's own known triggers
// and any AI-flagged foods at runtime (see triggerSet below).
const COMMON_TRIGGER_FOODS = ['sugar', 'dairy', 'gluten', 'alcohol', 'bread', 'pasta', 'fried food', 'processed food', 'caffeine', 'toast'];

// A severity strictly greater than this counts as a "severe" symptom.
const SEVERE_SYMPTOM_THRESHOLD = 6;

interface DayData {
  date: Date;
  symptoms: { name: string; severity: number }[];
  medications: { name: string; taken: boolean }[];
  nutrition: { meal: string; items: string[] }[];
  appointments?: { type: string; time: string; provider: string }[];
  isFlareDay: boolean;
  /** A trigger / potential-trigger food was eaten this day. */
  hadTriggerFood: boolean;
  notes?: string;
}

export function HealthCalendar() {
  // Default to the current month in the user's local time.
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);
  // AI-flagged foods feed the trigger-food warning alongside the user's triggers.
  const [potentialTriggers, setPotentialTriggers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    insightsApi.analyze().then((a) => setPotentialTriggers(a.triggerFoods ?? [])).catch(() => {});
  }, []);

  // Combined lowercased set: common potential triggers + the user's declared
  // triggers + any AI-flagged foods. Used to warn when one is eaten.
  const triggerSet = new Set<string>([
    ...COMMON_TRIGGER_FOODS,
    ...(user?.knownTriggers ?? []).map((t) => t.toLowerCase().trim()),
    ...potentialTriggers.map((t) => t.toLowerCase().trim()),
  ]);

  useEffect(() => {
    // Widen the query by a day on each side so events near month edges that
    // shift across the UTC/local boundary are still fetched, then bucketed by
    // local date below.
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    start.setDate(start.getDate() - 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    end.setDate(end.getDate() + 1);
    calendarApi.list(start.toISOString(), end.toISOString()).then(setCalEvents).catch(console.error);
  }, [currentDate]);

  // Bucket events by the user's LOCAL calendar date (syncs to their location),
  // not the raw UTC portion of the ISO timestamp.
  const eventsByDate = calEvents.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const d = new Date(ev.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDayData = (day: number): DayData | null => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const key = formatDateKey(date);
    const evs = eventsByDate[key];
    if (!evs || evs.length === 0) return null;
    // Build a DayData-shaped object from API events
    const symptoms: DayData['symptoms'] = [];
    const medications: DayData['medications'] = [];
    const nutrition: DayData['nutrition'] = [];
    const appointments: DayData['appointments'] = [];
    let isFlareDay = false;
    let hadTriggerFood = false;
    for (const ev of evs) {
      if (ev.type === 'symptom') {
        symptoms.push({ name: ev.title, severity: ev.severity });
      } else if (ev.type === 'medication') {
        const taken = (ev.payload as any)?.taken ?? true;
        medications.push({ name: ev.title, taken });
      } else if (ev.type === 'flare') {
        isFlareDay = true;
      } else if (ev.type === 'appointment') {
        appointments.push({ type: ev.title, time: '', provider: '' });
      } else if (ev.type === 'diet') {
        const p = ev.payload as any;
        const items: string[] = Array.isArray(p?.foods) && p.foods.length ? p.foods : [ev.title];
        nutrition.push({ meal: p?.mealType ? String(p.mealType) : 'Meal', items });
        // Flagged at log time (negative reaction) OR matches a known/potential trigger.
        const flagged = Array.isArray(p?.triggers) && p.triggers.length > 0;
        const matches = items.some((it) => triggerSet.has(String(it).toLowerCase().trim()));
        if (flagged || matches) hadTriggerFood = true;
      }
    }
    return { date, symptoms, medications, nutrition, appointments, isFlareDay, hadTriggerFood };
  };

  const handleDayClick = (day: number) => {
    const dayData = getDayData(day);
    if (dayData) {
      setSelectedDay(dayData);
      setDialogOpen(true);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const now = new Date(); // real "today" in the user's local time
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // The three warning conditions for a day: missed meds (past days only),
  // trigger foods eaten, or a severe (>6) symptom.
  const getWarnings = (dayDate: Date, dayData: DayData | null) => {
    const isPast = dayDate < todayMidnight;
    // Frozen history: a day only counts as "missed" if a dose that WAS logged
    // that day wasn't taken. If every logged dose was taken, no warning — and a
    // schedule edit made later never rewrites a past day.
    const missedMeds = isPast && (dayData?.medications.some((m) => !m.taken) ?? false);
    const triggerFoods = dayData?.hadTriggerFood ?? false;
    const severeSymptom = dayData?.symptoms.some((s) => s.severity > SEVERE_SYMPTOM_THRESHOLD) ?? false;
    return { missedMeds, triggerFoods, severeSymptom, any: missedMeds || triggerFoods || severeSymptom };
  };

  const calendarDays = [];
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = getDayData(day);
    const isToday =
      day === now.getDate() &&
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getFullYear() === now.getFullYear();

    const warnings = getWarnings(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), dayData);
    const hasWarning = warnings.any;
    const warningLabel = [
      warnings.missedMeds && 'missed medications',
      warnings.triggerFoods && 'trigger foods',
      warnings.severeSymptom && 'severe symptoms',
    ]
      .filter(Boolean)
      .join(', ');

    calendarDays.push(
      <div
        key={day}
        className={`aspect-square border rounded-lg p-1 sm:p-2 cursor-pointer transition-all hover:shadow-md ${
          isToday ? 'border-2 border-[#7293BB]' : ''
        } ${dayData?.isFlareDay ? 'bg-red-50' : 'bg-white'}`}
        style={
          dayData?.isFlareDay
            ? { borderColor: '#E89BA1', borderWidth: '2px' }
            : {}
        }
        onClick={() => handleDayClick(day)}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <span className={`text-xs sm:text-sm ${isToday ? 'font-bold text-[#7293BB]' : ''}`}>
              {day}
            </span>
            <div className="flex items-center gap-1">
              {hasWarning && (
                <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: '#F59E0B' }} title={`Warning: ${warningLabel}`} />
              )}
              {dayData?.isFlareDay && (
                <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: '#E89BA1' }} />
              )}
            </div>
          </div>
          
          {dayData && (
            <div className="flex flex-col gap-0.5 mt-0.5 sm:mt-1">
              {dayData.appointments && dayData.appointments.length > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Calendar className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" style={{ color: '#7293BB' }} />
                  <span className="text-[10px] sm:text-xs" style={{ color: '#7293BB' }}>{dayData.appointments.length}</span>
                </div>
              )}
              {dayData.symptoms.length > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Activity className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{dayData.symptoms.length}</span>
                </div>
              )}
              {dayData.medications.length > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Pill className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {dayData.medications.filter(m => m.taken).length}/{dayData.medications.length}
                  </span>
                </div>
              )}
              {dayData.nutrition.length > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Apple className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{dayData.nutrition.length}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Health Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[180px] text-center">{monthName}</span>
              <Button variant="outline" size="sm" onClick={nextMonth} className="px-3 py-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="space-y-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="mb-3">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: '#7293BB' }} />
                <span className="text-sm">Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" style={{ color: '#E89BA1' }} />
                <span className="text-sm">Flare day</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
                <span className="text-sm">Warning (Meds/Diet/Severe symptom)</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Symptoms logged</span>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Medications tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Meals logged</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? selectedDay.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }) : 'Day Details'}
            </DialogTitle>
            <DialogDescription>
              View detailed health information for this day including symptoms, medications, and nutrition.
            </DialogDescription>
          </DialogHeader>

          {selectedDay && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {/* Display flare day badge */}
                {selectedDay.isFlareDay && (
                  <Badge
                    className="flex items-center gap-1 w-fit"
                    style={{ backgroundColor: '#E89BA1', color: 'white' }}
                  >
                    <Flame className="h-3 w-3" />
                    Flare Day
                  </Badge>
                )}

                {/* Display warning badges */}
                {(() => {
                  const w = getWarnings(selectedDay.date, selectedDay);
                  return (
                    <>
                      {w.missedMeds && (
                        <Badge
                          className="flex items-center gap-1 w-fit"
                          style={{ backgroundColor: '#F59E0B', color: 'white' }}
                        >
                          <AlertCircle className="h-3 w-3" />
                          Missed Medications
                        </Badge>
                      )}
                      {w.triggerFoods && (
                        <Badge
                          className="flex items-center gap-1 w-fit"
                          style={{ backgroundColor: '#F59E0B', color: 'white' }}
                        >
                          <AlertCircle className="h-3 w-3" />
                          Trigger Foods
                        </Badge>
                      )}
                      {w.severeSymptom && (
                        <Badge
                          className="flex items-center gap-1 w-fit"
                          style={{ backgroundColor: '#F59E0B', color: 'white' }}
                        >
                          <AlertCircle className="h-3 w-3" />
                          Severe Symptoms
                        </Badge>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Appointments */}
              {selectedDay.appointments && selectedDay.appointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" style={{ color: '#7293BB' }} />
                      Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDay.appointments.map((appointment, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium">{appointment.type}</span>
                          <Badge variant="outline" style={{ backgroundColor: '#7293BB20', borderColor: '#7293BB', color: '#7293BB' }}>
                            {appointment.time}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.provider}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Symptoms */}
              {selectedDay.symptoms.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-4 w-4" style={{ color: '#B48CBF' }} />
                      Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDay.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span>{symptom.name}</span>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor:
                              symptom.severity >= 8
                                ? '#E89BA1'
                                : symptom.severity >= 5
                                ? '#F59E0B'
                                : '#A5D3CF',
                            color: 'white',
                            borderColor:
                              symptom.severity >= 8
                                ? '#E89BA1'
                                : symptom.severity >= 5
                                ? '#F59E0B'
                                : '#A5D3CF',
                          }}
                        >
                          Severity {symptom.severity}/10
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Medications */}
              {selectedDay.medications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Pill className="h-4 w-4" style={{ color: '#CDADD0' }} />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedDay.medications.map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span>{med.name}</span>
                        <Badge variant={med.taken ? 'default' : 'secondary'} style={med.taken ? { backgroundColor: '#A5D3CF' } : {}}>
                          {med.taken ? 'Taken ✓' : 'Missed'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Nutrition */}
              {selectedDay.nutrition.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Apple className="h-4 w-4" style={{ color: '#A5D3CF' }} />
                      Nutrition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedDay.nutrition.map((meal, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-sm font-medium">{meal.meal}</h4>
                        <div className="flex flex-wrap gap-1">
                          {meal.items.map((item, itemIdx) => (
                            <Badge key={itemIdx} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedDay.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedDay.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}