import { sendEmailVerification, type User } from 'firebase/auth';
import {
  Bookmark,
  Building2,
  Calendar,
  Home,
  LogOut,
  MailCheck,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { formatNaira } from '../data/seedData';
import {
  cancelBookingAsCustomer,
  getStatusLabel,
  updateUserProfile,
} from '../lib/firestoreService';
import type {
  Booking,
  Inquiry,
  Listing,
  ListingSubmission,
  UserProfile,
} from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface CustomerPortalProps {
  user: User;
  profile: UserProfile | null;
  isAdmin: boolean;
  bookings: Booking[];
  inquiries: Inquiry[];
  listings: Listing[];
  submissions: ListingSubmission[];
  onSelectListing: (listing: Listing) => void;
  onToggleSave: (listingId: string) => Promise<void>;
  onOpenAdmin: () => void;
  onOpenSubmitListing: () => void;
  onBackToSite: () => void;
  onSignOut: () => Promise<void>;
}

type PortalTab = 'bookings' | 'saved' | 'submissions' | 'inquiries' | 'profile';

function getStatusClasses(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'checked-in':
    case 'completed':
    case 'responded':
    case 'approved':
      return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    case 'pending':
    case 'new':
    case 'in-review':
      return 'text-amber-800 bg-amber-50 border-amber-200';
    case 'cancelled':
    case 'closed':
    case 'rejected':
      return 'text-red-800 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-100 border-slate-200';
  }
}

export function CustomerPortal({
  user,
  profile,
  isAdmin,
  bookings,
  inquiries,
  listings,
  submissions,
  onSelectListing,
  onToggleSave,
  onOpenAdmin,
  onOpenSubmitListing,
  onBackToSite,
  onSignOut,
}: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('bookings');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(
    profile?.displayName || user.displayName || '',
  );
  const [phone, setPhone] = useState(profile?.phone || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedState, setVerifiedState] = useState(user.emailVerified);

  const savedListings = listings.filter((item) =>
    (profile?.savedListingIds ?? []).includes(item.id),
  );

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await cancelBookingAsCustomer(bookingId);
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedNotice(false);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        phone,
        company,
        savedListingIds: profile?.savedListingIds ?? [],
      });
      setProfileSavedNotice(true);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Client Portal · {user.email}
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              Welcome, {profile?.displayName || user.displayName || 'Guest'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-4 py-2 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin CMS</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSubmitListing}
              className="px-4 py-2 text-xs font-semibold bg-[#E5A024] hover:bg-[#F3B13B] text-slate-950 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Listing</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-[#155E95] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Homepage</span>
            </button>
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {!verifiedState && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <MailCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <div className="font-semibold">Verify your email address ({user.email})</div>
                <p className="text-amber-800 leading-relaxed">
                  Please click the verification link in your inbox to unlock saving listings, creating bookings, and submitting properties.
                </p>
                {verificationSent && (
                  <p className="font-medium text-emerald-800">
                    Verification email dispatched. Check your inbox and spam folder.
                  </p>
                )}
                {verificationError && (
                  <p className="font-medium text-red-700">{verificationError}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={verificationBusy}
                onClick={async () => {
                  setVerificationBusy(true);
                  setVerificationError(null);
                  try {
                    await sendEmailVerification(user);
                    setVerificationSent(true);
                  } catch (err) {
                    setVerificationError(
                      err instanceof Error ? err.message : 'Unable to send verification email.',
                    );
                  } finally {
                    setVerificationBusy(false);
                  }
                }}
                className="px-3.5 py-2 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg cursor-pointer"
              >
                Resend Email
              </button>
              <button
                type="button"
                disabled={verificationBusy}
                onClick={async () => {
                  setVerificationBusy(true);
                  setVerificationError(null);
                  try {
                    await user.reload();
                    setVerifiedState(user.emailVerified);
                  } finally {
                    setVerificationBusy(false);
                  }
                }}
                className="px-3.5 py-2 text-xs font-medium bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>I&apos;ve Verified</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'saved', label: 'Saved Properties', icon: Bookmark },
              {
                id: 'submissions',
                label: 'My Submissions',
                icon: Building2,
              },
              { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
              { id: 'profile', label: 'Profile Settings', icon: UserIcon },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Viewport */}
        <div className="mt-6">
          {activeTab === 'bookings' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Shortlet Reservations &amp; Asset Inspections
                </h2>
                <button
                  type="button"
                  onClick={onBackToSite}
                  className="text-xs font-medium text-[#155E95] hover:underline cursor-pointer"
                >
                  New Booking
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-900">No bookings recorded yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Reserve a luxury shortlet or schedule a private property inspection to see it here.
                  </p>
                  <button
                    type="button"
                    onClick={onBackToSite}
                    className="mt-4 px-4 py-2 text-xs font-medium bg-[#155E95] text-white rounded-lg hover:bg-[#0E446E] transition-colors cursor-pointer"
                  >
                    Explore Portfolio
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 font-medium">Reference</th>
                        <th className="py-3 px-4 font-medium">Property</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium">Dates</th>
                        <th className="py-3 px-4 font-medium text-right">Total</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-6 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-6 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                            {bk.referenceCode}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            {bk.listingTitle}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 capitalize">
                            {bk.bookingType}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums">
                            {bk.bookingType === 'shortlet'
                              ? `${bk.checkInDate} → ${bk.checkOutDate}`
                              : bk.checkInDate}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900 text-right tabular-nums">
                            {bk.bookingType === 'shortlet' ? formatNaira(bk.totalNgn) : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-medium border rounded-md ${getStatusClasses(bk.status)}`}
                            >
                              {getStatusLabel(bk.status)}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {(bk.status === 'pending' || bk.status === 'confirmed') && (
                              <button
                                type="button"
                                disabled={cancellingId === bk.id}
                                onClick={() => void handleCancelBooking(bk.id)}
                                className="text-xs font-medium text-red-700 hover:text-red-900 disabled:opacity-50 cursor-pointer"
                              >
                                {cancellingId === bk.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="font-display text-base font-bold text-slate-900 mb-4">
                Saved Properties
              </h2>
              {savedListings.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-900">No saved properties</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bookmark residences on the catalog to compare and book later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {savedListings.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] bg-slate-100">
                          <ResilientImage
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            fallbackLabel={item.title}
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-slate-500">{item.location}</div>
                          <div className="mt-1 font-display font-bold text-slate-900">
                            {item.title}
                          </div>
                          <div className="mt-1 font-mono text-sm font-semibold text-emerald-900 tabular-nums">
                            {formatNaira(item.priceNgn)}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => void onToggleSave(item.id)}
                          className="text-xs text-slate-500 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectListing(item)}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-emerald-800 cursor-pointer"
                        >
                          Open Dossier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Submitted Property Listings
                </h2>
                <button
                  type="button"
                  onClick={onOpenSubmitListing}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#E5A024] hover:bg-[#F3B13B] text-slate-950 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Property</span>
                </button>
              </div>
              {submissions.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-900">
                    No submitted listings yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Own an apartment, shortlet, commercial unit, or land? Submit it for PureCrest management or catalog publication.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenSubmitListing}
                    className="mt-4 px-4 py-2 text-xs font-medium bg-[#155E95] text-white rounded-lg hover:bg-[#0E446E] cursor-pointer"
                  >
                    Submit Your First Property
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <ResilientImage
                            src={sub.imageUrl}
                            alt={sub.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="capitalize font-medium text-[#155E95]">
                              {sub.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{sub.location}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-slate-900">
                              {formatNaira(sub.priceNgn)}
                            </span>
                          </div>
                          <div className="mt-1 font-display font-bold text-slate-900">
                            {sub.title}
                          </div>
                          {sub.adminNotes && (
                            <p className="text-xs text-slate-600 mt-1">
                              Reviewer note: {sub.adminNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium border rounded-md self-start sm:self-center ${getStatusClasses(sub.status)}`}
                      >
                        {getStatusLabel(sub.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-slate-900">
                Service &amp; Property Inquiries
              </h2>
              {inquiries.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-900">No inquiries submitted yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submit a hospitality, property sales, or technology request from the homepage or service pages.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-medium text-slate-900">{inq.subject}</div>
                          <div className="text-xs text-slate-500 capitalize">
                            {inq.serviceDivision.replace('-', ' ')} · {inq.budgetRange || 'Standard Scope'}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium border rounded-md ${getStatusClasses(inq.status)}`}
                        >
                          {getStatusLabel(inq.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{inq.message}</p>
                      {inq.adminReply && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-sm text-slate-800">
                          <div className="text-xs font-semibold text-emerald-900 mb-1">
                            PureCrest Desk Response
                          </div>
                          {inq.adminReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl">
              <h2 className="font-display text-base font-bold text-slate-900 mb-4">
                Client Profile Details
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address (Verified)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                {profileSavedNotice && (
                  <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
                    Profile updated in Firestore.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
