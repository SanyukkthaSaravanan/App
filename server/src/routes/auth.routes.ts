import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb, sbMaybe } from '../lib/supabase';
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

    // Check for existing user by email or username
    const existingByEmail = sbMaybe(
      await supabase.from('User').select('id').eq('email', body.email).single()
    );
    const existingByUsername = sbMaybe(
      await supabase.from('User').select('id').eq('username', body.username).single()
    );
    if (existingByEmail) {
      throw new HttpError(409, 'An account with this email already exists. Try logging in instead.');
    }
    if (existingByUsername) {
      throw new HttpError(409, 'This username is already taken. Please choose another.');
    }

    const user = sb(
      await supabase
        .from('User')
        .insert({
          id: crypto.randomUUID(),
          email: body.email,
          username: body.username,
          passwordHash: await hashPassword(body.password),
          firstName: body.firstName ?? null,
          lastName: body.lastName ?? null,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
    );

    const u = user as any;
    const token = signToken({ userId: u.id, email: u.email });
    res.status(201).json({
      token,
      user: { id: u.id, email: u.email, username: u.username },
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

    const query = body.email
      ? supabase.from('User').select().eq('email', body.email).single()
      : supabase.from('User').select().eq('username', body.username!).single();

    const user = sbMaybe(await query);
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const token = signToken({ userId: user.id, email: user.email });

    // Persist session
    await supabase.from('Session').insert({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

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
    const baseCols =
      'id, email, username, firstName, lastName, dateOfBirth, timezone, avatarUrl, createdAt';
    const fullCols =
      baseCols + ', onboardingCompleted, condition, trackedFactors, knownTriggers';

    // Onboarding columns may not be migrated yet — fall back to base columns.
    let result = await supabase.from('User').select(fullCols).eq('id', req.userId!).single();
    if (result.error && /column|schema cache/i.test(result.error.message ?? '')) {
      result = await supabase.from('User').select(baseCols).eq('id', req.userId!).single();
    }
    const user = sbMaybe(result) as any;
    if (!user) throw new HttpError(404, 'User not found');
    res.json({
      user: { ...user, onboardingCompleted: user.onboardingCompleted ?? false },
    });
  } catch (e) {
    next(e);
  }
});

const onboardingSchema = z.object({
  condition: z.string().optional(),
  trackedFactors: z.array(z.string()).optional(),
  knownTriggers: z.array(z.string()).optional(),
  consent: z.boolean(),
});

/**
 * POST /api/auth/onboarding — saves the first-login questionnaire.
 * Requires consent. Resilient to the onboarding columns not being migrated yet.
 */
authRouter.post('/onboarding', requireAuth, async (req, res, next) => {
  try {
    const body = onboardingSchema.parse(req.body);
    if (!body.consent) throw new HttpError(400, 'You must accept the privacy policy to continue.');

    const result = await supabase
      .from('User')
      .update({
        onboardingCompleted: true,
        condition: body.condition ?? null,
        trackedFactors: body.trackedFactors ?? null,
        knownTriggers: body.knownTriggers ?? null,
        consentAcceptedAt: new Date().toISOString(),
      })
      .eq('id', req.userId!)
      .select('id')
      .single();

    if (result.error && /column|schema cache/i.test(result.error.message ?? '')) {
      // Columns not migrated yet — accept so the user isn't blocked; the
      // frontend keeps a local backstop so onboarding doesn't repeat.
      return res.json({ ok: true, persisted: false });
    }
    sb(result);
    res.json({ ok: true, persisted: true });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const header = req.header('authorization') ?? req.header('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token) {
      await supabase.from('Session').delete().eq('token', token);
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
