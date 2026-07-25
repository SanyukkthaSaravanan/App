import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { analyzeText } from '../services/nlp.service';
import { parseLog } from '../services/log-parser.service';

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

/**
 * POST /api/nlp/parse-log
 * Body: { text: string }
 * Returns structured, category-routed data for logging:
 *   { diet, symptoms[], medications[], mood, summary, transcript, usedAI }
 * Uses OpenAI when OPENAI_API_KEY is set, otherwise a dictionary fallback.
 */
nlpRouter.post('/parse-log', async (req, res, next) => {
  try {
    const { text } = schema.parse(req.body);
    const result = await parseLog(text);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
