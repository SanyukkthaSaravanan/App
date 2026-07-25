import { Router } from 'express';
import { z } from 'zod';
import { supabase, sb } from '../lib/supabase';
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
    // Fetch posts
    const posts = sb(
      await supabase
        .from('CommunityPost')
        .select('*, user:User(username, firstName, avatarUrl)')
        .order('createdAt', { ascending: false })
        .limit(50)
    );

    // Fetch comments for those posts and attach user info
    const postIds = posts.map((p: any) => p.id);
    const comments = postIds.length
      ? sb(
          await supabase
            .from('CommunityComment')
            .select('*, user:User(username, firstName, avatarUrl)')
            .in('postId', postIds)
            .order('createdAt', { ascending: true })
        )
      : [];

    // Group comments by postId
    const commentsByPost: Record<string, any[]> = {};
    for (const c of comments) {
      if (!commentsByPost[c.postId]) commentsByPost[c.postId] = [];
      commentsByPost[c.postId].push(c);
    }

    res.json(
      posts.map((p: any) => ({
        ...p,
        comments: commentsByPost[p.id] ?? [],
      }))
    );
  } catch (e) {
    next(e);
  }
});

communityRouter.post('/posts', async (req, res, next) => {
  try {
    const body = postSchema.parse(req.body);
    const created = sb(
      await supabase
        .from('CommunityPost')
        .insert({
          id: crypto.randomUUID(),
          userId: req.userId!,
          content: body.content,
          tags: body.tags ?? [],
          likes: 0,
        })
        .select()
        .single()
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

communityRouter.post('/posts/:id/like', async (req, res, next) => {
  try {
    // Fetch current likes then increment
    const { data: post, error } = await supabase
      .from('CommunityPost')
      .select('likes')
      .eq('id', req.params.id)
      .single();
    if (error || !post) return res.status(404).json({ error: 'Post not found' });

    const updated = sb(
      await supabase
        .from('CommunityPost')
        .update({ likes: (post.likes ?? 0) + 1 })
        .eq('id', req.params.id)
        .select('likes')
        .single()
    );
    res.json({ likes: (updated as any).likes });
  } catch (e) {
    next(e);
  }
});

communityRouter.post('/posts/:id/comments', async (req, res, next) => {
  try {
    const body = commentSchema.parse(req.body);
    const created = sb(
      await supabase
        .from('CommunityComment')
        .insert({
          id: crypto.randomUUID(),
          postId: req.params.id,
          userId: req.userId!,
          content: body.content,
        })
        .select()
        .single()
    );
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});
