import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb, sbMaybe } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const checkInsRouter = Router();
checkInsRouter.use(requireAuth);

const schema = z.object({
  date: z.string().datetime().optional(),
  energy: z.number().int().min(1).max(10).optional(),
  painIntensity: z.enum(['mild', 'moderate', 'severe']).optional(),
  painLocations: z.array(z.string()).optional(),
  painTypes: z.array(z.string()).optional(),
  flareStatus: z.enum(['no', 'maybe', 'yes']).optional(),
  flareSeverity: z.enum(['mild', 'moderate', 'severe']).optional(),
  sleep: z.enum(['poor', 'okay', 'good']).optional(),
  sleepHours: z.number().optional(),
  sleepDisrupted: z.boolean().optional(),
  stress: z.number().int().min(1).max(10).optional(),
  mood: z.number().int().min(1).max(10).optional(),
  medsTaken: z.enum(['yes', 'some', 'no']).optional(),
  sideEffects: z.array(z.string()).optional(),
  gutIssues: z.array(z.string()).optional(),
  foodTriggers: z.array(z.string()).optional(),
  mobility: z.enum(['hard', 'some-difficulty', 'okay']).optional(),
  notes: z.string().optional(),
  // Dynamic tracked-factor values { label: number } + which part of day.
  factors: z.record(z.any()).optional(),
  partOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
});

checkInsRouter.get('/', async (req, res, next) => {
  try {
    const { from, to, limit } = req.query as { from?: string; to?: string; limit?: string };
    let query = supabase
      .from('DailyCheckIn')
      .select()
      .eq('userId', req.userId!)
      .order('date', { ascending: false })
      .limit(Number(limit ?? 365));

    if (from) query = query.gte('date', new Date(from).toISOString());
    if (to) query = query.lte('date', new Date(to).toISOString());

    const items = sb(await query);
    res.json(items);
  } catch (e) {
    next(e);
  }
});

checkInsRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    // Full timestamp (not start-of-day) so multiple check-ins per day are
    // distinct rows without dropping the (userId, date) unique index.
    const dateIso = (body.date ? new Date(body.date) : new Date()).toISOString();

    const base: Record<string, unknown> = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      date: dateIso,
      energy: body.energy ?? null,
      painIntensity: body.painIntensity ?? null,
      painLocations: body.painLocations ?? [],
      painTypes: body.painTypes ?? [],
      flareStatus: body.flareStatus ?? null,
      flareSeverity: body.flareSeverity ?? null,
      sleep: body.sleep ?? null,
      sleepHours: body.sleepHours ?? null,
      sleepDisrupted: body.sleepDisrupted ?? false,
      stress: body.stress ?? null,
      mood: body.mood ?? null,
      medsTaken: body.medsTaken ?? null,
      sideEffects: body.sideEffects ?? [],
      gutIssues: body.gutIssues ?? [],
      foodTriggers: body.foodTriggers ?? [],
      mobility: body.mobility ?? null,
      notes: body.notes ?? null,
    };

    // factors / partOfDay may not be migrated yet — insert with, retry without.
    let result = await supabase
      .from('DailyCheckIn')
      .insert({ ...base, factors: body.factors ?? null, partOfDay: body.partOfDay ?? null })
      .select()
      .single();

    if (result.error) {
      const msg = result.error.message ?? '';
      if ((msg.includes('factors') || msg.includes('partOfDay')) && /column|schema cache/i.test(msg)) {
        result = await supabase.from('DailyCheckIn').insert(base).select().single();
      }
    }

    res.status(201).json(sb(result));
  } catch (e) {
    next(e);
  }
});
