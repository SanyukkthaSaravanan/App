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

// Deterministic dose id so toggling a specific med/day/time is idempotent.
const doseId = (medId: string, date: string, timeIndex: number) =>
  `${medId}:${date}:${timeIndex}`;

/**
 * GET /api/medications/today?date=YYYY-MM-DD  (user's local date)
 * Returns per-medication taken flags for today + an aggregate { taken, total }.
 */
medicationsRouter.get('/today', async (req, res, next) => {
  try {
    const date = String(req.query.date ?? new Date().toISOString().slice(0, 10));
    const meds = sb(
      await supabase
        .from('Medication')
        .select()
        .eq('userId', req.userId!)
        .eq('active', true)
        .order('createdAt', { ascending: false })
    ) as any[];

    // Expected dose ids for every scheduled time today
    const expected: string[] = [];
    for (const m of meds) {
      const times: string[] = Array.isArray(m.scheduleTimes) ? m.scheduleTimes : [];
      const count = times.length || 1;
      for (let i = 0; i < count; i++) expected.push(doseId(m.id, date, i));
    }

    const takenSet = new Set<string>();
    if (expected.length) {
      const doses = sb(
        await supabase
          .from('MedicationDose')
          .select('id, takenAt')
          .eq('userId', req.userId!)
          .in('id', expected)
      ) as any[];
      for (const d of doses) if (d.takenAt) takenSet.add(d.id);
    }

    let taken = 0;
    let total = 0;
    const detail = meds.map((m) => {
      const times: string[] = Array.isArray(m.scheduleTimes) ? m.scheduleTimes : [];
      const count = times.length || 1;
      const takenFlags: boolean[] = [];
      for (let i = 0; i < count; i++) {
        const t = takenSet.has(doseId(m.id, date, i));
        takenFlags.push(t);
        total += 1;
        if (t) taken += 1;
      }
      return { id: m.id, name: m.name, scheduleTimes: times, takenFlags };
    });

    res.json({ date, taken, total, meds: detail });
  } catch (e) {
    next(e);
  }
});

const toggleDoseSchema = z.object({
  timeIndex: z.number().int().min(0).max(23),
  taken: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * POST /api/medications/:id/dose
 * Body: { timeIndex, taken, date? }  — records/clears a taken dose for today.
 */
medicationsRouter.post('/:id/dose', async (req, res, next) => {
  try {
    const body = toggleDoseSchema.parse(req.body);
    const date = body.date ?? new Date().toISOString().slice(0, 10);
    const id = doseId(req.params.id, date, body.timeIndex);
    sb(
      await supabase
        .from('MedicationDose')
        .upsert(
          {
            id,
            userId: req.userId!,
            medicationId: req.params.id,
            scheduledAt: new Date(`${date}T00:00:00.000Z`).toISOString(),
            takenAt: body.taken ? new Date().toISOString() : null,
            skipped: false,
          },
          { onConflict: 'id' }
        )
        .select()
        .single()
    );
    res.json({ ok: true });
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
