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
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length > 260000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.6);
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
