import type { User } from 'firebase/auth';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Calendar,
  Check,
  Copy,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Share2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatNaira, LOGO_ASSET_PATH } from '../data/seedData';
import { createInquiry } from '../lib/firestoreService';
import { buildSocialShareUrls, formatBlogDate } from '../lib/mediaUtils';
import type {
  BlogPost,
  InquiryDivision,
  LegalDocType,
  Listing,
  ListingCategory,
  ServiceOffering,
  SiteContent,
} from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface PublicSiteProps {
  siteContent: SiteContent;
  listings: Listing[];
  services: ServiceOffering[];
  posts: BlogPost[];
  user: User | null;
  isAdmin: boolean;
  savedListingIds: string[];
  activeCategoryFilter: 'all' | ListingCategory;
  onChangeCategoryFilter: (cat: 'all' | ListingCategory) => void;
  onSelectListing: (listing: Listing) => void;
  onSelectPost: (post: BlogPost) => void;
  onToggleSave: (listingId: string) => Promise<void>;
  onRequireAuth: () => Promise<User | null>;
  onOpenPortal: () => void;
  onOpenAdmin: () => void;
  onOpenSubmitListing: () => void;
  onOpenServicePage: (serviceId?: string) => void;
  onOpenLegal: (doc: LegalDocType) => void;
  onOpenCookieSettings: () => void;
  onGoHome: () => void;
}

export function PublicSite({
  siteContent,
  listings,
  services,
  posts,
  user,
  isAdmin,
  savedListingIds,
  activeCategoryFilter,
  onChangeCategoryFilter,
  onSelectListing,
  onSelectPost,
  onToggleSave,
  onRequireAuth,
  onOpenPortal,
  onOpenAdmin,
  onOpenSubmitListing,
  onOpenServicePage,
  onOpenLegal,
  onOpenCookieSettings,
  onGoHome,
}: PublicSiteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiryName, setInquiryName] = useState(user?.displayName || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquiryDivision, setInquiryDivision] = useState<InquiryDivision>('hospitality');
  const [inquiryBudget, setInquiryBudget] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySuccessId, setInquirySuccessId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesCat =
        activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.propertyType.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [listings, activeCategoryFilter, searchQuery]);

  const activeServices = useMemo(() => {
    return services
      .filter((svc) => svc.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [services]);

  const publishedPosts = useMemo(() => {
    return posts.filter((p) => p.published);
  }, [posts]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);

    const emailVal = (inquiryEmail || user?.email || '').trim();
    if (!emailVal || !emailVal.includes('@')) {
      setInquiryError('Please provide a valid email address.');
      return;
    }
    if (!inquiryPhone.trim() || inquiryPhone.trim().length < 5) {
      setInquiryError('Please provide a valid phone number.');
      return;
    }
    if (inquiryMessage.trim().length < 10) {
      setInquiryError('Please enter at least 10 characters describing your requirement.');
      return;
    }

    setInquirySubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await onRequireAuth();
      }
      if (!activeUser) {
        setInquirySubmitting(false);
        return;
      }

      const id = await createInquiry({
        user: activeUser,
        fullName: inquiryName.trim() || activeUser.displayName || 'PureCrest Client',
        email: emailVal,
        phone: inquiryPhone.trim(),
        company: inquiryCompany.trim(),
        serviceDivision: inquiryDivision,
        subject: inquirySubject.trim() || 'PureCrest Inquiry',
        message: inquiryMessage.trim(),
        budgetRange: inquiryBudget.trim(),
      });
      setInquirySuccessId(id);
      setInquirySubject('');
      setInquiryMessage('');
    } catch (err) {
      setInquiryError(
        err instanceof Error ? err.message : 'Unable to send inquiry. Please try again.',
      );
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <main>
      {siteContent.announcementBanner && siteContent.announcementBanner.trim().length > 0 && (
        <div className="bg-[#04392B] text-amber-100 text-xs py-2.5 px-4 text-center border-b border-emerald-950">
          {siteContent.announcementBanner}
        </div>
      )}

      {/* Hero Section: Asymmetric Architectural Split */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-[#155E95]">
                {siteContent.heroEyebrow}
              </p>
              <h1
                className="mt-4 font-display font-bold tracking-tight text-slate-900 leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                {siteContent.heroTitle}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {siteContent.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#properties"
                  className="px-6 py-3 bg-[#155E95] hover:bg-[#0E446E] text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{siteContent.heroPrimaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#contact"
                  className="px-5 py-3 bg-white border border-slate-300 hover:border-[#B45309] text-[#155E95] hover:text-[#0E446E] text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {siteContent.heroSecondaryCta}
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-72 sm:h-96 lg:h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <ResilientImage
                  src={siteContent.heroImageUrl}
                  alt={siteContent.heroTitle}
                  className="w-full h-full object-cover"
                  fallbackLabel={siteContent.brandName}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Listings & Multi-Room Shortlets Section */}
      <section id="properties" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div id="shortlets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-[#155E95]">
                Curated Portfolio · Multi-Room Shortlets &amp; Verified Assets
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                Residences, Shortlets &amp; Commercial Assets
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Richgates, Enugu, apartments..."
                  aria-label="Search properties"
                  className="w-full sm:w-60 pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'shortlet', label: 'Shortlets' },
                    { id: 'sale', label: 'For Sale' },
                    { id: 'lease', label: 'For Lease' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChangeCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeCategoryFilter === tab.id
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'text-slate-700 hover:text-[#155E95]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onOpenSubmitListing}
                className="px-4 py-2 text-xs font-semibold bg-[#E5A024] hover:bg-[#F3B13B] text-slate-950 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Listing</span>
              </button>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="mt-10 bg-white border border-slate-200 rounded-xl p-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                No properties match your current filter.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try clearing the search query or switching to All listings.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onChangeCategoryFilter('all');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium bg-[#155E95] text-white rounded-lg hover:bg-[#0E446E] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={`mt-10 ${
                filteredListings.length === 1
                  ? 'max-w-5xl'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              }`}
            >
              {filteredListings.map((listing) => {
                const isSaved = savedListingIds.includes(listing.id);
                const hasRooms = (listing.rooms?.length || 0) > 0;
                const minRoomPrice = hasRooms
                  ? Math.min(...listing.rooms.map((r) => r.pricePerNightNgn))
                  : listing.priceNgn;
                const isSingleShowcase = filteredListings.length === 1;
                return (
                  <article
                    key={listing.id}
                    className={`bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors hover:border-[#155E95]/50 ${
                      isSingleShowcase
                        ? 'grid grid-cols-1 lg:grid-cols-12'
                        : 'flex flex-col justify-between'
                    }`}
                  >
                    <div
                      className={
                        isSingleShowcase
                          ? 'lg:col-span-6 aspect-[4/3] lg:aspect-auto lg:min-h-[340px] w-full bg-slate-100 relative overflow-hidden'
                          : 'aspect-[4/3] w-full bg-slate-100 relative overflow-hidden'
                      }
                    >
                      <ResilientImage
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        fallbackLabel={listing.title}
                      />
                      <button
                        type="button"
                        onClick={() => void onToggleSave(listing.id)}
                        aria-label={
                          isSaved
                            ? `Remove ${listing.title} from saved`
                            : `Save ${listing.title}`
                        }
                        className={`absolute top-3 right-3 p-2 rounded-lg border backdrop-blur-xs transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-[#E5A024] border-[#E5A024] text-slate-950'
                            : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div
                      className={`flex flex-col justify-between ${
                        isSingleShowcase ? 'lg:col-span-6' : 'flex-1'
                      }`}
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-[#155E95]">
                            {listing.category === 'shortlet'
                              ? 'Shortlet'
                              : listing.category === 'sale'
                                ? 'For Sale'
                                : 'For Lease'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{listing.location}</span>
                          {hasRooms && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#B45309] font-medium">
                                Multiple Suites
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="mt-2 font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                          {listing.title}
                        </h3>
                        <p
                          className={`mt-2 text-sm text-slate-600 leading-relaxed ${
                            isSingleShowcase ? '' : 'line-clamp-2'
                          }`}
                        >
                          {listing.summary}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 tabular-nums">
                          <span>
                            {listing.bedrooms > 0
                              ? `${listing.bedrooms} Beds`
                              : listing.propertyType}
                          </span>
                          <span aria-hidden="true">/</span>
                          <span>{listing.bathrooms} Baths</span>
                          <span aria-hidden="true">/</span>
                          <span>{listing.areaSqm} sqm</span>
                          {listing.videoUrl && (
                            <>
                              <span aria-hidden="true">/</span>
                              <span className="text-[#155E95] font-medium">Video Tour</span>
                            </>
                          )}
                        </div>

                        {isSingleShowcase && listing.amenities.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                            {listing.amenities.slice(0, 4).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                            {hasRooms && listing.rooms.length > 1
                              ? `From ${formatNaira(minRoomPrice)}`
                              : formatNaira(listing.priceNgn)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {listing.priceUnit === 'night'
                              ? 'per night'
                              : listing.priceUnit === 'year'
                                ? 'per annum'
                                : 'outright purchase'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectListing(listing)}
                          className="px-4 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {listing.category === 'shortlet' ? 'View Rooms & Book' : 'Inspect Asset'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PureCrest Service Divisions Showcase (Links to Separate Service Pages) */}
      <section id="hospitality" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div id="technology" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#155E95]">
                PureCrest Service Divisions
              </p>
              <h2
                className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                {siteContent.aboutHeadline}
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {siteContent.aboutBody}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenServicePage('all')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155E95] hover:text-[#0E446E] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>All Service Pages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary 3-Column Division Triad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeServices
              .filter(
                (s) =>
                  s.id !== 'svc-hospitality-virtual-support' &&
                  s.id !== 'svc-ota-optimization',
              )
              .slice(0, 3)
              .map((svc) => (
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
                      <h3 className="font-display text-xl font-bold text-slate-900">
                        {svc.title}
                      </h3>
                      <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                        {svc.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenServicePage(svc.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155E95] hover:text-[#0E446E] cursor-pointer"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
          </div>

          {/* Dedicated Emerald Banners: Hospitality Virtual Support & OTA Listing Optimization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(
              activeServices.filter(
                (s) =>
                  s.id === 'svc-hospitality-virtual-support' ||
                  s.id === 'svc-ota-optimization',
              )
            ).map((svc) => (
              <div
                key={svc.id}
                className="bg-[#064E3B] text-white rounded-xl p-7 sm:p-8 flex flex-col justify-between space-y-5"
              >
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {svc.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-emerald-100/90 leading-relaxed">
                    {svc.tagline}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenServicePage(svc.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F6C453] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Custom CMS Services (if added by admin beyond the 5 defaults) */}
          {activeServices.filter(
            (s) =>
              ![
                'svc-hospitality-ops',
                'svc-real-estate-sales',
                'svc-technology-systems',
                'svc-hospitality-virtual-support',
                'svc-ota-optimization',
              ].includes(s.id),
          ).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeServices
                .filter(
                  (s) =>
                    ![
                      'svc-hospitality-ops',
                      'svc-real-estate-sales',
                      'svc-technology-systems',
                      'svc-hospitality-virtual-support',
                      'svc-ota-optimization',
                    ].includes(s.id),
                )
                .map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {svc.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {svc.tagline}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenServicePage(svc.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155E95] hover:text-[#0E446E] cursor-pointer"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* PureCrest Journal / Blog Section */}
      <section id="journal" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#155E95]">
                Research &amp; Insights · PureCrest Journal
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                Hospitality Economics, Title Governance &amp; PropTech Briefings
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              Editorial briefs &amp; field reports
            </div>
          </div>

          {publishedPosts.length === 0 ? (
            <div className="mt-10 bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
              Editorial articles will appear here once published from the Admin Blog CMS.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {publishedPosts.map((post) => {
                const share = buildSocialShareUrls(post);
                const dateLabel = formatBlogDate(post.publishedDate, post.createdAt);
                const handleCopyLink = async () => {
                  try {
                    await navigator.clipboard.writeText(share.shareUrl);
                    setCopiedPostId(post.id);
                    setTimeout(() => setCopiedPostId(null), 2200);
                  } catch {
                    // Ignore clipboard permission errors
                  }
                };
                return (
                  <article
                    key={post.id}
                    id={`journal-${post.slug}`}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#155E95]/50 transition-colors"
                  >
                    <div>
                      <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                        <ResilientImage
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          fallbackLabel={post.title}
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-[#155E95]">{post.category}</span>
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateLabel}</span>
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-xl font-bold text-slate-900 leading-snug">
                          {post.title}
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Share2 className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                        <a
                          href={share.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Share ${post.title} on WhatsApp`}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-[#064E3B] rounded transition-colors"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={share.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Share ${post.title} on X`}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          X
                        </a>
                        <a
                          href={share.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Share ${post.title} on LinkedIn`}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-[#155E95] rounded transition-colors"
                        >
                          LinkedIn
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleCopyLink()}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedPostId === post.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span className="text-emerald-800">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Link</span>
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectPost(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155E95] hover:text-[#0E446E] hover:underline underline-offset-4 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Full Article</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Consultation & Lead Capture Section */}
      <section id="contact" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#155E95]">
                  Direct Inquiries &amp; Partnerships
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                  Partner with PureCrest
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Whether onboarding a multi-unit shortlet building, buying or leasing verified property, optimizing OTA channels, or deploying booking software, our leadership desk responds promptly.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#155E95] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">Our Office · Location</div>
                    <div className="text-slate-600">{siteContent.officeAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#155E95] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">Email</div>
                    <a
                      href={`mailto:${siteContent.contactEmail}`}
                      className="text-[#155E95] hover:underline font-medium"
                    >
                      {siteContent.contactEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#155E95] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">WhatsApp &amp; Direct Line</div>
                    <a
                      href={`tel:${siteContent.contactPhone.replace(/[^+\d]/g, '')}`}
                      className="font-mono tabular-nums text-[#155E95] hover:underline font-medium"
                    >
                      {siteContent.contactPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#064E3B] text-white rounded-xl p-5 space-y-2.5 text-xs">
                <div className="font-semibold text-[#F6C453] tracking-wide">Office Hours</div>
                <div className="flex items-center justify-between gap-4 border-b border-emerald-800/70 pb-2">
                  <span className="text-emerald-100/85">Monday – Friday</span>
                  <span className="font-mono font-semibold tabular-nums text-white">
                    {siteContent.officeHoursWeekday || '8:00 AM – 6:00 PM'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-emerald-800/70 pb-2">
                  <span className="text-emerald-100/85">Saturday</span>
                  <span className="font-mono font-semibold tabular-nums text-white">
                    {siteContent.officeHoursSaturday || '9:00 AM – 4:00 PM'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-emerald-100/85">Sunday</span>
                  <span className="text-emerald-200/90">
                    {siteContent.officeHoursSunday || 'By Appointment'}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
              {inquirySuccessId ? (
                <div className="py-8 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Consultation Request Received
                  </h3>
                  <p className="text-sm text-slate-600">
                    Your inquiry is logged under reference{' '}
                    <span className="font-mono font-medium text-slate-900">{inquirySuccessId}</span>. You can monitor replies directly inside your Client Portal.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onOpenPortal}
                      className="px-4 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg transition-colors cursor-pointer"
                    >
                      View in Client Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquirySuccessId(null)}
                      className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
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
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
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
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Organization (Optional)
                      </label>
                      <input
                        type="text"
                        value={inquiryCompany}
                        onChange={(e) => setInquiryCompany(e.target.value)}
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
                        value={inquiryDivision}
                        onChange={(e) => setInquiryDivision(e.target.value as InquiryDivision)}
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
                        Property Location or Scope (Optional)
                      </label>
                      <input
                        type="text"
                        value={inquiryBudget}
                        onChange={(e) => setInquiryBudget(e.target.value)}
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
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      minLength={10}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95] resize-none"
                    />
                  </div>

                  {inquiryError && (
                    <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      {inquiryError}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      {user
                        ? `Submitting as ${user.email}`
                        : 'Direct PureCrest advisory desk'}
                    </span>
                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="px-6 py-2.5 bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {inquirySubmitting ? 'Submitting...' : 'Submit Inquiry'}
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
                src={siteContent.logoUrl || LOGO_ASSET_PATH}
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
              <a href="#properties" className="hover:text-[#F6C453] transition-colors">
                Listings
              </a>
              <button
                type="button"
                onClick={() => onOpenServicePage('all')}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Services
              </button>
              <a href="#journal" className="hover:text-[#F6C453] transition-colors">
                Journal
              </a>
              <button
                type="button"
                onClick={onOpenSubmitListing}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Submit Listing
              </button>
              <a
                href="/portal"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPortal();
                }}
                className="hover:text-[#F6C453] transition-colors cursor-pointer"
              >
                Client Portal
              </a>
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAdmin();
                }}
                className="text-[#F6C453] hover:text-white transition-colors cursor-pointer"
              >
                {isAdmin ? 'Admin CMS' : 'Admin Login'}
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-emerald-100/75">
            <div>
              © {new Date().getFullYear()} {siteContent.brandName} — Nigeria &amp; Beyond. All rights reserved.
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
