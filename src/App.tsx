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
import { useCallback, useEffect, useRef, useState } from 'react';
import firestoreRulesRaw from '../firestore.rules?raw';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginView } from './components/AdminLoginView';
import { BlogModal } from './components/BlogModal';
import { ClientLoginView } from './components/ClientLoginView';
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

function resolveViewFromPath(pathname: string): AppView {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/admin') return 'admin';
  if (clean === '/portal') return 'portal';
  if (clean === '/services') return 'services';
  return 'public';
}

function viewToPath(view: AppView): string {
  switch (view) {
    case 'admin':
      return '/admin';
    case 'portal':
      return '/portal';
    case 'services':
      return '/services';
    default:
      return '/';
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isDelegatedAdmin, setIsDelegatedAdmin] = useState(false);

  const [activeView, setActiveView] = useState<AppView>(() =>
    resolveViewFromPath(typeof window !== 'undefined' ? window.location.pathname : '/'),
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | ListingCategory>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [submitListingOpen, setSubmitListingOpen] = useState(false);
  const [legalModalDoc, setLegalModalDoc] = useState<LegalDocType | null>(null);
  const [clientAuthModalOpen, setClientAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authPromptResolverRef = useRef<((u: User | null) => void) | null>(null);

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
  const [clients, setClients] = useState<UserProfile[]>([]);

  const isAdmin =
    Boolean(
      user &&
        user.emailVerified &&
        user.email === BOOTSTRAPPED_ADMIN_EMAIL,
    ) || isDelegatedAdmin;

  const navigateView = useCallback((view: AppView) => {
    setActiveView(view);
    const nextPath = viewToPath(view);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setActiveView(resolveViewFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (activeView === 'admin') {
      document.title = `Admin Console | ${siteContent.brandName}`;
    } else if (activeView === 'portal') {
      document.title = `Client Portal | ${siteContent.brandName}`;
    } else if (activeView === 'services') {
      document.title = `Services — Hospitality, Real Estate, OTA Optimization & Tech | ${siteContent.brandName}`;
    } else {
      document.title = `${siteContent.brandName} | Hospitality Management, Enugu Shortlets, Real Estate & Tech Solutions`;
    }
  }, [activeView, siteContent.brandName]);

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
        setClients([]);
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
    let unsubClients: (() => void) | undefined;
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
      unsubClients = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as UserProfile);
          items.sort((a, b) => a.displayName.localeCompare(b.displayName));
          setClients(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        },
      );
    } else {
      setAdmins([]);
      setClients([]);
    }

    return () => {
      unsubBookings();
      unsubInquiries();
      unsubSubmissions();
      unsubAdmins?.();
      unsubClients?.();
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

  const requireClientAuth = useCallback(async (): Promise<User | null> => {
    if (user) return user;
    return new Promise<User | null>((resolve) => {
      authPromptResolverRef.current = resolve;
      setClientAuthModalOpen(true);
    });
  }, [user]);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    navigateView('public');
  }, [navigateView]);

  const handleOpenPortal = useCallback(() => {
    navigateView('portal');
  }, [navigateView]);

  const handleOpenAdmin = useCallback(() => {
    navigateView('admin');
  }, [navigateView]);

  const handleNavigateSection = useCallback(
    (sectionId: string) => {
      if (sectionId === 'shortlets') {
        setActiveCategoryFilter('shortlet');
      } else if (sectionId === 'properties') {
        setActiveCategoryFilter('all');
      }

      if (activeView !== 'public') {
        navigateView('public');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [activeView, navigateView],
  );

  const handleToggleSave = useCallback(
    async (listingId: string) => {
      const activeUser = user || (await requireClientAuth());
      if (!activeUser) return;
      await toggleSavedListing(activeUser, userProfile, listingId);
    },
    [user, userProfile, requireClientAuth],
  );

  const handleOpenServicePage = useCallback(
    (serviceId = 'all') => {
      setSelectedServiceId(serviceId);
      navigateView('services');
    },
    [navigateView],
  );

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
        logoUrl={siteContent.logoUrl}
        user={user}
        activeView={activeView}
        onNavigateSection={handleNavigateSection}
        onOpenServices={() => handleOpenServicePage('all')}
        onOpenPortal={handleOpenPortal}
        onOpenAdmin={handleOpenAdmin}
        onGoHome={() => navigateView('public')}
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
          onRequireAuth={requireClientAuth}
          onOpenPortal={handleOpenPortal}
          onOpenAdmin={handleOpenAdmin}
          onOpenSubmitListing={() => setSubmitListingOpen(true)}
          onOpenServicePage={handleOpenServicePage}
          onOpenLegal={(docType) => setLegalModalDoc(docType)}
          onOpenCookieSettings={() => setCookieBannerVisible(true)}
          onGoHome={() => navigateView('public')}
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
          onGoHome={() => navigateView('public')}
          onOpenListings={() => handleNavigateSection('properties')}
          onOpenSubmitListing={() => setSubmitListingOpen(true)}
          onOpenPortal={handleOpenPortal}
          onOpenAdmin={handleOpenAdmin}
          onRequireAuth={requireClientAuth}
          onOpenLegal={(docType) => setLegalModalDoc(docType)}
          onOpenCookieSettings={() => setCookieBannerVisible(true)}
        />
      )}

      {activeView === 'portal' &&
        (user ? (
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
            onOpenAdmin={handleOpenAdmin}
            onOpenSubmitListing={() => setSubmitListingOpen(true)}
            onBackToSite={() => navigateView('public')}
            onSignOut={handleSignOut}
          />
        ) : (
          <ClientLoginView
            brandName={siteContent.brandName}
            logoUrl={siteContent.logoUrl}
            onGoogleSignIn={handleSignIn}
            onGoHome={() => navigateView('public')}
          />
        ))}

      {activeView === 'admin' &&
        (user && isAdmin ? (
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
            clients={clients}
            hasLiveDb={hasLiveDb}
            firestoreRulesText={firestoreRulesRaw}
            onBackToSite={() => navigateView('public')}
            onOpenPortal={handleOpenPortal}
            onSignOut={handleSignOut}
          />
        ) : (
          <AdminLoginView
            brandName={siteContent.brandName}
            logoUrl={siteContent.logoUrl}
            user={user}
            isAdmin={isAdmin}
            onGoogleSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onOpenPortal={handleOpenPortal}
            onGoHome={() => navigateView('public')}
          />
        ))}

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          user={user}
          isSaved={(userProfile?.savedListingIds ?? []).includes(selectedListing.id)}
          onClose={() => setSelectedListing(null)}
          onToggleSave={handleToggleSave}
          onRequireAuth={requireClientAuth}
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
          onRequireAuth={requireClientAuth}
          onOpenPortal={handleOpenPortal}
        />
      )}

      {clientAuthModalOpen && (
        <ClientLoginView
          brandName={siteContent.brandName}
          logoUrl={siteContent.logoUrl}
          isModal
          onGoogleSignIn={handleSignIn}
          onSuccess={(signedUser) => {
            setClientAuthModalOpen(false);
            authPromptResolverRef.current?.(signedUser);
            authPromptResolverRef.current = null;
          }}
          onCancel={() => {
            setClientAuthModalOpen(false);
            authPromptResolverRef.current?.(null);
            authPromptResolverRef.current = null;
          }}
          onGoHome={() => {
            setClientAuthModalOpen(false);
            authPromptResolverRef.current?.(null);
            authPromptResolverRef.current = null;
            navigateView('public');
          }}
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
