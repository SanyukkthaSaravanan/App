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
    const date = body.date ? new Date(body.date) : new Date();
    // Normalize to start of day
    date.setHours(0, 0, 0, 0);
    const dateIso = date.toISOString();

    const payload = {
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

    // Try to find existing check-in for this user+date
    const existing = sbMaybe(
      await supabase
        .from('DailyCheckIn')
        .select('id')
        .eq('userId', req.userId!)
        .eq('date', dateIso)
        .single()
    ) as { id: string } | null;

    let result;
    if (existing) {
      result = sb(
        await supabase
          .from('DailyCheckIn')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()
      );
    } else {
      result = sb(
        await supabase
          .from('DailyCheckIn')
          .insert({ id: crypto.randomUUID(), ...payload })
          .select()
          .single()
      );
    }

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});
