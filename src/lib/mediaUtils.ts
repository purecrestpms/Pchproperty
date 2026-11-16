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

export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1200,
  quality = 0.78,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        let dataUrl = isPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length > 260000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
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
  const shareUrl = `${origin}/#journal-${encodeURIComponent(post.slug)}`;
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

