import { Router } from 'express';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const calendarRouter = Router();
calendarRouter.use(requireAuth);

/**
 * Returns a unified feed of everything that happened on the calendar:
 *   - symptom logs
 *   - daily check-ins
 *   - medication doses (with medication name/color)
 *   - flare events
 *   - medical records / appointments
 *
 * Clients can filter by ?from=<iso>&to=<iso>
 */
calendarRouter.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const userId = req.userId!;

    // Build reusable range filter applier
    const withRange = (query: any, field: string) => {
      if (from) query = query.gte(field, new Date(from).toISOString());
      if (to) query = query.lte(field, new Date(to).toISOString());
      return query;
    };

    const [symptoms, checkIns, doses, meds, flares, records] = await Promise.all([
      sb(await withRange(supabase.from('Symptom').select().eq('userId', userId), 'loggedAt')),
      sb(await withRange(supabase.from('DailyCheckIn').select().eq('userId', userId), 'date')),
      sb(
        await withRange(
          supabase.from('MedicationDose').select().eq('userId', userId),
          'scheduledAt'
        )
      ),
      // Fetch all medications for the user so we can join name/color
      sb(await supabase.from('Medication').select('id, name, color').eq('userId', userId)),
      sb(await withRange(supabase.from('FlareEvent').select().eq('userId', userId), 'startedAt')),
      sb(await withRange(supabase.from('MedicalRecord').select().eq('userId', userId), 'date')),
    ]);

    // Build a quick lookup for medication details
    const medById: Record<string, { name: string; color: string }> = {};
    for (const m of meds) {
      medById[m.id] = { name: m.name, color: m.color };
    }

    const events = [
      ...(symptoms as any[]).map((s: any) => ({
        id: s.id,
        type: 'symptom' as const,
        date: s.loggedAt,
        title: s.bodyPartName ?? (Array.isArray(s.symptoms) ? s.symptoms[0] : null) ?? 'Symptom',
        severity: s.severity,
        payload: {
          bodyPart: s.bodyPart,
          symptoms: Array.isArray(s.symptoms) ? s.symptoms : [],
          notes: s.notes,
        },
      })),
      ...(checkIns as any[]).map((c: any) => ({
        id: c.id,
        type: 'checkin' as const,
        date: c.date,
        title: 'Daily check-in',
        severity: c.painIntensity === 'severe' ? 8 : c.painIntensity === 'moderate' ? 5 : 2,
        payload: { energy: c.energy, mood: c.mood, flareStatus: c.flareStatus },
      })),
      ...(doses as any[]).map((d: any) => {
        const med = medById[d.medicationId] ?? { name: 'Medication', color: '#7293BB' };
        return {
          id: d.id,
          type: 'medication' as const,
          date: d.scheduledAt,
          title: med.name,
          severity: 0,
          payload: { taken: !!d.takenAt, skipped: d.skipped, color: med.color },
        };
      }),
      ...(flares as any[]).map((f: any) => ({
        id: f.id,
        type: 'flare' as const,
        date: f.startedAt,
        endDate: f.endedAt,
        title: 'Flare',
        severity: f.severity,
        payload: {
          resolved: f.resolved,
          triggers: Array.isArray(f.triggers) ? f.triggers : [],
        },
      })),
      ...(records as any[]).map((r: any) => ({
        id: r.id,
        type: 'appointment' as const,
        date: r.date,
        title: r.title,
        severity: 0,
        payload: { providerName: r.providerName, recordType: r.type },
      })),
    ].sort((a, b) => +new Date(a.date) - +new Date(b.date));

    res.json(events);
  } catch (e) {
    next(e);
  }
});
