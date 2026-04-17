import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
import { requireAuth } from '../middleware/auth';

export const medicalRecordsRouter = Router();
medicalRecordsRouter.use(requireAuth);

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(['lab', 'imaging', 'visit', 'prescription', 'other']),
  providerName: z.string().optional(),
  date: z.string().datetime(),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

medicalRecordsRouter.get('/', async (req, res, next) => {
  try {
    const items = await prisma.medicalRecord.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
    });
    res.json(items.map((r) => ({ ...r, tags: fromJson<string[]>(r.tags) ?? [] })));
  } catch (e) {
    next(e);
  }
});

medicalRecordsRouter.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const created = await prisma.medicalRecord.create({
      data: {
        userId: req.userId!,
        title: body.title,
        type: body.type,
        providerName: body.providerName,
        date: new Date(body.date),
        fileUrl: body.fileUrl,
        notes: body.notes,
        tags: toJson(body.tags ?? []),
      },
    });
    res.status(201).json({ ...created, tags: body.tags ?? [] });
  } catch (e) {
    next(e);
  }
});
