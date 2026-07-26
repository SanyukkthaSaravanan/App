import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { checkins as checkinsApi, type CheckIn } from '../../lib/api';
import { type TrackerDef } from '../../lib/trackers';

interface DailyCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackers: TrackerDef[];
  onSaved: () => void;
}

function partOfDayNow(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

/**
 * Dynamic daily check-in: renders an input for each factor the user chose to
 * track (in onboarding / settings), then saves. Known factors map to the
 * DailyCheckIn columns; everything is also stored in `factors` for fidelity.
 */
export function DailyCheckInModal({ open, onOpenChange, trackers, onSaved }: DailyCheckInModalProps) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (id: string, v: number) => setValues((prev) => ({ ...prev, [id]: v }));

  const reset = () => {
    setValues({});
    setNotes('');
  };

  const save = async () => {
    setSaving(true);

    // Map known factors onto DailyCheckIn columns for the trends/insights readers.
    const payload: Partial<CheckIn> = {
      notes: notes.trim() || undefined,
      partOfDay: partOfDayNow(),
      factors: {},
    };
    const factorsByLabel: Record<string, number> = {};

    for (const t of trackers) {
      const v = values[t.id];
      if (v === undefined) continue;
      factorsByLabel[t.label] = v;
      if (t.id === 'energy') payload.energy = v; // 1-5
      else if (t.id === 'stress') payload.stress = v; // 0-10
      else if (t.id === 'mood') payload.mood = v; // 1-5
      else if (t.id === 'sleep') payload.sleep = v === 1 ? 'poor' : v === 3 ? 'good' : 'okay';
      else if (t.id === 'pain') payload.painIntensity = v <= 3 ? 'mild' : v <= 7 ? 'moderate' : 'severe';
    }
    payload.factors = factorsByLabel;

    try {
      await checkinsApi.save(payload);
      onSaved();
      reset();
      onOpenChange(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[checkin] save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const painColor = (v: number) => (v <= 3 ? '#A5D3CF' : v <= 7 ? '#F59E0B' : '#E89BA1');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick check-in</DialogTitle>
          <DialogDescription>
            Log how you're doing right now — you can check in up to three times a day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {trackers.map((t) => (
            <div key={t.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{t.question}</p>
                <span className="text-[10px] text-muted-foreground">{t.marker}</span>
              </div>

              {/* Emoji scale */}
              {t.measure === 'emoji' && t.emojiOptions && (
                <div className="flex justify-center gap-2 flex-wrap">
                  {t.emojiOptions.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => set(t.id, o.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        values[t.id] === o.value ? 'bg-[#7293BB] text-white scale-105' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{o.emoji}</span>
                      <span className="text-[11px]">{o.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 0–10 scale slider */}
              {t.measure === 'scale' && (
                <div className="space-y-2">
                  <div
                    className="text-4xl font-bold text-center"
                    style={{ color: t.id === 'pain' ? painColor(values[t.id] ?? 0) : '#7293BB' }}
                  >
                    {values[t.id] ?? 0}
                  </div>
                  <Slider
                    value={[values[t.id] ?? 0]}
                    onValueChange={(val) => set(t.id, val[0])}
                    min={t.min ?? 0}
                    max={t.max ?? 10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t.min ?? 0}</span>
                    <span>{t.max ?? 10}</span>
                  </div>
                </div>
              )}

              {/* Counter (e.g. water glasses) */}
              {t.measure === 'counter' && (
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => set(t.id, Math.max(t.min ?? 0, (values[t.id] ?? 0) - 1))}>
                    −
                  </Button>
                  <div className="text-center">
                    <span className="text-3xl font-bold" style={{ color: '#7293BB' }}>{values[t.id] ?? 0}</span>
                    {t.unit && <span className="text-sm text-muted-foreground ml-1">{t.unit}</span>}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => set(t.id, Math.min(t.max ?? 99, (values[t.id] ?? 0) + 1))}>
                    +
                  </Button>
                </div>
              )}

              {/* Yes / No */}
              {t.measure === 'yesno' && (
                <div className="flex justify-center gap-3">
                  {[{ v: 1, l: 'Yes' }, { v: 0, l: 'No' }].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => set(t.id, o.v)}
                      className={`px-8 py-2 rounded-xl border transition-all ${
                        values[t.id] === o.v ? 'bg-[#7293BB] text-white border-[#7293BB]' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <p className="font-medium">Anything to note?</p>
            <Textarea
              placeholder="Optional — how are you feeling, anything worth remembering…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="flex-1" style={{ backgroundColor: '#7293BB' }} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save check-in'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
