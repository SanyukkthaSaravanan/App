import { Router } from 'express';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { computeInsights } from '../services/insights.service';

export const insightsRouter = Router();
insightsRouter.use(requireAuth);

insightsRouter.get('/', async (req, res, next) => {
  try {
    const items = sb(
      await supabase
        .from('Insight')
        .select()
        .eq('userId', req.userId!)
        .order('createdAt', { ascending: false })
        .limit(50)
    );
    res.json(items);
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
