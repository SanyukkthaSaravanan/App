import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { analyzeText } from '../services/nlp.service';

export const nlpRouter = Router();
nlpRouter.use(requireAuth);

const schema = z.object({ text: z.string().min(1).max(4000) });

/**
 * POST /api/nlp/analyze
 * Body: { text: string }
 * Returns structured NLP extraction: body parts, symptoms, severity, meds, foods, sentiment, intent
 */
nlpRouter.post('/analyze', (req, res, next) => {
  try {
    const { text } = schema.parse(req.body);
    const result = analyzeText(text);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
