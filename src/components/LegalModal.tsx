import { Cookie, FileText, ShieldCheck, X } from 'lucide-react';
import type { LegalDocType } from '../types/purecrest';

interface LegalModalProps {
  activeDoc: LegalDocType;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  onChangeDoc: (doc: LegalDocType) => void;
  onOpenCookieSettings: () => void;
  onClose: () => void;
}

export function LegalModal({
  activeDoc,
  contactEmail,
  contactPhone,
  officeAddress,
  onChangeDoc,
  onOpenCookieSettings,
  onClose,
}: LegalModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full overflow-hidden my-auto shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-[#064E3B] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <ShieldCheck className="w-4 h-4 text-[#F6C453]" />
            <span>PureCrest Governance &amp; Data Compliance</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal policy modal"
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => onChangeDoc('privacy')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeDoc === 'privacy'
                ? 'border-[#155E95] text-[#155E95]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onChangeDoc('cookies')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeDoc === 'cookies'
                ? 'border-[#155E95] text-[#155E95]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cookie Policy
          </button>
          <button
            type="button"
            onClick={() => onChangeDoc('terms')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeDoc === 'terms'
                ? 'border-[#155E95] text-[#155E95]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Terms of Service
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed">
          {activeDoc === 'privacy' && (
            <>
              <div>
                <h2
                  id="legal-modal-title"
                  className="font-display text-2xl font-bold text-slate-900"
                >
                  Privacy Policy
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  PureCrest Hospitality &amp; Property Ltd · Effective Date: 2026
                </p>
              </div>

              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">1. Data Controller &amp; Scope</h3>
                  <p>
                    PureCrest Hospitality &amp; Property Ltd ({officeAddress}) respects your privacy
                    and processes personal data in accordance with the Nigeria Data Protection Act
                    (NDPA) and international privacy standards across www.purecrest.ng, our Client
                    Portal, and our shortlet reservation desks.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">2. Information We Collect</h3>
                  <p>
                    When you sign in with Google, submit a shortlet reservation or viewing request,
                    send a consultation inquiry, or submit a property listing for review, we collect
                    your full name, verified email address, phone number, organization name (if
                    provided), booking dates, and property details.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">3. How We Use Your Data</h3>
                  <p>
                    Your data is used strictly to confirm shortlet reservations, coordinate property
                    inspections, evaluate partner property listings, deliver hospitality virtual
                    support or OTA optimization proposals, and display your active bookings inside
                    your private Client Portal. We never sell client contact lists to third parties.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">4. Storage, Security &amp; Access</h3>
                  <p>
                    Authenticated client records are isolated per account in Cloud Firestore using
                    verified identity controls and role-based access rules. Only you and authorized
                    PureCrest administrators can view your bookings, saved residences, or inquiries.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">5. Your Rights &amp; Contact</h3>
                  <p>
                    You may request correction, export, or deletion of your account data at any
                    time by contacting {contactEmail} or calling {contactPhone}.
                  </p>
                </section>
              </div>
            </>
          )}

          {activeDoc === 'cookies' && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="legal-modal-title"
                    className="font-display text-2xl font-bold text-slate-900"
                  >
                    Cookie Policy
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Transparency regarding essential session cookies and browser preferences
                  </p>
                </div>
                <Cookie className="w-6 h-6 text-[#155E95] shrink-0" />
              </div>

              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">
                    1. Strictly Necessary Cookies &amp; Local Storage
                  </h3>
                  <p>
                    These items are essential for authentication state, Google Sign-In session
                    continuity, security token validation, and remembering your cookie consent
                    selection. They cannot be switched off without breaking portal sign-in.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">2. Preference Cookies</h3>
                  <p>
                    With your permission, PureCrest remembers non-sensitive interface preferences
                    such as recently viewed residences or active filter selections so returning to
                    the site feels seamless.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">3. Performance Analytics</h3>
                  <p>
                    Optional aggregated diagnostics help our team measure page loading speeds and
                    identify broken assets without profiling individual guests across external
                    websites.
                  </p>
                </section>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCookieSettings();
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                >
                  Update Cookie Preferences
                </button>
              </div>
            </>
          )}

          {activeDoc === 'terms' && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="legal-modal-title"
                    className="font-display text-2xl font-bold text-slate-900"
                  >
                    Terms of Service
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Bookings, Property Sales &amp; Leasing, and Partner Listing Submissions
                  </p>
                </div>
                <FileText className="w-6 h-6 text-[#155E95] shrink-0" />
              </div>

              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">1. Reservations &amp; Check-In</h3>
                  <p>
                    Shortlet bookings submitted through PureCrest represent verified reservation
                    requests subject to suite availability confirmation, valid guest identification,
                    and adherence to residence occupancy limits.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">2. Property Submissions</h3>
                  <p>
                    Owners and agents submitting properties via the Submit Listing workflow confirm
                    they hold legal authority to market or nominate the property for management,
                    sale, lease, or shortlet operations. PureCrest reserves editorial review
                    discretion prior to live catalog publication.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">
                    3. Virtual Support, OTA Optimization &amp; Software Services
                  </h3>
                  <p>
                    Commercial scopes, deliverables, and service-level terms for Hospitality Virtual
                    Support, OTA Listing Optimization, and Pure Crest Technology engagements are
                    governed by written service agreements executed with each client.
                  </p>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
