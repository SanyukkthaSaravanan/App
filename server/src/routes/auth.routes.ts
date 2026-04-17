import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/token';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../middleware/error';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) throw new HttpError(409, 'Email or username already in use');

    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash: await hashPassword(body.password),
        firstName: body.firstName,
        lastName: body.lastName,
      },
    });
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    if (!body.email && !body.username) {
      throw new HttpError(400, 'Email or username required');
    }
    const user = await prisma.user.findFirst({
      where: body.email ? { email: body.email } : { username: body.username },
    });
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        timezone: true,
        conditions: true,
        allergies: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ user });
  } catch (e) {
    next(e);
  }
});
