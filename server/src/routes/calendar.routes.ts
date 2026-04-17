import { Router } from 'express';
import { prisma, fromJson } from '../db';
import { requireAuth } from '../middleware/auth';

export const calendarRouter = Router();
calendarRouter.use(requireAuth);

/**
 * Returns a unified feed of everything that happened on the calendar:
 *   - symptom logs
 *   - daily check-ins
 *   - medication doses
 *   - flare events
 *   - medical appointments
 *
 * Clients can filter by ?from=<iso>&to=<iso>
 */
calendarRouter.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const userId = req.userId!;
    const dateFilter = from || to ? {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    } : undefined;

    const [symptoms, checkIns, doses, flares, records] = await Promise.all([
      prisma.symptom.findMany({
        where: { userId, ...(dateFilter ? { loggedAt: dateFilter } : {}) },
      }),
      prisma.dailyCheckIn.findMany({
        where: { userId, ...(dateFilter ? { date: dateFilter } : {}) },
      }),
      prisma.medicationDose.findMany({
        where: { userId, ...(dateFilter ? { scheduledAt: dateFilter } : {}) },
        include: { medication: { select: { name: true, color: true } } },
      }),
      prisma.flareEvent.findMany({
        where: { userId, ...(dateFilter ? { startedAt: dateFilter } : {}) },
      }),
      prisma.medicalRecord.findMany({
        where: { userId, ...(dateFilter ? { date: dateFilter } : {}) },
      }),
    ]);

    const events = [
      ...symptoms.map((s) => ({
        id: s.id,
        type: 'symptom' as const,
        date: s.loggedAt,
        title: s.bodyPartName ?? (fromJson<string[]>(s.symptoms) ?? [])[0] ?? 'Symptom',
        severity: s.severity,
        payload: {
          bodyPart: s.bodyPart,
          symptoms: fromJson<string[]>(s.symptoms) ?? [],
          notes: s.notes,
        },
      })),
      ...checkIns.map((c) => ({
        id: c.id,
        type: 'checkin' as const,
        date: c.date,
        title: 'Daily check-in',
        severity: c.painIntensity === 'severe' ? 8 : c.painIntensity === 'moderate' ? 5 : 2,
        payload: { energy: c.energy, mood: c.mood, flareStatus: c.flareStatus },
      })),
      ...doses.map((d) => ({
        id: d.id,
        type: 'medication' as const,
        date: d.scheduledAt,
        title: d.medication.name,
        severity: 0,
        payload: { taken: !!d.takenAt, skipped: d.skipped, color: d.medication.color },
      })),
      ...flares.map((f) => ({
        id: f.id,
        type: 'flare' as const,
        date: f.startedAt,
        endDate: f.endedAt,
        title: 'Flare',
        severity: f.severity,
        payload: { resolved: f.resolved, triggers: fromJson<string[]>(f.triggers) ?? [] },
      })),
      ...records.map((r) => ({
        id: r.id,
        type: 'appointment' as const,
        date: r.date,
        title: r.title,
        severity: 0,
        payload: { providerName: r.providerName, recordType: r.type },
      })),
    ].sort((a, b) => +new Date(a.date) - +new Date(b.date));

    res.json(events);
  } catch (e) {
    next(e);
  }
});
