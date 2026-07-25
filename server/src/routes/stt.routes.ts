import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { transcribeAudio } from '../services/stt.service';

export const sttRouter = Router();
sttRouter.use(requireAuth);

// Store audio in memory (files are small, <5 MB per recording)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

/**
 * POST /api/stt/transcribe
 * Multipart form-data: field "audio" (audio file)
 * Returns { transcript, language, durationSeconds }
 */
sttRouter.post(
  '/transcribe',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No audio file uploaded. Use field name "audio".' });
        return;
      }

      const { buffer, mimetype } = req.file;
      const result = await transcribeAudio(buffer, mimetype);
      res.json(result);
    } catch (err: any) {
      // Surface missing API key as a 503 so the frontend can fall back gracefully
      if (err.message?.includes('OPENAI_API_KEY')) {
        res.status(503).json({ error: 'STT service unavailable (no API key configured).' });
        return;
      }
      next(err);
    }
  }
);
