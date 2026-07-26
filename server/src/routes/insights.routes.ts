import { Router } from 'express';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { computeInsights } from '../services/insights.service';
import { analyzeUserHealth } from '../services/insights-ai.service';

export const insightsRouter = Router();
insightsRouter.use(requireAuth);

/**
 * GET /api/insights/analyze
 * AI analysis of the user's logged data → { trends, recommendations,
 * triggerFoods, summary, usedAI, hasData }. Drives the Insights page cards,
 * recommendations, and the diet-page trigger foods.
 */
insightsRouter.get('/analyze', async (req, res, next) => {
  try {
    const result = await analyzeUserHealth(req.userId!);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

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
