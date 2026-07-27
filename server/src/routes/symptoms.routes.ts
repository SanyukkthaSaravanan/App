import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const symptomsRouter = Router();
symptomsRouter.use(requireAuth);

const createSchema = z.object({
  bodyPart: z.string().nullable().optional(),
  bodyPartName: z.string().nullable().optional(),
  symptoms: z.array(z.string()).min(1),
  severity: z.number().int().min(1).max(10),
  notes: z.string().optional(),
  view: z.enum(['front', 'side']).nullable().optional(),
  loggedAt: z.string().datetime().optional(),
});

symptomsRouter.get('/', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 200);
    const items = sb(
      await supabase
        .from('Symptom')
        .select()
        .eq('userId', req.userId!)
        .order('loggedAt', { ascending: false })
        .limit(limit)
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

symptomsRouter.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const created = sb(
      await supabase
        .from('Symptom')
        .insert({
          id: crypto.randomUUID(),
          userId: req.userId!,
          bodyPart: body.bodyPart ?? null,
          bodyPartName: body.bodyPartName ?? null,
          symptoms: body.symptoms,
          severity: body.severity,
          notes: body.notes ?? null,
          view: body.view ?? null,
          loggedAt: body.loggedAt ? new Date(body.loggedAt).toISOString() : new Date().toISOString(),
        })
        .select()
        .single()
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

const patchSchema = z.object({
  symptoms: z.array(z.string()).min(1).optional(),
  severity: z.number().int().min(1).max(10).optional(),
  notes: z.string().nullable().optional(),
  bodyPartName: z.string().nullable().optional(),
});

symptomsRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = patchSchema.parse(req.body);
    const updates: Record<string, unknown> = {};
    if (body.symptoms !== undefined) updates.symptoms = body.symptoms;
    if (body.severity !== undefined) updates.severity = body.severity;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.bodyPartName !== undefined) updates.bodyPartName = body.bodyPartName;

    const updated = sb(
      await supabase
        .from('Symptom')
        .update(updates)
        .eq('id', req.params.id)
        .eq('userId', req.userId!)
        .select()
        .single()
    );
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

symptomsRouter.delete('/:id', async (req, res, next) => {
  try {
    await supabase
      .from('Symptom')
      .delete()
      .eq('id', req.params.id)
      .eq('userId', req.userId!);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
