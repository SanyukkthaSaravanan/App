import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const medicalRecordsRouter = Router();
medicalRecordsRouter.use(requireAuth);

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(['lab', 'imaging', 'visit', 'prescription', 'other']),
  providerName: z.string().optional(),
  date: z.string().datetime(),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

medicalRecordsRouter.get('/', async (req, res, next) => {
  try {
    const items = sb(
      await supabase
        .from('MedicalRecord')
        .select()
        .eq('userId', req.userId!)
        .order('date', { ascending: false })
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

medicalRecordsRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const created = sb(
      await supabase
        .from('MedicalRecord')
        .insert({
          id: crypto.randomUUID(),
          userId: req.userId!,
          title: body.title,
          type: body.type,
          providerName: body.providerName ?? null,
          date: new Date(body.date).toISOString(),
          fileUrl: body.fileUrl ?? null,
          notes: body.notes ?? null,
          tags: body.tags ?? [],
        })
        .select()
        .single()
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});
