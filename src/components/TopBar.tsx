import type { User } from 'firebase/auth';
import { LOGO_ASSET_PATH } from '../data/seedData';
import type { AppView } from '../types/purecrest';

interface TopBarProps {
  brandName: string;
  user: User | null;
  activeView: AppView;
  onNavigateSection: (sectionId: string) => void;
  onOpenServices: () => void;
  onOpenPortal: () => void;
  onGoHome: () => void;
}

export function TopBar({
  brandName,
  user,
  activeView,
  onNavigateSection,
  onOpenServices,
  onOpenPortal,
  onGoHome,
}: TopBarProps) {
  const ctaLabel =
    user && (activeView === 'portal' || activeView === 'admin')
      ? 'Homepage'
      : 'Client Portal';

  const handlePrimaryClick = () => {
    if (user && (activeView === 'portal' || activeView === 'admin')) {
      onGoHome();
    } else {
      onOpenPortal();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#064E3B] text-white border-b border-emerald-950/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Transparent logo crest beside single-line brand wordmark */}
        <button
          type="button"
          onClick={onGoHome}
          aria-label={`${brandName} homepage`}
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A024] rounded-md py-1"
        >
          <img
            src={LOGO_ASSET_PATH}
            alt={`${brandName} logo`}
            referrerPolicy="no-referrer"
            className="h-8 w-auto object-contain shrink-0"
          />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            {brandName}
          </span>
        </button>

        {/* Zone 2: 5 clean single-line navigation links starting with Home */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-emerald-50/90">
          <button
            type="button"
            onClick={onGoHome}
            className={`hover:text-[#F6C453] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'public' ? 'text-[#F6C453]' : ''
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('properties')}
            className="hover:text-[#F6C453] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Listings
          </button>
          <button
            type="button"
            onClick={onOpenServices}
            className={`hover:text-[#F6C453] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'services' ? 'text-[#F6C453]' : ''
            }`}
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('journal')}
            className="hover:text-[#F6C453] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Journal
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('contact')}
            className="hover:text-[#F6C453] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handlePrimaryClick}
            className="px-4 py-2 text-sm font-semibold text-slate-950 bg-[#E5A024] hover:bg-[#F3B13B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#064E3B]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
