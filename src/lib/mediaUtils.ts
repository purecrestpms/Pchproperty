export function countWords(text: string): number {
  const cleaned = (text || '').trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export interface ProcessedImageResult {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
}

export async function processImageFile(
  file: File,
  options: {
    maxWidth?: number;
    quality?: number;
    targetMaxChars?: number;
    preserveTransparency?: boolean;
  } = {},
): Promise<ProcessedImageResult> {
  const initialMaxWidth = options.maxWidth ?? 1200;
  const initialQuality = options.quality ?? 0.8;
  const targetMaxChars = options.targetMaxChars ?? 190000;
  const preserveTransparency =
    options.preserveTransparency ??
    (file.type === 'image/png' ||
      file.type === 'image/webp' ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.webp'));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported or corrupted image format.'));
      img.onload = () => {
        const renderAt = (maxW: number, mime: string, q: number): ProcessedImageResult => {
          const scale = img.width > maxW ? maxW / img.width : 1;
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Browser canvas rendering context unavailable.');
          }
          if (mime === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(mime, q);
          return { dataUrl, mimeType: mime, width, height };
        };

        try {
          const widthSteps = [
            initialMaxWidth,
            Math.min(initialMaxWidth, 960),
            Math.min(initialMaxWidth, 720),
            Math.min(initialMaxWidth, 540),
            400,
          ].filter((w, i, arr) => arr.indexOf(w) === i);

          const qualitySteps = [initialQuality, 0.72, 0.6, 0.5, 0.4];

          // Preserve transparency via WebP (or PNG for small logos) when requested
          if (preserveTransparency) {
            for (const maxW of widthSteps) {
              const pngTry = renderAt(maxW, 'image/png', 1);
              if (pngTry.dataUrl.length <= targetMaxChars) {
                resolve(pngTry);
                return;
              }
              for (const q of qualitySteps) {
                const webpTry = renderAt(maxW, 'image/webp', q);
                if (
                  webpTry.dataUrl.startsWith('data:image/webp') &&
                  webpTry.dataUrl.length <= targetMaxChars
                ) {
                  resolve(webpTry);
                  return;
                }
              }
            }
          }

          // Standard progressive WebP / JPEG compression strictly bounded under targetMaxChars
          for (const maxW of widthSteps) {
            for (const q of qualitySteps) {
              const jpegTry = renderAt(maxW, 'image/jpeg', q);
              if (jpegTry.dataUrl.length <= targetMaxChars) {
                resolve(jpegTry);
                return;
              }
            }
          }

          // Final ultra-compact pass guaranteeing Firestore field compliance
          const fallback = renderAt(360, 'image/jpeg', 0.38);
          if (fallback.dataUrl.length > 335000) {
            reject(
              new Error(
                'Image file could not be compressed under the database storage limit. Please choose a smaller image.',
              ),
            );
            return;
          }
          resolve(fallback);
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to process uploaded image.'));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1200,
  quality = 0.8,
  preserveTransparency = false,
): Promise<string> {
  const result = await processImageFile(file, {
    maxWidth,
    quality,
    targetMaxChars: 190000,
    preserveTransparency,
  });
  return result.dataUrl;
}

export async function readSmallVideoFileToDataUrl(file: File): Promise<string> {
  const maxBytes = 480 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      'Direct video import supports clips up to 480 KB for database storage. For full property tours, paste a YouTube, Vimeo, or MP4 URL instead.',
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read video file.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export type ParsedVideo =
  | { kind: 'iframe'; src: string }
  | { kind: 'video'; src: string }
  | null;

export function parseVideoEmbed(rawUrl: string): ParsedVideo {
  const url = (rawUrl || '').trim();
  if (!url) return null;

  if (url.startsWith('data:video/')) {
    return { kind: 'video', src: url };
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        return { kind: 'iframe', src: url };
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };
      }
      const v = parsed.searchParams.get('v');
      if (v) return { kind: 'iframe', src: `https://www.youtube.com/embed/${v}` };
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '').split('/')[0];
      if (id) return { kind: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.replace('/', '').split('/')[0];
      if (id && /^\d+$/.test(id)) {
        return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` };
      }
    }

    if (host === 'player.vimeo.com') {
      return { kind: 'iframe', src: url };
    }

    return { kind: 'video', src: url };
  } catch {
    return null;
  }
}

export function formatBlogDate(
  publishedDate?: string,
  createdAt?: { seconds?: number } | Date | null,
): string {
  if (publishedDate && publishedDate.trim()) {
    const parsed = new Date(`${publishedDate.trim()}T12:00:00Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  if (createdAt && typeof createdAt === 'object') {
    if ('seconds' in createdAt && typeof createdAt.seconds === 'number') {
      return new Date(createdAt.seconds * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (createdAt instanceof Date && !Number.isNaN(createdAt.getTime())) {
      return createdAt.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  return 'November 16, 2026';
}

export function buildSocialShareUrls(post: { title: string; slug: string }) {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.purecrest.ng';
  const shareUrl = `${origin}/journal/${encodeURIComponent(post.slug)}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const whatsappText = encodeURIComponent(`${post.title} — ${shareUrl}`);

  return {
    shareUrl,
    whatsapp: `https://wa.me/?text=${whatsappText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}
