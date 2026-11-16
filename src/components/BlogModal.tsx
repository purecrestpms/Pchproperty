import {
  BookOpen,
  Calendar,
  Check,
  Copy,
  Film,
  Share2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { buildSocialShareUrls, formatBlogDate, parseVideoEmbed } from '../lib/mediaUtils';
import type { BlogPost } from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface BlogModalProps {
  post: BlogPost;
  onClose: () => void;
}

export function BlogModal({ post, onClose }: BlogModalProps) {
  const allImages = [
    post.coverImageUrl,
    ...(post.galleryImages || []).filter((img) => img && img !== post.coverImageUrl),
  ].filter(Boolean);

  const [activeImage, setActiveImage] = useState(allImages[0] || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const parsedVideo = parseVideoEmbed(post.videoUrl || '');
  const formattedDate = formatBlogDate(post.publishedDate, post.createdAt);
  const shareUrls = buildSocialShareUrls(post);

  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrls.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrls.shareUrl,
        });
      } catch {
        // Ignore dismissed share sheet
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-modal-title"
    >
      <article className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full overflow-hidden my-auto shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#064E3B] text-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <BookOpen className="w-4 h-4 text-[#F6C453]" />
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>PureCrest Journal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-6">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#155E95]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <time dateTime={post.publishedDate || undefined}>{formattedDate}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{post.category}</span>
            </div>
            <h2
              id="blog-modal-title"
              className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {post.title}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">{post.excerpt}</p>

            {/* Social Share Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
                <Share2 className="w-3.5 h-3.5 text-[#064E3B]" />
                <span>Share:</span>
              </span>
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 rounded-md transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md transition-colors"
              >
                X / Twitter
              </a>
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium bg-sky-50 hover:bg-sky-100 text-[#155E95] border border-sky-200 rounded-md transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md transition-colors"
              >
                Facebook
              </a>
              <button
                type="button"
                onClick={() => void handleCopyShareLink()}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
                  onClick={() => void handleNativeShare()}
                  className="px-2.5 py-1 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-md cursor-pointer"
                >
                  More
                </button>
              )}
            </div>
          </header>

          {activeImage && (
            <div className="space-y-3">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <ResilientImage
                  src={activeImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  fallbackLabel={post.title}
                />
              </div>

              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={`${img.slice(0, 32)}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`h-14 w-20 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-opacity ${
                        activeImage === img
                          ? 'border-[#155E95] ring-2 ring-[#155E95]/40'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <ResilientImage
                        src={img}
                        alt={`${post.title} gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {parsedVideo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Film className="w-4 h-4 text-[#155E95]" />
                <span>Article Video Briefing</span>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                {parsedVideo.kind === 'iframe' ? (
                  <iframe
                    src={parsedVideo.src}
                    title={post.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={parsedVideo.src} controls className="w-full h-full object-contain" />
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-2 border-t border-slate-200">
            {paragraphs.map((para, idx) => {
              const isHeading = para.length < 95 && !para.endsWith('.') && !para.endsWith(':');
              if (isHeading) {
                return (
                  <h3
                    key={idx}
                    className="font-display text-lg sm:text-xl font-bold text-slate-900 pt-4"
                  >
                    {para}
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-base text-slate-700 leading-[1.75]">
                  {para}
                </p>
              );
            })}
          </div>
        </div>
      </article>
    </div>
  );
}
