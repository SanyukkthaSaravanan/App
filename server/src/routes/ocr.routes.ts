import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { supabase, sb } from '../lib/supabase';
import { scanMedicationImage } from '../services/ocr.service';
import { runLiveScan, isScanInProgress, cancelLiveScan } from '../services/ocr-live.service';

export const ocrRouter = Router();
ocrRouter.use(requireAuth);

/**
 * GET /api/ocr/documents — the logged-in user's stored OCR scans
 * (the "taken OCR details"), newest first.
 */
ocrRouter.get('/documents', async (req, res, next) => {
  try {
    const docs = sb(
      await supabase
        .from('OcrDocument')
        .select()
        .eq('userId', req.userId!)
        .order('capturedAt', { ascending: false })
        .limit(100)
    );
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

const schema = z.object({
  image: z.string().min(100), // base64-encoded image
});

/**
 * POST /api/ocr/medication
 * Body: { image: string }  — base64-encoded JPEG/PNG
 * Returns: { rawText, matches: [{ name, generic, category, score, dose }] }
 */
ocrRouter.post('/medication', async (req, res, next) => {
  try {
    const { image } = schema.parse(req.body);
    const result = await scanMedicationImage(image);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

const liveScanSchema = z.object({
  type: z.enum(['box', 'bottle']),
  camera: z.union([z.string(), z.number()]).optional(),
  seconds: z.number().min(1).max(15).optional(),
  online: z.boolean().optional(),
});

/**
 * POST /api/ocr/scan-live
 * Body: { type: 'box' | 'bottle', camera?, seconds?, online? }
 *
 * Launches the desktop Python scanner (scan_bridge.py): opens the physical
 * camera + OpenCV window, captures the label (single shot for box, rotate-to-
 * scan for bottle), runs OCR + matching, and returns the structured result:
 *   { ok, type, camera, fields, matches, ocr_raw, warning }
 *
 * Long-running (the user interacts with the camera window). Single concurrent
 * scan only.
 */
ocrRouter.post('/scan-live', async (req, res, next) => {
  try {
    const body = liveScanSchema.parse(req.body);
    const result = await runLiveScan(body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/ocr/scan-status — whether a live scan is currently running.
 */
ocrRouter.get('/scan-status', (_req, res) => {
  res.json({ inProgress: isScanInProgress() });
});

/**
 * POST /api/ocr/scan-cancel — abort the in-flight scan (kills the scanner
 * window/process). Returns { cancelled: boolean }.
 */
ocrRouter.post('/scan-cancel', (_req, res) => {
  const cancelled = cancelLiveScan();
  res.json({ cancelled });
});
