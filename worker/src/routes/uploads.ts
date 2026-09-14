/**
 * Media uploads backed by Cloudflare R2.
 * Endpoints keep the legacy `/api/uploads/cloudinary` paths so the existing
 * admin UI (MediaPicker / AdminMedia) works unchanged.
 */
import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAdmin } from '../middleware';

type App = Hono<{ Bindings: Env }>;

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  pdf: 'application/pdf',
};

const safeName = (name: string): string => {
  const ext = (name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 60) || 'file';
  return `${base}-${Date.now()}.${ext}`;
};

export const uploadRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.post('/cloudinary', requireAdmin, async (c) => {
    if (!c.env.MEDIA) return c.json({ message: 'Media storage (R2) is not configured' }, 503);
    const form = await c.req.formData().catch(() => null);
    const file = form?.get('file') as File | null;
    if (!file || typeof file === 'string') return c.json({ message: 'No file uploaded' }, 400);

    const key = safeName(file.name);
    await c.env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });
    return c.json({ url: `/api/uploads/${key}`, filename: key });
  });

  router.get('/cloudinary', requireAdmin, async (c) => {
    if (!c.env.MEDIA) return c.json([]);
    const listing = await c.env.MEDIA.list();
    const items = (listing.objects || [])
      .filter((o) => /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|mp3|pdf)$/i.test(o.key))
      .map((o) => ({
        id: o.key,
        url: `/api/uploads/${o.key}`,
        publicId: o.key,
        filename: o.key,
        createdAt: o.uploaded ? new Date(o.uploaded).toISOString() : new Date().toISOString(),
      }));
    return c.json(items);
  });

  router.delete('/cloudinary/:filename', requireAdmin, async (c) => {
    if (!c.env.MEDIA) return c.json({ message: 'Media storage (R2) is not configured' }, 503);
    await c.env.MEDIA.delete(c.req.param('filename') ?? '');
    return c.json({ message: 'Deleted' });
  });

  // Public media serving.
  router.get('/:key', async (c) => {
    if (!c.env.MEDIA) return c.json({ message: 'Media storage (R2) is not configured' }, 503);
    const key = c.req.param('key');
    if (key.includes('..') || key.includes('/')) return c.json({ message: 'Not found' }, 404);
    const object = await c.env.MEDIA.get(key);
    if (!object) return c.json({ message: 'Not found' }, 404);
    const ext = (key.split('.').pop() || '').toLowerCase();
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || MIME_BY_EXT[ext] || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag ?? '');
    return new Response(object.body, { headers });
  });

  return router;
};
