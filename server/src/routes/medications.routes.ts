import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
import { requireAuth } from '../middleware/auth';

export const medicationsRouter = Router();
medicationsRouter.use(requireAuth);

const medSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  timesPerDay: z.number().int().min(1).max(12),
  scheduleTimes: z.array(z.string()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

medicationsRouter.get('/', async (req, res, next) => {
  try {
    const meds = await prisma.medication.findMany({
      where: { userId: req.userId!, active: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      meds.map((m) => ({
        ...m,
        scheduleTimes: fromJson<string[]>(m.scheduleTimes) ?? [],
      }))
    );
  } catch (e) {
    next(e);
  }
});

medicationsRouter.post('/', async (req, res, next) => {
  try {
    const body = medSchema.parse(req.body);
    const created = await prisma.medication.create({
      data: {
        userId: req.userId!,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        timesPerDay: body.timesPerDay,
        scheduleTimes: toJson(body.scheduleTimes)!,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        color: body.color ?? '#7293BB',
        notes: body.notes,
      },
    });
    res.status(201).json({ ...created, scheduleTimes: body.scheduleTimes });
  } catch (e) {
    next(e);
  }
});

medicationsRouter.get('/:id/doses', async (req, res, next) => {
  try {
    const doses = await prisma.medicationDose.findMany({
      where: { userId: req.userId!, medicationId: req.params.id },
      orderBy: { scheduledAt: 'desc' },
      take: 90,
    });
    res.json(doses);
  } catch (e) {
    next(e);
  }
});

medicationsRouter.post('/:id/doses/:doseId/taken', async (req, res, next) => {
  try {
    const updated = await prisma.medicationDose.updateMany({
      where: {
        id: req.params.doseId,
        medicationId: req.params.id,
        userId: req.userId!,
      },
      data: { takenAt: new Date(), skipped: false },
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

medicationsRouter.post('/:id/doses/:doseId/skip', async (req, res, next) => {
  try {
    await prisma.medicationDose.updateMany({
      where: {
        id: req.params.doseId,
        medicationId: req.params.id,
        userId: req.userId!,
      },
      data: { skipped: true, takenAt: null },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
