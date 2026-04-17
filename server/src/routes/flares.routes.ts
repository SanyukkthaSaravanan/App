import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
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
    const items = await prisma.flareEvent.findMany({
      where: { userId: req.userId! },
      orderBy: { startedAt: 'desc' },
    });
    res.json(
      items.map((f) => ({
        ...f,
        triggers: fromJson<string[]>(f.triggers) ?? [],
        locations: fromJson<string[]>(f.locations) ?? [],
      }))
    );
  } catch (e) {
    next(e);
  }
});

flaresRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const created = await prisma.flareEvent.create({
      data: {
        userId: req.userId!,
        startedAt: new Date(body.startedAt),
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
        severity: body.severity,
        triggers: toJson(body.triggers ?? []),
        locations: toJson(body.locations ?? []),
        notes: body.notes,
        resolved: body.resolved ?? false,
      },
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

flaresRouter.post('/:id/resolve', async (req, res, next) => {
  try {
    await prisma.flareEvent.updateMany({
      where: { id: req.params.id, userId: req.userId! },
      data: { resolved: true, endedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
