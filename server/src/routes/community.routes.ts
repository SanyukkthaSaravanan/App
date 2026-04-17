import { Router } from 'express';
import { z } from 'zod';
import { prisma, toJson, fromJson } from '../db';
import { requireAuth } from '../middleware/auth';

export const communityRouter = Router();
communityRouter.use(requireAuth);

const postSchema = z.object({
  content: z.string().min(1).max(5000),
  tags: z.array(z.string()).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

communityRouter.get('/posts', async (_req, res, next) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { username: true, firstName: true, avatarUrl: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { username: true, firstName: true, avatarUrl: true } },
          },
        },
      },
    });
    res.json(posts.map((p) => ({ ...p, tags: fromJson<string[]>(p.tags) ?? [] })));
  } catch (e) {
    next(e);
  }
});

communityRouter.post('/posts', async (req, res, next) => {
  try {
    const body = postSchema.parse(req.body);
    const created = await prisma.communityPost.create({
      data: {
        userId: req.userId!,
        content: body.content,
        tags: toJson(body.tags ?? []),
      },
    });
    res.status(201).json({ ...created, tags: body.tags ?? [] });
  } catch (e) {
    next(e);
  }
});

communityRouter.post('/posts/:id/like', async (req, res, next) => {
  try {
    const updated = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } },
    });
    res.json({ likes: updated.likes });
  } catch (e) {
    next(e);
  }
});

communityRouter.post('/posts/:id/comments', async (req, res, next) => {
  try {
    const body = commentSchema.parse(req.body);
    const created = await prisma.communityComment.create({
      data: {
        postId: req.params.id,
        userId: req.userId!,
        content: body.content,
      },
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});
