import React, { useState } from 'react';
import { Button } from './ui/button';
import { Activity, Pill, Apple, Check } from 'lucide-react';
import {
  symptoms as symptomsApi,
  medications as medsApi,
  diet as dietApi,
  type ParsedLog,
} from '../../lib/api';

interface DetectedExtrasProps {
  parsed: ParsedLog | null;
  /** Which cross-categories to offer (exclude the host section's own category) */
  show: Array<'diet' | 'symptoms' | 'medications'>;
  title?: string;
}

/**
 * Renders one-tap "log to another section" chips for the items a voice note
 * mentioned outside the current section (e.g. a symptom + medication named in a
 * diet note). Each chip writes directly to its section's API.
 */
type Status = 'idle' | 'saving' | 'done' | 'error';

export function DetectedExtras({ parsed, show, title }: DetectedExtrasProps) {
  const [status, setStatus] = useState<Record<string, Status>>({});

  if (!parsed) return null;

  const items: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    run: () => Promise<unknown>;
  }> = [];

  if (show.includes('symptoms')) {
    parsed.symptoms.forEach((s, i) =>
      items.push({
        key: `s-${i}-${s.name}`,
        icon: <Activity className="h-3 w-3 mr-1" />,
        label: `${s.name}${s.severity ? ` (${s.severity}/10)` : ''}`,
        run: () =>
          symptomsApi.create({
            bodyPart: null,
            bodyPartName: s.bodyPart ?? null,
            symptoms: [s.name],
            severity: s.severity ?? 5,
            notes: s.notes || 'Logged from a voice note',
            view: null,
          }),
      })
    );
  }

  if (show.includes('medications')) {
    parsed.medications.forEach((m, i) =>
      items.push({
        key: `m-${i}-${m.name}`,
        icon: <Pill className="h-3 w-3 mr-1" />,
        label: `${m.name}${m.dose ? ` ${m.dose}` : ''}`,
        run: () =>
          medsApi.create({
            name: m.name,
            dosage: m.dose ?? 'Not specified',
            frequency: 'As Needed',
            timesPerDay: 1,
            scheduleTimes: [],
            startDate: new Date().toISOString(),
            notes: m.notes || 'Logged from a voice note',
          }),
      })
    );
  }

  if (show.includes('diet') && parsed.diet) {
    const d = parsed.diet;
    items.push({
      key: `d-${d.food}`,
      icon: <Apple className="h-3 w-3 mr-1" />,
      label: d.food,
      run: () =>
        dietApi.create({
          mealType: d.mealType.toLowerCase() as any,
          foods: [d.food],
          triggers: d.reaction === 'negative' ? [d.food] : [],
          notes: [d.notes, parsed.summary].filter(Boolean).join(' — '),
          ateAt: new Date().toISOString(),
        }),
    });
  }

  if (items.length === 0) return null;

  const handle = async (key: string, run: () => Promise<unknown>) => {
    setStatus((prev) => ({ ...prev, [key]: 'saving' }));
    try {
      await run();
      setStatus((prev) => ({ ...prev, [key]: 'done' }));
    } catch {
      setStatus((prev) => ({ ...prev, [key]: 'error' }));
    }
  };

  const anyError = items.some((it) => status[it.key] === 'error');

  return (
    <div className="p-3 rounded-lg border border-dashed border-[#B48CBF] bg-[#F5F0F6]">
      <p className="text-xs font-medium mb-2 text-[#7A5A85]">
        {title ?? 'Also detected in your note — log to other sections?'}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => {
          const st = status[it.key] ?? 'idle';
          const done = st === 'done';
          return (
            <Button
              key={it.key}
              size="sm"
              variant="outline"
              disabled={st === 'saving' || done}
              onClick={() => handle(it.key, it.run)}
              className={
                done
                  ? 'border-green-400 text-green-700'
                  : st === 'error'
                  ? 'border-red-400 text-red-700'
                  : ''
              }
            >
              {st === 'saving' ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : done ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                it.icon
              )}
              {it.label}
              {done ? ' · logged' : st === 'error' ? ' · retry' : ''}
            </Button>
          );
        })}
      </div>
      {anyError && (
        <p className="text-xs text-red-600 mt-2">
          Couldn't log that — tap the item again to retry.
        </p>
      )}
    </div>
  );
}
