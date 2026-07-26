import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const medicationsRouter = Router();
medicationsRouter.use(requireAuth);

// Optional OCR provenance attached when a prescription is created from a scan.
const ocrProvenanceSchema = z.object({
  rawText: z.string().default(''),
  confidence: z.number().nullable().optional(),
  documentType: z.string().optional(), // defaults to "medication"
  parsedData: z.any().optional(),       // extracted fields { medication_name, dosage, ... }
  matchCandidates: z.any().optional(),  // top matches [{ name, generic, category, score }]
  confirmedMatch: z.any().optional(),   // the chosen match
});

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
  // OCR-derived structured fields (optional)
  genericName: z.string().nullable().optional(),
  drugClass: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  prescribedBy: z.string().nullable().optional(),
  // OCR provenance — when present, the raw scan is stored as an OcrDocument
  // and linked to this medication.
  ocr: ocrProvenanceSchema.optional(),
});

medicationsRouter.get('/', async (req, res, next) => {
  try {
    const meds = sb(
      await supabase
        .from('Medication')
        .select()
        .eq('userId', req.userId!)
        .eq('active', true)
        .order('createdAt', { ascending: false })
    );
    res.json(meds);
  } catch (e) {
    next(e);
  }
});

medicationsRouter.post('/', async (req, res, next) => {
  try {
    const body = medSchema.parse(req.body);

    // If this prescription came from an OCR scan, store the raw scan details
    // first as an OcrDocument (the user's "taken OCR details"), then link it.
    let ocrDocumentId: string | null = null;
    if (body.ocr) {
      const ocrId = crypto.randomUUID();
      const ocrDoc = sb(
        await supabase
          .from('OcrDocument')
          .insert({
            id: ocrId,
            userId: req.userId!,
            documentType: body.ocr.documentType ?? 'medication',
            rawText: body.ocr.rawText ?? '',
            confidence: body.ocr.confidence ?? null,
            parsedData: body.ocr.parsedData ?? null,
            matchCandidates: body.ocr.matchCandidates ?? null,
            confirmedMatch: body.ocr.confirmedMatch ?? null,
            capturedAt: new Date().toISOString(),
          })
          .select('id')
          .single()
      ) as { id: string };
      ocrDocumentId = ocrDoc.id;
    }

    const baseRow: Record<string, unknown> = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      name: body.name,
      dosage: body.dosage,
      frequency: body.frequency,
      timesPerDay: body.timesPerDay,
      scheduleTimes: body.scheduleTimes,
      startDate: new Date(body.startDate).toISOString(),
      endDate: body.endDate ? new Date(body.endDate).toISOString() : null,
      color: body.color ?? '#7293BB',
      notes: body.notes ?? null,
      active: true,
      genericName: body.genericName ?? null,
      drugClass: body.drugClass ?? null,
      category: body.category ?? null,
      prescribedBy: body.prescribedBy ?? null,
    };

    // Provenance columns (source, ocrDocumentId) may not be migrated yet.
    // Try with them; if the DB reports the column is missing, retry without.
    let result = await supabase
      .from('Medication')
      .insert({ ...baseRow, source: ocrDocumentId ? 'ocr' : 'manual', ocrDocumentId })
      .select()
      .single();

    if (result.error) {
      const msg = result.error.message ?? '';
      const missingProvenanceColumn =
        (msg.includes('ocrDocumentId') || msg.includes('source')) &&
        /column|schema cache/i.test(msg);
      if (missingProvenanceColumn) {
        result = await supabase.from('Medication').insert(baseRow).select().single();
      }
    }

    const created = sb(result);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

medicationsRouter.get('/:id/doses', async (req, res, next) => {
  try {
    const doses = sb(
      await supabase
        .from('MedicationDose')
        .select()
        .eq('userId', req.userId!)
        .eq('medicationId', req.params.id)
        .order('scheduledAt', { ascending: false })
        .limit(90)
    );
    res.json(doses);
  } catch (e) {
    next(e);
  }
});

medicationsRouter.post('/:id/doses/:doseId/taken', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('MedicationDose')
      .update({ takenAt: new Date().toISOString(), skipped: false })
      .eq('id', req.params.doseId)
      .eq('medicationId', req.params.id)
      .eq('userId', req.userId!)
      .select();

    if (error) return next(error);
    if (!data || data.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

medicationsRouter.post('/:id/doses/:doseId/skip', async (req, res, next) => {
  try {
    await supabase
      .from('MedicationDose')
      .update({ skipped: true, takenAt: null })
      .eq('id', req.params.doseId)
      .eq('medicationId', req.params.id)
      .eq('userId', req.userId!);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
