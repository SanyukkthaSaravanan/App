import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
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
    const items = await prisma.dietLog.findMany({
      where: { userId: req.userId! },
      orderBy: { ateAt: 'desc' },
      take: Number(req.query.limit ?? 200),
    });
    res.json(
      items.map((d) => ({
        ...d,
        foods: fromJson<string[]>(d.foods) ?? [],
        triggers: fromJson<string[]>(d.triggers) ?? [],
      }))
    );
  } catch (e) {
    next(e);
  }
});

dietRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const created = await prisma.dietLog.create({
      data: {
        userId: req.userId!,
        mealType: body.mealType,
        foods: toJson(body.foods)!,
        triggers: toJson(body.triggers ?? []),
        calories: body.calories,
        notes: body.notes,
        ateAt: body.ateAt ? new Date(body.ateAt) : new Date(),
      },
    });
    res.status(201).json({ ...created, foods: body.foods, triggers: body.triggers ?? [] });
  } catch (e) {
    next(e);
  }
});
