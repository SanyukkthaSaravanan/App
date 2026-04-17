import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
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

const arrayFields = [
  'painLocations',
  'painTypes',
  'sideEffects',
  'gutIssues',
  'foodTriggers',
] as const;

const hydrate = (row: Record<string, unknown>) => {
  const out = { ...row };
  for (const k of arrayFields) {
    out[k] = fromJson<string[]>(row[k] as string | null) ?? [];
  }
  return out;
};

checkInsRouter.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const items = await prisma.dailyCheckIn.findMany({
      where: {
        userId: req.userId!,
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: 'desc' },
      take: Number(req.query.limit ?? 365),
    });
    res.json(items.map(hydrate));
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

    const created = await prisma.dailyCheckIn.upsert({
      where: { userId_date: { userId: req.userId!, date } },
      update: {
        energy: body.energy,
        painIntensity: body.painIntensity,
        painLocations: toJson(body.painLocations),
        painTypes: toJson(body.painTypes),
        flareStatus: body.flareStatus,
        flareSeverity: body.flareSeverity,
        sleep: body.sleep,
        sleepHours: body.sleepHours,
        sleepDisrupted: body.sleepDisrupted ?? false,
        stress: body.stress,
        mood: body.mood,
        medsTaken: body.medsTaken,
        sideEffects: toJson(body.sideEffects),
        gutIssues: toJson(body.gutIssues),
        foodTriggers: toJson(body.foodTriggers),
        mobility: body.mobility,
        notes: body.notes,
      },
      create: {
        userId: req.userId!,
        date,
        energy: body.energy,
        painIntensity: body.painIntensity,
        painLocations: toJson(body.painLocations),
        painTypes: toJson(body.painTypes),
        flareStatus: body.flareStatus,
        flareSeverity: body.flareSeverity,
        sleep: body.sleep,
        sleepHours: body.sleepHours,
        sleepDisrupted: body.sleepDisrupted ?? false,
        stress: body.stress,
        mood: body.mood,
        medsTaken: body.medsTaken,
        sideEffects: toJson(body.sideEffects),
        gutIssues: toJson(body.gutIssues),
        foodTriggers: toJson(body.foodTriggers),
        mobility: body.mobility,
        notes: body.notes,
      },
    });
    res.status(201).json(hydrate(created as unknown as Record<string, unknown>));
  } catch (e) {
    next(e);
  }
});
