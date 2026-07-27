import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Activity, Pill, Apple, Check } from 'lucide-react';
import {
  symptoms as symptomsApi,
  medications as medsApi,
  diet as dietApi,
  type ParsedLog,
} from '../../lib/api';

type Category = 'diet' | 'symptoms' | 'medications';

interface DetectedExtrasProps {
  parsed: ParsedLog | null;
  /** Which cross-categories to offer (exclude the host section's own category) */
  show: Array<Category>;
  /**
   * Categories to log automatically (no tap needed). Used so that a symptom
   * mentioned anywhere — e.g. "nausea" in a diet note — is recorded on the
   * symptoms page on its own.
   */
  auto?: Array<Category>;
  title?: string;
}

/**
 * Renders one-tap "log to another section" chips for the items a voice note
 * mentioned outside the current section (e.g. a symptom + medication named in a
 * diet note). Each chip writes directly to its section's API.
 */
type Status = 'idle' | 'saving' | 'done' | 'error';

export function DetectedExtras({ parsed, show, auto, title }: DetectedExtrasProps) {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const autoRunRef = useRef<Set<string>>(new Set());

  const items: Array<{
    key: string;
    cat: Category;
    icon: React.ReactNode;
    label: string;
    run: () => Promise<unknown>;
  }> = [];

  if (parsed && show.includes('symptoms')) {
    parsed.symptoms.forEach((s, i) =>
      items.push({
        key: `s-${i}-${s.name}`,
        cat: 'symptoms',
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

  if (parsed && show.includes('medications')) {
    parsed.medications.forEach((m, i) =>
      items.push({
        key: `m-${i}-${m.name}`,
        cat: 'medications',
        icon: <Pill className="h-3 w-3 mr-1" />,
        label: `${m.name}${m.dose ? ` ${m.dose}` : ''}`,
        // If the med is already registered → mark it taken once today. If not →
        // add it as a same-day situational event only (inactive, so it stays out
        // of the daily tracker + dashboard count; shows on calendar + summary).
        run: async () => {
          const d = new Date();
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const list = await medsApi.list().catch(() => [] as any[]);
          const existing = list.find(
            (md) => md.name.trim().toLowerCase() === m.name.trim().toLowerCase()
          );
          if (existing) {
            await medsApi.toggleDose(existing.id, 0, true, key).catch(() => {});
            return existing;
          }
          const created = await medsApi.create({
            name: m.name,
            dosage: m.dose ?? 'Not specified',
            frequency: 'As Needed',
            timesPerDay: 1,
            scheduleTimes: [],
            startDate: new Date().toISOString(),
            notes: m.notes || 'Taken as needed (logged from a voice note)',
            active: false,
          });
          await medsApi.toggleDose(created.id, 0, true, key).catch(() => {});
          return created;
        },
      })
    );
  }

  if (parsed && show.includes('diet') && parsed.diet) {
    const d = parsed.diet;
    items.push({
      key: `d-${d.food}`,
      cat: 'diet',
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

  const handle = async (key: string, run: () => Promise<unknown>) => {
    setStatus((prev) => ({ ...prev, [key]: 'saving' }));
    try {
      await run();
      setStatus((prev) => ({ ...prev, [key]: 'done' }));
    } catch {
      setStatus((prev) => ({ ...prev, [key]: 'error' }));
    }
  };

  // Auto-log the requested categories (e.g. symptoms) as soon as a note is
  // parsed — no tap needed — so they land on their own page automatically.
  useEffect(() => {
    if (!parsed || !auto || auto.length === 0) return;
    autoRunRef.current = new Set();
    items
      .filter((it) => auto.includes(it.cat) && !autoRunRef.current.has(it.key))
      .forEach((it) => {
        autoRunRef.current.add(it.key);
        handle(it.key, it.run);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);

  if (items.length === 0) return null;

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
