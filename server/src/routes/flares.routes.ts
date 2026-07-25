import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const flaresRouter = Router();
flaresRouter.use(requireAuth);

const schema = z.object({
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable().optional(),
  severity: z.number().int().min(1).max(10),
  triggers: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  notes: z.string().optional(),
  resolved: z.boolean().optional(),
});

flaresRouter.get('/', async (req, res, next) => {
  try {
    const items = sb(
      await supabase
        .from('FlareEvent')
        .select()
        .eq('userId', req.userId!)
        .order('startedAt', { ascending: false })
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

flaresRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const created = sb(
      await supabase
        .from('FlareEvent')
        .insert({
          id: crypto.randomUUID(),
          userId: req.userId!,
          startedAt: new Date(body.startedAt).toISOString(),
          endedAt: body.endedAt ? new Date(body.endedAt).toISOString() : null,
          severity: body.severity,
          triggers: body.triggers ?? [],
          locations: body.locations ?? [],
          notes: body.notes ?? null,
          resolved: body.resolved ?? false,
        })
        .select()
        .single()
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

flaresRouter.post('/:id/resolve', async (req, res, next) => {
  try {
    await supabase
      .from('FlareEvent')
      .update({ resolved: true, endedAt: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('userId', req.userId!);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
