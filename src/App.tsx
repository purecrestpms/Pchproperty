import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import firestoreRulesRaw from '../firestore.rules?raw';
import { AdminDashboard } from './components/AdminDashboard';
import { BlogModal } from './components/BlogModal';
import {
  CookieConsentBanner,
  type CookieConsentPreferences,
} from './components/CookieConsentBanner';
import { CustomerPortal } from './components/CustomerPortal';
import { LegalModal } from './components/LegalModal';
import { ListingModal } from './components/ListingModal';
import { PublicSite } from './components/PublicSite';
import { ServicePages } from './components/ServicePages';
import { SubmitListingModal } from './components/SubmitListingModal';
import { TopBar } from './components/TopBar';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  DEFAULT_BLOG_POSTS,
  DEFAULT_LISTINGS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CONTENT,
} from './data/seedData';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { ensureUserProfile, toggleSavedListing } from './lib/firestoreService';
import type {
  AdminMember,
  AppView,
  BlogPost,
  Booking,
  Inquiry,
  LegalDocType,
  Listing,
  ListingCategory,
  ListingSubmission,
  ServiceOffering,
  SiteContent,
  UserProfile,
} from './types/purecrest';

const COOKIE_STORAGE_KEY = 'purecrest_cookie_consent_v1';

const DEFAULT_COOKIE_PREFS: CookieConsentPreferences = {
  essential: true,
  preferences: true,
  analytics: false,
  updatedAt: '',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isDelegatedAdmin, setIsDelegatedAdmin] = useState(false);

  const [activeView, setActiveView] = useState<AppView>('public');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | ListingCategory>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [submitListingOpen, setSubmitListingOpen] = useState(false);
  const [legalModalDoc, setLegalModalDoc] = useState<LegalDocType | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cookieBannerVisible, setCookieBannerVisible] = useState<boolean>(() => {
    try {
      return !window.localStorage.getItem(COOKIE_STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [cookiePrefs, setCookiePrefs] = useState<CookieConsentPreferences>(() => {
    try {
      const raw = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!raw) return DEFAULT_COOKIE_PREFS;
      const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
      return {
        essential: true,
        preferences: parsed.preferences ?? true,
        analytics: parsed.analytics ?? false,
        updatedAt: parsed.updatedAt ?? '',
      };
    } catch {
      return DEFAULT_COOKIE_PREFS;
    }
  });

  // Live CMS Data (falls back to built-in seed defaults until Firestore is initialized)
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [hasLiveDb, setHasLiveDb] = useState(false);
  const [listings, setListings] = useState<Listing[]>(DEFAULT_LISTINGS);
  const [services, setServices] = useState<ServiceOffering[]>(DEFAULT_SERVICES);
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_BLOG_POSTS);

  // Authenticated User Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([]);
  const [admins, setAdmins] = useState<AdminMember[]>([]);

  const isAdmin =
    Boolean(
      user &&
        user.emailVerified &&
        user.email === BOOTSTRAPPED_ADMIN_EMAIL,
    ) || isDelegatedAdmin;

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setIsDelegatedAdmin(false);
        setUserProfile(null);
        setBookings([]);
        setInquiries([]);
        setSubmissions([]);
        setAdmins([]);
      } else {
        void ensureUserProfile(firebaseUser);
      }
    });
    return () => unsub();
  }, []);

  // 2. Public CMS Listeners (siteContent, listings, services, posts)
  useEffect(() => {
    const unsubSite = onSnapshot(
      doc(db, 'siteContent', 'main'),
      (snap) => {
        if (snap.exists()) {
          setHasLiveDb(true);
          setSiteContent({ id: snap.id, ...(snap.data() as Omit<SiteContent, 'id'>) });
        } else {
          setHasLiveDb(false);
          setSiteContent(DEFAULT_SITE_CONTENT);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'siteContent/main');
      },
    );

    const unsubListings = onSnapshot(
      collection(db, 'listings'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as Omit<Listing, 'id'>) }),
          );
          setListings(items);
        } else {
          setListings(DEFAULT_LISTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'listings');
      },
    );

    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as Omit<ServiceOffering, 'id'>) }),
          );
          setServices(items);
        } else {
          setServices(DEFAULT_SERVICES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'services');
      },
    );

    const unsubPosts = onSnapshot(
      collection(db, 'posts'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }),
          );
          items.sort((a, b) => {
            const ta = a.createdAt && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
            const tb = b.createdAt && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
            return tb - ta;
          });
          setPosts(items);
        } else {
          setPosts(DEFAULT_BLOG_POSTS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
      },
    );

    return () => {
      unsubSite();
      unsubListings();
      unsubServices();
      unsubPosts();
    };
  }, []);

  // 3. Authenticated User Profile & Delegated Admin Check
  useEffect(() => {
    if (!authReady || !user) return;

    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      },
    );

    const unsubAdminDoc = onSnapshot(
      doc(db, 'admins', user.uid),
      (snap) => {
        setIsDelegatedAdmin(snap.exists() && Boolean(user.emailVerified));
      },
      () => {
        setIsDelegatedAdmin(false);
      },
    );

    return () => {
      unsubProfile();
      unsubAdminDoc();
    };
  }, [authReady, user]);

  // 4. Role-Scoped Bookings & Inquiries Listeners
  useEffect(() => {
    if (!authReady || !user) return;

    const bookingsQuery = isAdmin
      ? query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'bookings'), where('userId', '==', user.uid));

    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }),
        );
        items.sort((a, b) => {
          const ta = a.createdAt && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
          const tb = b.createdAt && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
          return tb - ta;
        });
        setBookings(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      },
    );

    const inquiriesQuery = isAdmin
      ? query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'inquiries'), where('userId', '==', user.uid));

    const unsubInquiries = onSnapshot(
      inquiriesQuery,
      (snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<Inquiry, 'id'>) }),
        );
        items.sort((a, b) => {
          const ta = a.createdAt && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
          const tb = b.createdAt && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
          return tb - ta;
        });
        setInquiries(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'inquiries');
      },
    );

    const submissionsQuery = isAdmin
      ? query(collection(db, 'listingSubmissions'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'listingSubmissions'), where('ownerUid', '==', user.uid));

    const unsubSubmissions = onSnapshot(
      submissionsQuery,
      (snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<ListingSubmission, 'id'>) }),
        );
        items.sort((a, b) => {
          const ta = a.createdAt && 'seconds' in a.createdAt ? a.createdAt.seconds : 0;
          const tb = b.createdAt && 'seconds' in b.createdAt ? b.createdAt.seconds : 0;
          return tb - ta;
        });
        setSubmissions(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'listingSubmissions');
      },
    );

    let unsubAdmins: (() => void) | undefined;
    if (isAdmin) {
      unsubAdmins = onSnapshot(
        collection(db, 'admins'),
        (snap) => {
          setAdmins(snap.docs.map((d) => d.data() as AdminMember));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'admins');
        },
      );
    }

    return () => {
      unsubBookings();
      unsubInquiries();
      unsubSubmissions();
      unsubAdmins?.();
    };
  }, [authReady, user, isAdmin]);

  const handleSignIn = useCallback(async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(cred.user);
      return cred.user;
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Google Sign-In was cancelled or failed.',
      );
      return null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    setActiveView('public');
  }, []);

  const handleOpenPortal = useCallback(async () => {
    if (!user) {
      const signedUser = await handleSignIn();
      if (!signedUser) return;
    }
    setActiveView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user, handleSignIn]);

  const handleOpenAdmin = useCallback(async () => {
    if (!user) {
      const signedUser = await handleSignIn();
      if (!signedUser) return;
      if (signedUser.email === BOOTSTRAPPED_ADMIN_EMAIL && signedUser.emailVerified) {
        setActiveView('admin');
      } else {
        setActiveView('portal');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isAdmin) {
      setActiveView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAuthError(
        `Signed in as ${user.email}. Admin CMS requires owner or delegated administrator clearance.`,
      );
      setActiveView('portal');
    }
  }, [user, isAdmin, handleSignIn]);

  const handleNavigateSection = useCallback(
    (sectionId: string) => {
      if (sectionId === 'shortlets') {
        setActiveCategoryFilter('shortlet');
      } else if (sectionId === 'properties') {
        setActiveCategoryFilter('all');
      }

      if (activeView !== 'public') {
        setActiveView('public');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [activeView],
  );

  const handleToggleSave = useCallback(
    async (listingId: string) => {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await handleSignIn();
      }
      if (!activeUser) return;
      await toggleSavedListing(activeUser, userProfile, listingId);
    },
    [user, userProfile, handleSignIn],
  );

  const handleOpenServicePage = useCallback((serviceId = 'all') => {
    setSelectedServiceId(serviceId);
    setActiveView('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSaveCookiePrefs = useCallback((prefs: CookieConsentPreferences) => {
    setCookiePrefs(prefs);
    setCookieBannerVisible(false);
    try {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota / privacy mode restrictions
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <TopBar
        brandName={siteContent.brandName}
        user={user}
        activeView={activeView}
        onNavigateSection={handleNavigateSection}
        onOpenServices={() => handleOpenServicePage('all')}
        onOpenPortal={() => void handleOpenPortal()}
        onGoHome={() => {
          setActiveView('public');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {authError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-xs text-red-800 flex items-center justify-center gap-4">
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="underline font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeView === 'public' && (
        <PublicSite
          siteContent={siteContent}
          listings={listings}
          services={services}
          posts={posts}
          user={user}
          isAdmin={isAdmin}
          savedListingIds={userProfile?.savedListingIds ?? []}
          activeCategoryFilter={activeCategoryFilter}
          onChangeCategoryFilter={setActiveCategoryFilter}
          onSelectListing={(listing) => setSelectedListing(listing)}
          onSelectPost={(post) => setSelectedPost(post)}
          onToggleSave={handleToggleSave}
          onRequireAuth={handleSignIn}
          onOpenPortal={() => void handleOpenPortal()}
          onOpenAdmin={() => void handleOpenAdmin()}
          onOpenSubmitListing={() => setSubmitListingOpen(true)}
          onOpenServicePage={handleOpenServicePage}
          onOpenLegal={(docType) => setLegalModalDoc(docType)}
          onOpenCookieSettings={() => setCookieBannerVisible(true)}
          onGoHome={() => {
            setActiveView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {activeView === 'services' && (
        <ServicePages
          siteContent={siteContent}
          services={services}
          selectedServiceId={selectedServiceId}
          user={user}
          isAdmin={isAdmin}
          onSelectService={(svcId) => {
            setSelectedServiceId(svcId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onGoHome={() => {
            setActiveView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenListings={() => handleNavigateSection('properties')}
          onOpenSubmitListing={() => setSubmitListingOpen(true)}
          onOpenPortal={() => void handleOpenPortal()}
          onOpenAdmin={() => void handleOpenAdmin()}
          onRequireAuth={handleSignIn}
          onOpenLegal={(docType) => setLegalModalDoc(docType)}
          onOpenCookieSettings={() => setCookieBannerVisible(true)}
        />
      )}

      {activeView === 'portal' && user && (
        <CustomerPortal
          user={user}
          profile={userProfile}
          isAdmin={isAdmin}
          bookings={bookings}
          inquiries={inquiries}
          listings={listings}
          submissions={submissions}
          onSelectListing={(listing) => setSelectedListing(listing)}
          onToggleSave={handleToggleSave}
          onOpenAdmin={() => setActiveView('admin')}
          onOpenSubmitListing={() => setSubmitListingOpen(true)}
          onBackToSite={() => {
            setActiveView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSignOut={handleSignOut}
        />
      )}

      {activeView === 'admin' && user && isAdmin && (
        <AdminDashboard
          user={user}
          siteContent={siteContent}
          listings={listings}
          services={services}
          posts={posts}
          bookings={bookings}
          inquiries={inquiries}
          submissions={submissions}
          admins={admins}
          hasLiveDb={hasLiveDb}
          firestoreRulesText={firestoreRulesRaw}
          onBackToSite={() => {
            setActiveView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPortal={() => setActiveView('portal')}
          onSignOut={handleSignOut}
        />
      )}

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          user={user}
          isSaved={(userProfile?.savedListingIds ?? []).includes(selectedListing.id)}
          onClose={() => setSelectedListing(null)}
          onToggleSave={handleToggleSave}
          onRequireAuth={handleSignIn}
          onBookingCreated={() => {}}
        />
      )}

      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {submitListingOpen && (
        <SubmitListingModal
          user={user}
          onClose={() => setSubmitListingOpen(false)}
          onRequireAuth={handleSignIn}
          onOpenPortal={() => void handleOpenPortal()}
        />
      )}

      {legalModalDoc && (
        <LegalModal
          activeDoc={legalModalDoc}
          contactEmail={siteContent.contactEmail}
          contactPhone={siteContent.contactPhone}
          officeAddress={siteContent.officeAddress}
          onChangeDoc={setLegalModalDoc}
          onOpenCookieSettings={() => {
            setLegalModalDoc(null);
            setCookieBannerVisible(true);
          }}
          onClose={() => setLegalModalDoc(null)}
        />
      )}

      <CookieConsentBanner
        visible={cookieBannerVisible}
        initialPrefs={cookiePrefs}
        onSavePreferences={handleSaveCookiePrefs}
        onOpenLegal={(docType) => setLegalModalDoc(docType)}
        onDismiss={() => setCookieBannerVisible(false)}
      />
    </div>
  );
}
