import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const dietRouter = Router();
dietRouter.use(requireAuth);

const schema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(z.string()).min(1),
  triggers: z.array(z.string()).optional(),
  calories: z.number().int().optional(),
  notes: z.string().optional(),
  ateAt: z.string().datetime().optional(),
});

dietRouter.get('/', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 200);
    const items = sb(
      await supabase
        .from('DietLog')
        .select()
        .eq('userId', req.userId!)
        .order('ateAt', { ascending: false })
        .limit(limit)
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

dietRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const created = sb(
      await supabase
        .from('DietLog')
        .insert({
          id: crypto.randomUUID(),
          userId: req.userId!,
          mealType: body.mealType,
          foods: body.foods,
          triggers: body.triggers ?? [],
          calories: body.calories ?? null,
          notes: body.notes ?? null,
          ateAt: body.ateAt ? new Date(body.ateAt).toISOString() : new Date().toISOString(),
        })
        .select()
        .single()
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});
