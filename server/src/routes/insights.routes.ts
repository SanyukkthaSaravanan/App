import { Router } from 'express';
import { prisma, fromJson } from '../db';
import { requireAuth } from '../middleware/auth';
import { computeInsights } from '../services/insights.service';

export const insightsRouter = Router();
insightsRouter.use(requireAuth);

insightsRouter.get('/', async (req, res, next) => {
  try {
    const items = await prisma.insight.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(items.map((i) => ({ ...i, data: fromJson(i.data) })));
  } catch (e) {
    next(e);
  }
});

// Re-compute insights on demand (e.g. after new data lands)
insightsRouter.post('/refresh', async (req, res, next) => {
  try {
    const insights = await computeInsights(req.userId!);
    res.json(insights);
  } catch (e) {
    next(e);
  }
});
