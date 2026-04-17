import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
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
    const items = await prisma.symptom.findMany({
      where: { userId: req.userId! },
      orderBy: { loggedAt: 'desc' },
      take: Number(req.query.limit ?? 200),
    });
    res.json(
      items.map((s) => ({
        ...s,
        symptoms: fromJson<string[]>(s.symptoms) ?? [],
      }))
    );
  } catch (e) {
    next(e);
  }
});

symptomsRouter.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const created = await prisma.symptom.create({
      data: {
        userId: req.userId!,
        bodyPart: body.bodyPart ?? null,
        bodyPartName: body.bodyPartName ?? null,
        symptoms: toJson(body.symptoms)!,
        severity: body.severity,
        notes: body.notes,
        view: body.view ?? null,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
    });
    res.status(201).json({ ...created, symptoms: body.symptoms });
  } catch (e) {
    next(e);
  }
});

symptomsRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.symptom.deleteMany({
      where: { id: req.params.id, userId: req.userId! },
    });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
