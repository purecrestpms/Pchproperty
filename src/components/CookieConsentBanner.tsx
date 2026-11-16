import { Cookie, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { LegalDocType } from '../types/purecrest';

export interface CookieConsentPreferences {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
}

interface CookieConsentBannerProps {
  visible: boolean;
  initialPrefs: CookieConsentPreferences;
  onSavePreferences: (prefs: CookieConsentPreferences) => void;
  onOpenLegal: (doc: LegalDocType) => void;
  onDismiss: () => void;
}

export function CookieConsentBanner({
  visible,
  initialPrefs,
  onSavePreferences,
  onOpenLegal,
  onDismiss,
}: CookieConsentBannerProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState(initialPrefs.preferences);
  const [analytics, setAnalytics] = useState(initialPrefs.analytics);

  if (!visible) return null;

  const commit = (prefsVal: boolean, analyticsVal: boolean) => {
    onSavePreferences({
      essential: true,
      preferences: prefsVal,
      analytics: analyticsVal,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-lg z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-[#064E3B] text-[#F6C453] shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Cookies &amp; Privacy Preferences
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              PureCrest uses essential session cookies for secure Google Sign-In and bookings, plus optional preference settings. Read our{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="text-[#155E95] hover:underline font-medium cursor-pointer"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('cookies')}
                className="text-[#155E95] hover:underline font-medium cursor-pointer"
              >
                Cookie Policy
              </button>
              .
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close cookie banner"
          className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showCustomize && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900">Strictly Necessary</div>
              <div className="text-slate-500">Authentication, booking security, consent storage</div>
            </div>
            <span className="font-medium text-[#064E3B]">Always Active</span>
          </div>

          <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">Interface Preferences</div>
              <div className="text-slate-500">Remembers property category &amp; portal state</div>
            </div>
            <input
              type="checkbox"
              checked={preferences}
              onChange={(e) => setPreferences(e.target.checked)}
              className="w-4 h-4 accent-[#064E3B]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">Performance Diagnostics</div>
              <div className="text-slate-500">Helps verify asset reliability and page responsiveness</div>
            </div>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="w-4 h-4 accent-[#064E3B]"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowCustomize((prev) => !prev)}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showCustomize ? 'Hide Options' : 'Manage Cookies'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => commit(false, false)}
            className="px-3.5 py-1.5 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer"
          >
            Essential Only
          </button>
          {showCustomize ? (
            <button
              type="button"
              onClick={() => commit(preferences, analytics)}
              className="px-4 py-1.5 text-xs font-semibold bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg cursor-pointer"
            >
              Save Choices
            </button>
          ) : (
            <button
              type="button"
              onClick={() => commit(true, true)}
              className="px-4 py-1.5 text-xs font-semibold bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg cursor-pointer"
            >
              Accept All
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
