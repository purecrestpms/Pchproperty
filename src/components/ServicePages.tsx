import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe,
  Headphones,
  Home,
  Hotel,
  Layers,
  Mail,
  Phone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LOGO_ASSET_PATH } from '../data/seedData';
import { createInquiry } from '../lib/firestoreService';
import type {
  InquiryDivision,
  LegalDocType,
  ServiceOffering,
  SiteContent,
} from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface ServicePagesProps {
  siteContent: SiteContent;
  services: ServiceOffering[];
  selectedServiceId: string;
  user: User | null;
  isAdmin: boolean;
  onSelectService: (serviceId: string) => void;
  onGoHome: () => void;
  onOpenListings: () => void;
  onOpenSubmitListing: () => void;
  onOpenPortal: () => void;
  onOpenAdmin: () => void;
  onRequireAuth: () => Promise<User | null>;
  onOpenLegal: (doc: LegalDocType) => void;
  onOpenCookieSettings: () => void;
}

const OTA_PLATFORMS = [
  {
    name: 'Airbnb Search & Superhost Optimization',
    summary:
      'Algorithmic keyword placement in titles, structured amenity completeness, instant-book conversion tuning, and automated check-in messaging.',
  },
  {
    name: 'Booking.com Visibility & Preferred Readiness',
    summary:
      'Room-type inventory calibration, rate-plan differentiation, Genius & mobile-rate structuring, and content score completion.',
  },
  {
    name: 'Vrbo, Expedia & Corporate Distribution',
    summary:
      'Multi-calendar synchronization, unified cancellation rules, and extended-stay discount mapping across global travel portals.',
  },
  {
    name: 'Direct Web Booking Funnel Alignment',
    summary:
      'Consistent photography sequencing, unified brand copy, and seamless guest transition from OTA discovery into direct repeat stays.',
  },
];

function getServiceIcon(service: ServiceOffering) {
  const titleLower = service.title.toLowerCase();
  if (titleLower.includes('ota')) return Globe;
  if (titleLower.includes('virtual')) return Headphones;
  if (service.division === 'hospitality') return Hotel;
  if (service.division === 'real-estate') return Building2;
  return Layers;
}

export function ServicePages({
  siteContent,
  services,
  selectedServiceId,
  user,
  isAdmin,
  onSelectService,
  onGoHome,
  onOpenListings,
  onOpenSubmitListing,
  onOpenPortal,
  onOpenAdmin,
  onRequireAuth,
  onOpenLegal,
  onOpenCookieSettings,
}: ServicePagesProps) {
  const activeServices = services
    .filter((s) => s.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activeService =
    selectedServiceId === 'all'
      ? null
      : activeServices.find((s) => s.id === selectedServiceId) || activeServices[0] || null;

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [division, setDivision] = useState<InquiryDivision>(
    activeService?.division || 'hospitality',
  );
  const [budget, setBudget] = useState('');
  const [subject, setSubject] = useState(
    activeService ? `Service Inquiry: ${activeService.title}` : '',
  );
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (activeService) {
      setDivision(activeService.division);
      setSubject(`Service Inquiry: ${activeService.title}`);
    } else {
      setSubject('');
    }
    setSuccessId(null);
    setErrorMsg(null);
  }, [activeService?.id, activeService?.title, activeService?.division]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailVal = (email || user?.email || '').trim();
    if (!emailVal || !emailVal.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 5) {
      setErrorMsg('Please provide a valid phone number.');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Please enter at least 10 characters describing your property or service needs.');
      return;
    }

    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await onRequireAuth();
      }
      if (!activeUser) {
        setSubmitting(false);
        return;
      }

      const id = await createInquiry({
        user: activeUser,
        fullName: fullName.trim() || activeUser.displayName || 'PureCrest Client',
        email: emailVal,
        phone: phone.trim(),
        company: company.trim(),
        serviceDivision: division,
        subject:
          subject.trim() ||
          (activeService ? `Service Inquiry: ${activeService.title}` : 'PureCrest Service Inquiry'),
        message: message.trim(),
        budgetRange: budget.trim(),
      });
      setSuccessId(id);
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to send inquiry. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Services Top Header Banner */}
      <section className="bg-[#064E3B] text-white border-b border-emerald-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#F6C453] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Homepage</span>
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/70 rounded-lg text-white cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>

          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-[#F6C453]">
              PureCrest Service Divisions
            </p>
            <h1
              className="mt-2 font-display font-bold text-white leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3.1rem)', textWrap: 'balance' }}
            >
              {activeService
                ? activeService.title
                : 'Dedicated Hospitality, Property, Virtual Support, OTA Optimization & Software Services'}
            </h1>
            <p className="mt-4 text-base text-emerald-100/90 leading-relaxed">
              {activeService
                ? activeService.tagline
                : 'Explore each dedicated service division operated by PureCrest across Abuja and Lagos — structured for property owners, shortlet hosts, and hospitality operators.'}
            </p>
          </div>

          {/* Dedicated Page Switcher Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => onSelectService('all')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedServiceId === 'all'
                  ? 'bg-[#E5A024] text-slate-950 font-semibold'
                  : 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-800/70'
              }`}
            >
              All Services
            </button>
            {activeServices.map((svc) => {
              const isSelected = activeService?.id === svc.id && selectedServiceId !== 'all';
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => onSelectService(svc.id)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#E5A024] text-slate-950 font-semibold'
                      : 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-800/70'
                  }`}
                >
                  {svc.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Page Body: Either All Services Hub or Dedicated Service Detail Page */}
      {selectedServiceId === 'all' ? (
        <section className="py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeServices.map((svc) => {
                const Icon = getServiceIcon(svc);
                return (
                  <article
                    key={svc.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#155E95]/50 transition-colors"
                  >
                    <div>
                      <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                        <ResilientImage
                          src={svc.imageUrl}
                          alt={svc.title}
                          className="w-full h-full object-cover"
                          fallbackLabel={svc.title}
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#155E95]">
                          <Icon className="w-4 h-4" />
                          <span>
                            {svc.division === 'hospitality'
                              ? 'Hospitality & Channel Operations'
                              : svc.division === 'real-estate'
                                ? 'Property Development, Sales & Leasing'
                                : 'Technology & Booking Infrastructure'}
                          </span>
                        </div>
                        <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                          {svc.title}
                        </h2>
                        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                          {svc.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onSelectService(svc.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155E95] hover:text-[#0E446E] cursor-pointer"
                      >
                        <span>Open Service Page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        activeService && (
          <section className="py-16 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              {/* Architectural Detail Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                <div className="lg:col-span-6 space-y-6 flex flex-col justify-center">
                  <div className="text-xs font-semibold text-[#155E95]">
                    {activeService.division === 'hospitality'
                      ? 'Hospitality Operations Division'
                      : activeService.division === 'real-estate'
                        ? 'Property Sales & Leasing Division'
                        : 'Property Technology Division'}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-900 leading-tight">
                    {activeService.title}
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {activeService.description}
                  </p>

                  <div className="pt-2 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Core Scope &amp; Deliverables
                    </h3>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {activeService.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-slate-700"
                        >
                          <Check className="w-4 h-4 text-[#155E95] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <a
                      href="#service-consultation"
                      className="px-5 py-2.5 text-xs font-semibold bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <span>Request Service Proposal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={onOpenListings}
                      className="px-5 py-2.5 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      View Managed Residences
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="h-80 lg:h-full min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <ResilientImage
                      src={activeService.imageUrl}
                      alt={activeService.title}
                      className="w-full h-full object-cover"
                      fallbackLabel={activeService.title}
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated OTA Listing Optimization Breakdown when viewing OTA service */}
              {activeService.id === 'svc-ota-optimization' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-6">
                  <div className="max-w-2xl">
                    <div className="text-xs font-semibold text-[#155E95]">
                      Channel Distribution Architecture
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                      Multi-Platform OTA Optimization Framework
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      We tune every listing attribute across major global booking portals alongside your direct reservation web portal so search impressions turn into confirmed stays.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {OTA_PLATFORMS.map((platform) => (
                      <div
                        key={platform.name}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-2"
                      >
                        <h4 className="font-display text-base font-bold text-slate-900">
                          {platform.name}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {platform.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      )}

      {/* Service Consultation Form (NO placeholders) */}
      <section id="service-consultation" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-semibold text-[#155E95]">
                PureCrest Service Desk
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                {activeService
                  ? `Start with ${activeService.title}`
                  : 'Discuss Your Property or Hospitality Goals'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete the form to share your property details or operational goals with our Abuja and Lagos management team.
              </p>
              <div className="space-y-3 pt-4 border-t border-slate-200 text-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-[#155E95] shrink-0" />
                  <span>{siteContent.contactEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-mono tabular-nums">
                  <Phone className="w-4 h-4 text-[#155E95] shrink-0" />
                  <span>{siteContent.contactPhone}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              {successId ? (
                <div className="py-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Service Inquiry Submitted
                  </h3>
                  <p className="text-sm text-slate-600">
                    Your inquiry is recorded under reference{' '}
                    <span className="font-mono font-semibold text-slate-900">{successId}</span>.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onOpenPortal}
                      className="px-4 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                    >
                      Open Client Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuccessId(null)}
                      className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      Send Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Company or Property Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Service Division
                      </label>
                      <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value as InquiryDivision)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      >
                        <option value="hospitality">Hospitality, Virtual Support &amp; OTA Optimization</option>
                        <option value="real-estate">Real Estate Sales &amp; Leasing</option>
                        <option value="technology">Technology &amp; Booking Systems</option>
                        <option value="general">General Partnership</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Scope or Property Location (Optional)
                      </label>
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Project Brief
                    </label>
                    <textarea
                      rows={4}
                      required
                      minLength={10}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95] resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      {user
                        ? `Submitting as ${user.email}`
                        : 'Google Sign-In links this request to your Client Portal.'}
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {submitting
                        ? 'Submitting...'
                        : user
                          ? 'Submit Request'
                          : 'Sign In & Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Deep Emerald Footer */}
      <footer className="bg-[#064E3B] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <img
                src={LOGO_ASSET_PATH}
                alt={`${siteContent.brandName} logo`}
                referrerPolicy="no-referrer"
                className="h-8 w-auto object-contain shrink-0"
              />
              <div>
                <div className="font-display text-lg font-bold text-white">
                  {siteContent.brandName}
                </div>
                <p className="text-xs text-emerald-100/80">
                  {siteContent.officeAddress} · {siteContent.contactEmail} · {siteContent.contactPhone}
                </p>
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-emerald-100">
              <button
                type="button"
                onClick={onGoHome}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={onOpenListings}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Listings
              </button>
              <button
                type="button"
                onClick={() => onSelectService('all')}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Services
              </button>
              <button
                type="button"
                onClick={onOpenSubmitListing}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Submit Listing
              </button>
              <button
                type="button"
                onClick={onOpenPortal}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Client Portal
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-[#F6C453] hover:text-white transition-colors cursor-pointer"
              >
                {isAdmin ? 'Admin CMS' : 'Admin Console'}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-emerald-100/75">
            <div>
              © {new Date().getFullYear()} {siteContent.brandName} Nigeria. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('cookies')}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Cookie Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={onOpenCookieSettings}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Cookie Preferences
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
