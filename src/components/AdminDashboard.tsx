import { sendPasswordResetEmail, type User } from 'firebase/auth';
import {
  BedDouble,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CloudUpload,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileEdit,
  Home,
  Image as ImageIcon,
  ImagePlus,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ASSET_IMAGE_PRESETS,
  BOOTSTRAPPED_ADMIN_EMAIL,
  formatNaira,
  LOGO_ASSET_PATH,
} from '../data/seedData';
import { downloadCloudflareBundle } from '../lib/exportCloudflareBundle';
import { auth } from '../lib/firebase';
import {
  addAdminMember,
  approveAndPublishSubmission,
  createClientAccountAsAdmin,
  deleteBlogPost,
  deleteBookingAsAdmin,
  deleteInquiryAsAdmin,
  deleteListing,
  deleteListingSubmission,
  deleteService,
  deleteUserProfileAsAdmin,
  getStatusLabel,
  rejectListingSubmission,
  removeAdminMember,
  saveSiteContent,
  seedInitialDatabase,
  updateBookingAsAdmin,
  updateInquiryAsAdmin,
  updateUserProfile,
  upsertBlogPost,
  upsertListing,
  upsertService,
} from '../lib/firestoreService';
import {
  compressImageFileToDataUrl,
  countWords,
  formatBlogDate,
  readSmallVideoFileToDataUrl,
  slugify,
} from '../lib/mediaUtils';
import type {
  AdminMember,
  BlogCategory,
  BlogPost,
  Booking,
  BookingStatus,
  Inquiry,
  InquiryStatus,
  Listing,
  ListingCategory,
  ListingStatus,
  ListingSubmission,
  PriceUnit,
  PropertyType,
  ServiceDivision,
  ServiceOffering,
  ShortletRoom,
  SiteContent,
  UserProfile,
} from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  user: User;
  siteContent: SiteContent;
  listings: Listing[];
  services: ServiceOffering[];
  posts: BlogPost[];
  bookings: Booking[];
  inquiries: Inquiry[];
  submissions: ListingSubmission[];
  admins: AdminMember[];
  clients: UserProfile[];
  hasLiveDb: boolean;
  firestoreRulesText: string;
  onBackToSite: () => void;
  onOpenPortal: () => void;
  onSignOut: () => Promise<void>;
}

type AdminTab =
  | 'overview'
  | 'cms'
  | 'listings'
  | 'submissions'
  | 'blog'
  | 'services'
  | 'bookings'
  | 'inquiries'
  | 'clients'
  | 'admins'
  | 'cloudflare';

function statusBadgeStyle(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'checked-in':
    case 'completed':
    case 'available':
    case 'responded':
    case 'approved':
      return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    case 'pending':
    case 'reserved':
    case 'new':
    case 'in-review':
      return 'text-amber-800 bg-amber-50 border-amber-200';
    case 'cancelled':
    case 'sold':
    case 'maintenance':
    case 'closed':
    case 'rejected':
      return 'text-red-800 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-100 border-slate-200';
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = 'PC-';
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function AdminDashboard({
  user,
  siteContent,
  listings,
  services,
  posts,
  bookings,
  inquiries,
  submissions,
  admins,
  clients,
  hasLiveDb,
  firestoreRulesText,
  onBackToSite,
  onOpenPortal,
  onSignOut,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // CMS Form State & Sitewide Image Drafts
  const [cmsForm, setCmsForm] = useState<SiteContent>(siteContent);
  const [serviceImageDrafts, setServiceImageDrafts] = useState<Record<string, string>>({});
  const [postImageDrafts, setPostImageDrafts] = useState<Record<string, string>>({});

  // Listing Editor State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isNewListing, setIsNewListing] = useState(false);
  const [amenitiesText, setAmenitiesText] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [roomGalleryInputs, setRoomGalleryInputs] = useState<Record<string, string>>({});

  // Blog Editor State
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [newPostGalleryUrl, setNewPostGalleryUrl] = useState('');

  // Service Editor State
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [deliverablesText, setDeliverablesText] = useState('');

  // Booking filter
  const [bookingFilter, setBookingFilter] = useState<'all' | BookingStatus>('all');

  // Inquiry reply state
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, InquiryStatus>>({});

  // Submission notes state
  const [submissionNotes, setSubmissionNotes] = useState<Record<string, string>>({});

  // Clients & Logins provisioning state
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState(() => generateTempPassword());
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientSendVerify, setNewClientSendVerify] = useState(true);
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    uid: string;
    verificationSent: boolean;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [editingClient, setEditingClient] = useState<UserProfile | null>(null);

  // Admin add state
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  const showToast = (msg: string) => {
    setErrorBanner(null);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const showErr = (err: unknown) => {
    setErrorBanner(err instanceof Error ? err.message : 'Operation failed.');
  };

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q),
    );
  }, [clients, clientSearch]);

  const handleSeedDb = async () => {
    setBusyAction('seed');
    try {
      await seedInitialDatabase(user.uid);
      showToast('Live Firestore CMS synced with Richgates Hotels and Apartments (Enugu), services, and articles.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction('cms');
    try {
      const { id: _id, updatedAt: _u, updatedBy: _b, ...payload } = cmsForm;
      await saveSiteContent(payload, user.uid);
      showToast('Site CMS changes published live to Firestore.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  // --- Listing Editor Helpers ---
  const openNewListingEditor = () => {
    setIsNewListing(true);
    setAmenitiesText('24/7 Power & Fiber, Smart Keyless Access, Dedicated Concierge');
    setNewGalleryUrl('');
    setEditingListing({
      id: `residence-${Date.now()}`,
      title: '',
      category: 'shortlet',
      propertyType: 'Apartment',
      location: 'Enugu, Nigeria',
      address: '',
      priceNgn: 250000,
      priceUnit: 'night',
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 180,
      maxGuests: 4,
      summary: '',
      description: '',
      amenities: [],
      imageUrl: ASSET_IMAGE_PRESETS[2].url,
      galleryImages: [ASSET_IMAGE_PRESETS[2].url],
      videoUrl: '',
      rooms: [],
      featured: false,
      status: 'available',
      authorId: user.uid,
    });
  };

  const openEditListingEditor = (item: Listing) => {
    setIsNewListing(false);
    setAmenitiesText(item.amenities.join(', '));
    setNewGalleryUrl('');
    setEditingListing({
      ...item,
      galleryImages: item.galleryImages?.length ? [...item.galleryImages] : [item.imageUrl],
      videoUrl: item.videoUrl || '',
      rooms: item.rooms ? item.rooms.map((r) => ({ ...r })) : [],
    });
  };

  const handleImportListingImages = async (files: FileList | null) => {
    if (!files || !editingListing) return;
    try {
      const imported: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await compressImageFileToDataUrl(file);
        imported.push(dataUrl);
      }
      const nextGallery = [...(editingListing.galleryImages || []), ...imported].slice(0, 15);
      setEditingListing({
        ...editingListing,
        imageUrl: editingListing.imageUrl || nextGallery[0] || '',
        galleryImages: nextGallery,
      });
      showToast(`${imported.length} image(s) imported directly into listing gallery.`);
    } catch (err) {
      showErr(err);
    }
  };

  const handleImportListingVideo = async (files: FileList | null) => {
    if (!files?.[0] || !editingListing) return;
    try {
      const dataUrl = await readSmallVideoFileToDataUrl(files[0]);
      setEditingListing({ ...editingListing, videoUrl: dataUrl });
      showToast('Video clip imported directly.');
    } catch (err) {
      showErr(err);
    }
  };

  const handleAddRoom = () => {
    if (!editingListing) return;
    const nextRoom: ShortletRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: `Executive Suite ${(editingListing.rooms?.length || 0) + 1}`,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      pricePerNightNgn: editingListing.priceNgn || 180000,
      amenities: ['King Bed', 'Smart Keyless Lock', 'High-Speed Fiber'],
      galleryImages: [editingListing.imageUrl || ASSET_IMAGE_PRESETS[2].url],
      videoUrl: '',
      available: true,
    };
    setEditingListing({
      ...editingListing,
      rooms: [...(editingListing.rooms || []), nextRoom],
    });
  };

  const updateRoom = (roomId: string, patch: Partial<ShortletRoom>) => {
    if (!editingListing) return;
    setEditingListing({
      ...editingListing,
      rooms: (editingListing.rooms || []).map((r) =>
        r.id === roomId ? { ...r, ...patch } : r,
      ),
    });
  };

  const removeRoom = (roomId: string) => {
    if (!editingListing) return;
    setEditingListing({
      ...editingListing,
      rooms: (editingListing.rooms || []).filter((r) => r.id !== roomId),
    });
  };

  const handleImportRoomImages = async (roomId: string, files: FileList | null) => {
    if (!files || !editingListing) return;
    try {
      const imported: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await compressImageFileToDataUrl(file);
        imported.push(dataUrl);
      }
      const target = editingListing.rooms.find((r) => r.id === roomId);
      if (!target) return;
      updateRoom(roomId, {
        galleryImages: [...(target.galleryImages || []), ...imported].slice(0, 10),
      });
      showToast(`Imported ${imported.length} photo(s) into room gallery.`);
    } catch (err) {
      showErr(err);
    }
  };

  const handleImportRoomVideo = async (roomId: string, files: FileList | null) => {
    if (!files?.[0] || !editingListing) return;
    try {
      const dataUrl = await readSmallVideoFileToDataUrl(files[0]);
      updateRoom(roomId, { videoUrl: dataUrl });
      showToast('Room video clip imported.');
    } catch (err) {
      showErr(err);
    }
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    setBusyAction('listing');
    try {
      const parsedAmenities = amenitiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await upsertListing(
        {
          ...editingListing,
          amenities: parsedAmenities,
        },
        user.uid,
        isNewListing,
      );
      setEditingListing(null);
      showToast(isNewListing ? 'Property created in Firestore.' : 'Property updated.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  // --- Blog Post Editor Helpers ---
  const openNewPostEditor = () => {
    setIsNewPost(true);
    setNewPostGalleryUrl('');
    setEditingPost({
      id: `post-${Date.now()}`,
      title: '',
      slug: '',
      category: 'Hospitality',
      authorName: 'PureCrest Editorial Desk',
      publishedDate: new Date().toISOString().slice(0, 10),
      excerpt: '',
      content: '',
      wordCount: 0,
      coverImageUrl: ASSET_IMAGE_PRESETS[0].url,
      galleryImages: [ASSET_IMAGE_PRESETS[0].url],
      videoUrl: '',
      published: true,
      authorId: user.uid,
    });
  };

  const openEditPostEditor = (post: BlogPost) => {
    setIsNewPost(false);
    setNewPostGalleryUrl('');
    setEditingPost({
      ...post,
      publishedDate: post.publishedDate || new Date().toISOString().slice(0, 10),
      galleryImages: post.galleryImages ? [...post.galleryImages] : [post.coverImageUrl],
      videoUrl: post.videoUrl || '',
    });
  };

  const handleImportPostCover = async (files: FileList | null) => {
    if (!files?.[0] || !editingPost) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(files[0]);
      setEditingPost({ ...editingPost, coverImageUrl: dataUrl });
      showToast('Blog cover image imported.');
    } catch (err) {
      showErr(err);
    }
  };

  const handleImportPostGallery = async (files: FileList | null) => {
    if (!files || !editingPost) return;
    try {
      const imported: string[] = [];
      for (const file of Array.from(files)) {
        imported.push(await compressImageFileToDataUrl(file));
      }
      setEditingPost({
        ...editingPost,
        galleryImages: [...(editingPost.galleryImages || []), ...imported].slice(0, 12),
      });
      showToast(`Imported ${imported.length} blog gallery image(s).`);
    } catch (err) {
      showErr(err);
    }
  };

  const handleImportPostVideo = async (files: FileList | null) => {
    if (!files?.[0] || !editingPost) return;
    try {
      const dataUrl = await readSmallVideoFileToDataUrl(files[0]);
      setEditingPost({ ...editingPost, videoUrl: dataUrl });
      showToast('Article video clip imported.');
    } catch (err) {
      showErr(err);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    const words = countWords(editingPost.content);
    if (editingPost.published && words < 1000) {
      setErrorBanner(
        `Published blog posts require a minimum of 1,000 words (currently ${words} words). Uncheck "Published" to save as a draft or expand your article.`,
      );
      return;
    }

    setBusyAction('blog');
    try {
      await upsertBlogPost(
        {
          ...editingPost,
          slug: editingPost.slug || slugify(editingPost.title),
          wordCount: words,
        },
        user.uid,
        isNewPost,
      );
      setEditingPost(null);
      showToast(isNewPost ? 'Blog article saved to Firestore.' : 'Blog article updated.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  // --- Service Editor Helpers ---
  const openNewServiceEditor = () => {
    setIsNewService(true);
    setDeliverablesText('Architecture & Discovery\nDeployment & Integration\n24/7 SLA Support');
    setEditingService({
      id: `svc-${Date.now()}`,
      title: '',
      division: 'technology',
      numberLabel: '01',
      tagline: '',
      description: '',
      deliverables: [],
      metricHighlight: 'PureCrest Division',
      imageUrl: ASSET_IMAGE_PRESETS[4].url,
      active: true,
      sortOrder: services.length + 1,
      authorId: user.uid,
    });
  };

  const openEditServiceEditor = (svc: ServiceOffering) => {
    setIsNewService(false);
    setDeliverablesText(svc.deliverables.join('\n'));
    setEditingService({ ...svc });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setBusyAction('service');
    try {
      const parsedDeliverables = deliverablesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      await upsertService(
        {
          ...editingService,
          deliverables: parsedDeliverables,
        },
        user.uid,
        isNewService,
      );
      setEditingService(null);
      showToast(isNewService ? 'Service offering published.' : 'Service offering updated.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return;
    setBusyAction('admin');
    try {
      await addAdminMember(
        {
          uid: newAdminUid.trim(),
          email: newAdminEmail.trim(),
          displayName: newAdminName.trim() || 'PureCrest Admin',
        },
        user.uid,
      );
      setNewAdminUid('');
      setNewAdminEmail('');
      setNewAdminName('');
      showToast('Administrator access granted.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadCloudflare = async () => {
    setBusyAction('export');
    try {
      await downloadCloudflareBundle({
        siteContent,
        listings,
        services,
        posts,
        firestoreRules: firestoreRulesText,
      });
      showToast('Cloudflare deployment & CMS snapshot bundle downloaded.');
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreateClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientEmail.trim() || !newClientPassword.trim()) return;
    setBusyAction('create-client');
    setCreatedCredentials(null);
    try {
      const created = await createClientAccountAsAdmin({
        displayName: newClientName.trim() || 'PureCrest Client',
        email: newClientEmail.trim(),
        password: newClientPassword,
        phone: newClientPhone.trim(),
        company: newClientCompany.trim(),
        sendVerification: newClientSendVerify,
      });
      setCreatedCredentials({
        email: created.email,
        password: newClientPassword,
        uid: created.uid,
        verificationSent: created.verificationSent,
      });
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientCompany('');
      setNewClientPassword(generateTempPassword());
      showToast(`Client login created for ${created.email}.`);
    } catch (err) {
      showErr(err);
    } finally {
      setBusyAction(null);
    }
  };

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cms', label: 'Site Content & Images', icon: FileEdit },
    { id: 'listings', label: 'Listings & Shortlets', icon: Building2 },
    { id: 'submissions', label: 'Submitted Listings', icon: Inbox },
    { id: 'blog', label: 'Journal / Blog', icon: BookOpen },
    { id: 'services', label: 'Services & Tech', icon: Layers },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'inquiries', label: 'Client Inquiries', icon: MessageSquare },
    { id: 'clients', label: 'Clients & Logins', icon: Users },
    { id: 'admins', label: 'Admins & Access', icon: Shield },
    { id: 'cloudflare', label: 'Cloudflare & Export', icon: CloudUpload },
  ];

  const activeNavLabel = navItems.find((i) => i.id === activeTab)?.label || 'Overview';
  const editingPostWordCount = editingPost ? countWords(editingPost.content) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col lg:flex-row">
      {/* 250px Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-[#064E3B]">
            Admin Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'cms') setCmsForm(siteContent);
                  setErrorBanner(null);
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#064E3B] text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#155E95]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 space-y-2 hidden lg:block">
          <div className="px-2 text-xs text-slate-500 truncate">{user.email}</div>
          <button
            type="button"
            onClick={onOpenPortal}
            className="w-full px-3 py-2 text-xs font-medium text-[#155E95] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-left cursor-pointer"
          >
            Switch to Client Portal
          </button>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="w-full px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0">
        {/* Top Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            <span>PureCrest CMS</span>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900">{activeNavLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={busyAction === 'seed'}
              onClick={() => void handleSeedDb()}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#E5A024] hover:bg-[#F3B13B] text-slate-950 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              {hasLiveDb ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>
                {busyAction === 'seed'
                  ? 'Syncing...'
                  : hasLiveDb
                    ? 'Sync Updated Defaults'
                    : 'Initialize Live Database'}
              </span>
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Homepage</span>
            </button>
          </div>
        </div>

        <div className="p-6 max-w-6xl space-y-6">
          {toastMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium rounded-lg">
              {toastMsg}
            </div>
          )}

          {errorBanner && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-medium rounded-lg flex items-center justify-between gap-3">
              <span>{errorBanner}</span>
              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                className="underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {!hasLiveDb && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-amber-950">
                  Firestore CMS Collections Ready to Initialize
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Click Seed Firestore Now to write initial pages, multi-room shortlets, services, and 1,000+ word blog posts into your live Firestore database.
                </p>
              </div>
              <button
                type="button"
                disabled={busyAction === 'seed'}
                onClick={() => void handleSeedDb()}
                className="px-4 py-2 text-xs font-semibold bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                {busyAction === 'seed' ? 'Seeding...' : 'Seed Firestore Now'}
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    PureCrest Operations Console
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Manage site copy, property &amp; Richgates shortlet inventory, service pages, editorial articles, and client bookings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('listings')}
                    className="px-3.5 py-2 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg cursor-pointer"
                  >
                    Manage Properties
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="px-3.5 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                  >
                    Manage Services
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-slate-900">
                    Recent Bookings Queue
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-medium text-[#155E95] hover:underline cursor-pointer"
                  >
                    Manage All
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No customer bookings submitted yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-6 font-medium">Ref</th>
                          <th className="py-2.5 px-4 font-medium">Guest</th>
                          <th className="py-2.5 px-4 font-medium">Property / Suite</th>
                          <th className="py-2.5 px-4 font-medium">Check-In</th>
                          <th className="py-2.5 px-4 font-medium text-right">Amount</th>
                          <th className="py-2.5 px-6 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.slice(0, 6).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="py-3 px-6 font-mono font-semibold text-slate-900 tabular-nums">
                              {b.referenceCode}
                            </td>
                            <td className="py-3 px-4 text-slate-700">{b.userName}</td>
                            <td className="py-3 px-4 text-slate-900 font-medium">{b.listingTitle}</td>
                            <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                              {b.checkInDate}
                            </td>
                            <td className="py-3 px-4 font-mono text-right text-slate-900 tabular-nums">
                              {b.bookingType === 'shortlet' ? formatNaira(b.totalNgn) : 'Inspection'}
                            </td>
                            <td className="py-3 px-6">
                              <span
                                className={`inline-block px-2 py-0.5 border rounded-md font-medium ${statusBadgeStyle(b.status)}`}
                              >
                                {getStatusLabel(b.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SITE CONTENT & HOMEPAGE / SITEWIDE IMAGES MANAGER */}
          {activeTab === 'cms' && (
            <form
              onSubmit={handleSaveCms}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      Full-Site CMS &amp; Image Manager
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Replace homepage hero, site logo, services banner, section cards, copy, and contact details across www.purecrest.ng.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={busyAction === 'cms'}
                    className="px-5 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {busyAction === 'cms' ? 'Publishing...' : 'Publish Site Changes'}
                  </button>
                </div>

                {/* Homepage & Sitewide Images Replacement Panel */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#064E3B]" />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Homepage &amp; Sitewide Image Replacement
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Upload custom photos directly, paste image URLs, or pick presets for any image across the site.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Logo, Homepage Hero, Services Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Brand Logo */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                      <div className="text-xs font-semibold text-slate-900">
                        Header &amp; Footer Logo
                      </div>
                      <div className="h-24 rounded-md bg-[#064E3B] border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={cmsForm.logoUrl || LOGO_ASSET_PATH}
                          alt="Brand logo preview"
                          className="max-h-14 w-auto object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Logo URL (leave empty for default)"
                        value={cmsForm.logoUrl || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, logoUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-md inline-flex items-center justify-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await compressImageFileToDataUrl(f, 600, 0.85);
                              setCmsForm({ ...cmsForm, logoUrl: url });
                              showToast('Brand logo loaded — click Publish Site Changes to apply live.');
                            }}
                          />
                        </label>
                        {cmsForm.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setCmsForm({ ...cmsForm, logoUrl: '' })}
                            className="px-2.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Homepage Hero Image */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                      <div className="text-xs font-semibold text-slate-900">
                        Homepage Hero Image
                      </div>
                      <div className="h-24 rounded-md bg-slate-100 border border-slate-200 overflow-hidden">
                        <ResilientImage
                          src={cmsForm.heroImageUrl}
                          alt="Homepage hero preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Hero image URL..."
                        value={cmsForm.heroImageUrl}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, heroImageUrl: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-md inline-flex items-center justify-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Hero</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await compressImageFileToDataUrl(f);
                              setCmsForm({ ...cmsForm, heroImageUrl: url });
                              showToast('Homepage hero image loaded — click Publish Site Changes to save.');
                            }}
                          />
                        </label>
                        <select
                          aria-label="Hero preset"
                          value={
                            ASSET_IMAGE_PRESETS.some((p) => p.url === cmsForm.heroImageUrl)
                              ? cmsForm.heroImageUrl
                              : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              setCmsForm({ ...cmsForm, heroImageUrl: e.target.value });
                            }
                          }}
                          className="w-28 px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white"
                        >
                          <option value="">Preset</option>
                          {ASSET_IMAGE_PRESETS.map((preset) => (
                            <option key={preset.url} value={preset.url}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Services Page Banner Image */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                      <div className="text-xs font-semibold text-slate-900">
                        Services Page Banner Image
                      </div>
                      <div className="h-24 rounded-md bg-slate-100 border border-slate-200 overflow-hidden">
                        <ResilientImage
                          src={cmsForm.servicesHeroImageUrl || ASSET_IMAGE_PRESETS[0].url}
                          alt="Services banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Services banner URL..."
                        value={cmsForm.servicesHeroImageUrl || ''}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, servicesHeroImageUrl: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-md inline-flex items-center justify-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Banner</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await compressImageFileToDataUrl(f);
                              setCmsForm({ ...cmsForm, servicesHeroImageUrl: url });
                              showToast('Services banner loaded — click Publish Site Changes to save.');
                            }}
                          />
                        </label>
                        <select
                          aria-label="Services banner preset"
                          value={
                            ASSET_IMAGE_PRESETS.some(
                              (p) => p.url === (cmsForm.servicesHeroImageUrl || ''),
                            )
                              ? cmsForm.servicesHeroImageUrl || ''
                              : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              setCmsForm({ ...cmsForm, servicesHeroImageUrl: e.target.value });
                            }
                          }}
                          className="w-28 px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white"
                        >
                          <option value="">Preset</option>
                          {ASSET_IMAGE_PRESETS.map((preset) => (
                            <option key={preset.url} value={preset.url}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quick Service Card Images */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-900">
                      Homepage Service Division Card Images
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {services.map((svc) => {
                        const draftImg = serviceImageDrafts[svc.id] ?? svc.imageUrl;
                        return (
                          <div
                            key={svc.id}
                            className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="w-20 h-14 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <ResilientImage
                                src={draftImg}
                                alt={svc.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {svc.title}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={draftImg}
                                  onChange={(e) =>
                                    setServiceImageDrafts({
                                      ...serviceImageDrafts,
                                      [svc.id]: e.target.value,
                                    })
                                  }
                                  className="flex-1 min-w-0 px-2 py-1 text-[11px] border border-slate-200 rounded"
                                />
                                <label className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 rounded cursor-pointer shrink-0">
                                  Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0];
                                      if (!f) return;
                                      const url = await compressImageFileToDataUrl(f);
                                      setServiceImageDrafts({
                                        ...serviceImageDrafts,
                                        [svc.id]: url,
                                      });
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  disabled={busyAction === `svc-img-${svc.id}`}
                                  onClick={async () => {
                                    setBusyAction(`svc-img-${svc.id}`);
                                    try {
                                      await upsertService(
                                        { ...svc, imageUrl: draftImg },
                                        user.uid,
                                        false,
                                      );
                                      showToast(`Updated image for ${svc.title}.`);
                                    } catch (err) {
                                      showErr(err);
                                    } finally {
                                      setBusyAction(null);
                                    }
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-[#064E3B] text-white rounded cursor-pointer shrink-0"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Journal Cover Images */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-900">
                      Homepage Journal Cover Images
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {posts.map((post) => {
                        const draftImg = postImageDrafts[post.id] ?? post.coverImageUrl;
                        return (
                          <div
                            key={post.id}
                            className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="w-20 h-14 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <ResilientImage
                                src={draftImg}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {post.title}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={draftImg}
                                  onChange={(e) =>
                                    setPostImageDrafts({
                                      ...postImageDrafts,
                                      [post.id]: e.target.value,
                                    })
                                  }
                                  className="flex-1 min-w-0 px-2 py-1 text-[11px] border border-slate-200 rounded"
                                />
                                <label className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 rounded cursor-pointer shrink-0">
                                  Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0];
                                      if (!f) return;
                                      const url = await compressImageFileToDataUrl(f);
                                      setPostImageDrafts({
                                        ...postImageDrafts,
                                        [post.id]: url,
                                      });
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  disabled={busyAction === `post-img-${post.id}`}
                                  onClick={async () => {
                                    setBusyAction(`post-img-${post.id}`);
                                    try {
                                      await upsertBlogPost(
                                        { ...post, coverImageUrl: draftImg },
                                        user.uid,
                                        false,
                                      );
                                      showToast(`Updated cover image for "${post.title}".`);
                                    } catch (err) {
                                      showErr(err);
                                    } finally {
                                      setBusyAction(null);
                                    }
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-[#064E3B] text-white rounded cursor-pointer shrink-0"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Brand Wordmark
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={cmsForm.brandName}
                      onChange={(e) => setCmsForm({ ...cmsForm, brandName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Top Announcement Banner (leave blank to hide)
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={cmsForm.announcementBanner}
                      onChange={(e) =>
                        setCmsForm({ ...cmsForm, announcementBanner: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-900">Hero Copy &amp; Buttons</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hero Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={cmsForm.heroEyebrow}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroEyebrow: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={cmsForm.heroTitle}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hero Subtitle
                    </label>
                    <textarea
                      rows={3}
                      required
                      maxLength={400}
                      value={cmsForm.heroSubtitle}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Primary CTA Label
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={cmsForm.heroPrimaryCta}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, heroPrimaryCta: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Secondary CTA Label
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={cmsForm.heroSecondaryCta}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, heroSecondaryCta: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-900">About &amp; Contact</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Divisions Headline
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={cmsForm.aboutHeadline}
                      onChange={(e) => setCmsForm({ ...cmsForm, aboutHeadline: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Divisions Narrative
                    </label>
                    <textarea
                      rows={3}
                      required
                      maxLength={1200}
                      value={cmsForm.aboutBody}
                      onChange={(e) => setCmsForm({ ...cmsForm, aboutBody: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        maxLength={120}
                        value={cmsForm.contactEmail}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, contactEmail: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        value={cmsForm.contactPhone}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, contactPhone: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Office Address
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={240}
                        value={cmsForm.officeAddress}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, officeAddress: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Hours (Monday – Friday)
                      </label>
                      <input
                        type="text"
                        maxLength={80}
                        value={cmsForm.officeHoursWeekday ?? '8:00 AM – 6:00 PM'}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, officeHoursWeekday: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Hours (Saturday)
                      </label>
                      <input
                        type="text"
                        maxLength={80}
                        value={cmsForm.officeHoursSaturday ?? '9:00 AM – 4:00 PM'}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, officeHoursSaturday: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Hours (Sunday)
                      </label>
                      <input
                        type="text"
                        maxLength={80}
                        value={cmsForm.officeHoursSunday ?? 'By Appointment'}
                        onChange={(e) =>
                          setCmsForm({ ...cmsForm, officeHoursSunday: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* LISTINGS & MULTI-ROOM SHORTLETS TAB */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Property Listings, Multi-Room Shortlets &amp; Media
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage properties, multiple rooms with amenities, image galleries, video URLs, and direct file imports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewListingEditor}
                  className="px-4 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              </div>

              {editingListing && (
                <form
                  onSubmit={handleSaveListing}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {isNewListing ? 'Create New Listing' : `Edit: ${editingListing.title}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        minLength={3}
                        maxLength={140}
                        value={editingListing.title}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, title: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={editingListing.category}
                        onChange={(e) => {
                          const cat = e.target.value as ListingCategory;
                          const unit: PriceUnit =
                            cat === 'shortlet' ? 'night' : cat === 'lease' ? 'year' : 'total';
                          setEditingListing({
                            ...editingListing,
                            category: cat,
                            priceUnit: unit,
                          });
                        }}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="shortlet">Shortlet</option>
                        <option value="sale">For Sale</option>
                        <option value="lease">For Lease</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={editingListing.propertyType}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            propertyType: e.target.value as PropertyType,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="Penthouse">Penthouse</option>
                        <option value="Villa">Villa</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Location (District, City)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingListing.location}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, location: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Base Price (NGN)
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editingListing.priceNgn}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            priceNgn: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editingListing.status}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            status: e.target.value as ListingStatus,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Full Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={editingListing.address}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, address: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingListing.bedrooms}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            bedrooms: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingListing.bathrooms}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            bathrooms: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Area (sqm)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingListing.areaSqm}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            areaSqm: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* Direct Featured Cover Image Upload + Gallery */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-200">
                      <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                        <ResilientImage
                          src={editingListing.imageUrl || editingListing.galleryImages[0] || ''}
                          alt="Featured cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900">
                              Primary Property Cover Photo
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Shown on property cards and search results. Upload directly or paste URL.
                            </p>
                          </div>
                          <label className="px-3 py-1.5 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Cover Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                try {
                                  const dataUrl = await compressImageFileToDataUrl(f);
                                  const nextGallery = editingListing.galleryImages.includes(dataUrl)
                                    ? editingListing.galleryImages
                                    : [dataUrl, ...editingListing.galleryImages].slice(0, 15);
                                  setEditingListing({
                                    ...editingListing,
                                    imageUrl: dataUrl,
                                    galleryImages: nextGallery,
                                  });
                                  showToast('Property cover photo uploaded.');
                                } catch (err) {
                                  showErr(err);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Primary cover image URL (https://...)"
                          value={editingListing.imageUrl}
                          onChange={(e) =>
                            setEditingListing({ ...editingListing, imageUrl: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">
                          Property Gallery Images
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Add image URLs, choose presets, or direct-import photos from your computer.
                        </p>
                      </div>
                      <label className="px-3 py-1.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Direct Import Images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => void handleImportListingImages(e.target.files)}
                        />
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL (https://...) and click Add"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newGalleryUrl.trim()) return;
                          const next = [
                            ...(editingListing.galleryImages || []),
                            newGalleryUrl.trim(),
                          ].slice(0, 15);
                          setEditingListing({
                            ...editingListing,
                            imageUrl: editingListing.imageUrl || next[0],
                            galleryImages: next,
                          });
                          setNewGalleryUrl('');
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Add URL
                      </button>
                      <select
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const next = [
                            ...(editingListing.galleryImages || []),
                            e.target.value,
                          ].slice(0, 15);
                          setEditingListing({
                            ...editingListing,
                            imageUrl: editingListing.imageUrl || next[0],
                            galleryImages: next,
                          });
                        }}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="">+ Add Preset Photo</option>
                        {ASSET_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {(editingListing.galleryImages || []).map((imgUrl, idx) => {
                        const isCover = editingListing.imageUrl === imgUrl;
                        return (
                          <div
                            key={`${imgUrl.slice(0, 24)}-${idx}`}
                            className={`relative rounded-lg overflow-hidden border bg-white ${
                              isCover ? 'border-[#064E3B] ring-2 ring-[#064E3B]/30' : 'border-slate-200'
                            }`}
                          >
                            <div className="aspect-[4/3]">
                              <ResilientImage
                                src={imgUrl}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-1.5 flex items-center justify-between text-[11px]">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingListing({ ...editingListing, imageUrl: imgUrl })
                                }
                                className={`font-medium cursor-pointer ${
                                  isCover ? 'text-[#064E3B]' : 'text-[#155E95] hover:underline'
                                }`}
                              >
                                {isCover ? 'Cover' : 'Set Cover'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = editingListing.galleryImages.filter(
                                    (_, i) => i !== idx,
                                  );
                                  setEditingListing({
                                    ...editingListing,
                                    galleryImages: next,
                                    imageUrl:
                                      isCover ? next[0] || '' : editingListing.imageUrl,
                                  });
                                }}
                                aria-label="Delete gallery image"
                                className="text-red-700 hover:text-red-900 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Property Video URL & Direct Import */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <Video className="w-4 h-4 text-[#155E95]" />
                        <span>Property Video Tour (URL or Direct Import)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Direct Import Video</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            className="hidden"
                            onChange={(e) => void handleImportListingVideo(e.target.files)}
                          />
                        </label>
                        {editingListing.videoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingListing({ ...editingListing, videoUrl: '' })
                            }
                            className="px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            Clear Video
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="YouTube URL, Vimeo URL, or direct .mp4 video link"
                      value={editingListing.videoUrl}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, videoUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Multiple Rooms / Suites Manager */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <BedDouble className="w-4 h-4 text-[#064E3B]" />
                          <span>
                            Multiple Rooms / Suites ({editingListing.rooms?.length || 0})
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Configure individual bookable rooms/suites inside this shortlet with dedicated amenities, galleries, and video tours.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRoom}
                        className="px-3 py-1.5 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Room / Suite</span>
                      </button>
                    </div>

                    {(editingListing.rooms || []).length === 0 ? (
                      <div className="text-xs text-slate-500 py-3">
                        No separate room options configured. Guests will book the entire property at the base price.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(editingListing.rooms || []).map((room, rIdx) => (
                          <div
                            key={room.id}
                            className="p-4 bg-white border border-slate-200 rounded-lg space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-900">
                                Room {rIdx + 1}: {room.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={room.available}
                                    onChange={(e) =>
                                      updateRoom(room.id, { available: e.target.checked })
                                    }
                                  />
                                  <span>Available</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeRoom(room.id)}
                                  className="text-xs text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Room</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Room / Suite Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={room.name}
                                  onChange={(e) =>
                                    updateRoom(room.id, { name: e.target.value })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Rate / Night (₦)
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={0}
                                  value={room.pricePerNightNgn}
                                  onChange={(e) =>
                                    updateRoom(room.id, {
                                      pricePerNightNgn: Number(e.target.value),
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Beds / Baths
                                </label>
                                <div className="flex gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={room.bedrooms}
                                    onChange={(e) =>
                                      updateRoom(room.id, { bedrooms: Number(e.target.value) })
                                    }
                                    className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                                    title="Bedrooms"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    value={room.bathrooms}
                                    onChange={(e) =>
                                      updateRoom(room.id, { bathrooms: Number(e.target.value) })
                                    }
                                    className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                                    title="Bathrooms"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Max Guests
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={room.maxGuests}
                                  onChange={(e) =>
                                    updateRoom(room.id, { maxGuests: Number(e.target.value) })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                Room Amenities (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={room.amenities.join(', ')}
                                onChange={(e) =>
                                  updateRoom(room.id, {
                                    amenities: e.target.value
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                              />
                            </div>

                            {/* Room Gallery + Direct Import + Delete */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-slate-700">
                                  Room Gallery Images
                                </span>
                                <label className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 cursor-pointer">
                                  <ImagePlus className="w-3 h-3" />
                                  <span>Import Room Photos</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                      void handleImportRoomImages(room.id, e.target.files)
                                    }
                                  />
                                </label>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add room photo URL..."
                                  value={roomGalleryInputs[room.id] || ''}
                                  onChange={(e) =>
                                    setRoomGalleryInputs({
                                      ...roomGalleryInputs,
                                      [room.id]: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = (roomGalleryInputs[room.id] || '').trim();
                                    if (!url) return;
                                    updateRoom(room.id, {
                                      galleryImages: [...room.galleryImages, url].slice(0, 10),
                                    });
                                    setRoomGalleryInputs({
                                      ...roomGalleryInputs,
                                      [room.id]: '',
                                    });
                                  }}
                                  className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-200 rounded-md cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>

                              {room.galleryImages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {room.galleryImages.map((rImg, idx) => (
                                    <div
                                      key={`${rImg.slice(0, 20)}-${idx}`}
                                      className="relative w-20 h-14 rounded-md overflow-hidden border border-slate-200 group"
                                    >
                                      <ResilientImage
                                        src={rImg}
                                        alt={`${room.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateRoom(room.id, {
                                            galleryImages: room.galleryImages.filter(
                                              (_, i) => i !== idx,
                                            ),
                                          })
                                        }
                                        aria-label="Delete room image"
                                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-xs cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Room Video URL + Direct Import */}
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                              <input
                                type="text"
                                placeholder="Room Video URL (YouTube, Vimeo, MP4)"
                                value={room.videoUrl}
                                onChange={(e) =>
                                  updateRoom(room.id, { videoUrl: e.target.value })
                                }
                                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                              />
                              <label className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center justify-center gap-1 cursor-pointer shrink-0">
                                <Upload className="w-3 h-3" />
                                <span>Import Clip</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm"
                                  className="hidden"
                                  onChange={(e) =>
                                    void handleImportRoomVideo(room.id, e.target.files)
                                  }
                                />
                              </label>
                              {room.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => updateRoom(room.id, { videoUrl: '' })}
                                  className="text-[11px] text-red-700 hover:underline px-2 cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Property Amenities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={amenitiesText}
                      onChange={(e) => setAmenitiesText(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Short Summary (10-300 chars)
                    </label>
                    <input
                      type="text"
                      required
                      minLength={10}
                      maxLength={300}
                      value={editingListing.summary}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, summary: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Dossier Description (20+ chars)
                    </label>
                    <textarea
                      rows={3}
                      required
                      minLength={20}
                      maxLength={2500}
                      value={editingListing.description}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busyAction === 'listing'}
                      className="px-5 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                    >
                      {busyAction === 'listing' ? 'Saving...' : 'Save Property'}
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 font-medium">Title</th>
                        <th className="py-3 px-4 font-medium">Category</th>
                        <th className="py-3 px-4 font-medium">Rooms</th>
                        <th className="py-3 px-4 font-medium">Media</th>
                        <th className="py-3 px-4 font-medium text-right">Price</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-6 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {listings.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-6 font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-9 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <ResilientImage
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div>{item.title}</div>
                                <div className="text-slate-500 font-normal">{item.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-600">{item.category}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.rooms && item.rooms.length > 0 ? 'Multiple Suites' : 'Standard Unit'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            Gallery
                            {item.videoUrl ? ' · Video' : ''}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-right text-slate-900 tabular-nums">
                            {formatNaira(item.priceNgn)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 border rounded-md font-medium ${statusBadgeStyle(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right space-x-3">
                            <button
                              type="button"
                              onClick={() => openEditListingEditor(item)}
                              className="text-[#155E95] hover:underline font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteListing(item.id);
                                showToast('Listing removed.');
                              }}
                              className="text-red-700 hover:underline font-medium cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBMITTED LISTINGS MODERATION TAB */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Owner &amp; Partner Listing Submissions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review properties and shortlet apartments submitted by partners. Approve to publish directly into the live catalog.
                  </p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
                  No owner or partner listing submissions received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => {
                    const draftNote = submissionNotes[sub.id] ?? sub.adminNotes;
                    return (
                      <div
                        key={sub.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <ResilientImage
                                src={sub.imageUrl}
                                alt={sub.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="capitalize font-medium text-[#155E95]">
                                  {sub.category}
                                </span>
                                <span>·</span>
                                <span>{sub.propertyType}</span>
                                <span>·</span>
                                <span>{sub.location}</span>
                              </div>
                              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                                {sub.title}
                              </h3>
                              <div className="mt-1 text-xs text-slate-600">
                                Submitted by <span className="font-medium text-slate-900">{sub.ownerName}</span> ({sub.ownerEmail} · {sub.ownerPhone})
                              </div>
                              <div className="mt-1.5 font-mono text-xs text-slate-800 tabular-nums">
                                {formatNaira(sub.priceNgn)} / {sub.priceUnit} · {sub.bedrooms} Beds · {sub.bathrooms} Baths · {sub.areaSqm} sqm
                                {sub.rooms && sub.rooms.length > 0 ? ' · Multi-suite breakdown' : ''}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 text-xs font-medium border rounded-md self-start shrink-0 ${statusBadgeStyle(sub.status)}`}
                          >
                            {getStatusLabel(sub.status)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1">
                          <div className="font-medium text-slate-900">{sub.summary}</div>
                          <p className="text-slate-600 leading-relaxed">{sub.description}</p>
                          {sub.amenities.length > 0 && (
                            <div className="pt-1 text-slate-500">
                              Amenities: {sub.amenities.join(' · ')}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
                          <input
                            type="text"
                            placeholder="Reviewer feedback / inspection notes..."
                            value={draftNote}
                            onChange={(e) =>
                              setSubmissionNotes({
                                ...submissionNotes,
                                [sub.id]: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg"
                          />
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={busyAction === `sub-${sub.id}`}
                              onClick={async () => {
                                setBusyAction(`sub-${sub.id}`);
                                try {
                                  await approveAndPublishSubmission(sub, user.uid, draftNote);
                                  showToast(`"${sub.title}" approved and published live.`);
                                } catch (err) {
                                  showErr(err);
                                } finally {
                                  setBusyAction(null);
                                }
                              }}
                              className="px-3.5 py-2 text-xs font-medium bg-[#064E3B] hover:bg-emerald-950 text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {sub.status === 'approved' ? 'Re-Sync Live' : 'Approve & Publish Live'}
                              </span>
                            </button>
                            {sub.status !== 'rejected' && (
                              <button
                                type="button"
                                disabled={busyAction === `sub-${sub.id}`}
                                onClick={async () => {
                                  setBusyAction(`sub-${sub.id}`);
                                  try {
                                    await rejectListingSubmission(sub.id, draftNote);
                                    showToast(`Submission "${sub.title}" declined.`);
                                  } catch (err) {
                                    showErr(err);
                                  } finally {
                                    setBusyAction(null);
                                  }
                                }}
                                className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 hover:bg-red-50 text-red-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busyAction === `sub-${sub.id}`}
                              onClick={async () => {
                                setBusyAction(`sub-${sub.id}`);
                                try {
                                  await deleteListingSubmission(sub.id);
                                  showToast('Submission deleted.');
                                } catch (err) {
                                  showErr(err);
                                } finally {
                                  setBusyAction(null);
                                }
                              }}
                              aria-label={`Delete submission ${sub.title}`}
                              className="p-2 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* JOURNAL / BLOG CMS TAB */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Journal &amp; Blog CMS (Minimum 1,000 Words)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Author, edit, and publish long-form editorial articles with cover images, galleries, and video embeds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewPostEditor}
                  className="px-4 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Blog Post</span>
                </button>
              </div>

              {editingPost && (
                <form
                  onSubmit={handleSavePost}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {isNewPost ? 'Write New Editorial Post' : `Edit: ${editingPost.title}`}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border ${
                          editingPostWordCount >= 1000
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        {editingPostWordCount.toLocaleString()} / 1,000+ words
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingPost(null)}
                        className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Article Title
                      </label>
                      <input
                        type="text"
                        required
                        minLength={5}
                        maxLength={180}
                        value={editingPost.title}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            title: e.target.value,
                            slug: isNewPost ? slugify(e.target.value) : editingPost.slug,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={editingPost.category}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            category: e.target.value as BlogCategory,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="Hospitality">Hospitality</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="PropTech">PropTech</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Publication Date
                      </label>
                      <input
                        type="date"
                        required
                        value={
                          editingPost.publishedDate || new Date().toISOString().slice(0, 10)
                        }
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, publishedDate: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Cover Image (Preset, URL, or Direct Import)
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={
                            ASSET_IMAGE_PRESETS.some((p) => p.url === editingPost.coverImageUrl)
                              ? editingPost.coverImageUrl
                              : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              setEditingPost({ ...editingPost, coverImageUrl: e.target.value });
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="">Custom / Imported Cover</option>
                          {ASSET_IMAGE_PRESETS.map((p) => (
                            <option key={p.url} value={p.url}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <label className="px-3 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center gap-1 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => void handleImportPostCover(e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Article Summary / Excerpt (20-500 chars)
                    </label>
                    <textarea
                      rows={2}
                      required
                      minLength={20}
                      maxLength={500}
                      value={editingPost.excerpt}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, excerpt: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Full Article Content (separate paragraphs &amp; section headings with blank lines; min 1,000 words to publish)
                      </label>
                    </div>
                    <textarea
                      rows={14}
                      required
                      minLength={100}
                      maxLength={60000}
                      value={editingPost.content}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, content: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg leading-relaxed"
                    />
                  </div>

                  {/* Blog Inline Gallery + Direct Import */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        Article Gallery Images
                      </span>
                      <label className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Direct Import Images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => void handleImportPostGallery(e.target.files)}
                        />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste additional image URL..."
                        value={newPostGalleryUrl}
                        onChange={(e) => setNewPostGalleryUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newPostGalleryUrl.trim()) return;
                          setEditingPost({
                            ...editingPost,
                            galleryImages: [
                              ...editingPost.galleryImages,
                              newPostGalleryUrl.trim(),
                            ].slice(0, 12),
                          });
                          setNewPostGalleryUrl('');
                        }}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editingPost.galleryImages.map((img, idx) => (
                        <div
                          key={`${img.slice(0, 20)}-${idx}`}
                          className="relative w-24 h-16 rounded-md overflow-hidden border border-slate-200"
                        >
                          <ResilientImage
                            src={img}
                            alt={`Article image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPost({
                                ...editingPost,
                                galleryImages: editingPost.galleryImages.filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            aria-label="Remove blog image"
                            className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-xs cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blog Video URL + Direct Import */}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <input
                      type="text"
                      placeholder="Optional Video Briefing URL (YouTube, Vimeo, MP4)"
                      value={editingPost.videoUrl}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, videoUrl: e.target.value })
                      }
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg"
                    />
                    <label className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Video Clip</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={(e) => void handleImportPostVideo(e.target.files)}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingPost.published}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, published: e.target.checked })
                        }
                      />
                      <span>Published on Live Journal (requires 1,000+ words)</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingPost(null)}
                        className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={busyAction === 'blog'}
                        className="px-5 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                      >
                        {busyAction === 'blog' ? 'Saving...' : 'Save Blog Post'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <ResilientImage
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-[#155E95]">{post.category}</span> ·{' '}
                          <span>{formatBlogDate(post.publishedDate, post.createdAt)}</span> ·{' '}
                          <span>{post.published ? 'Published' : 'Draft'}</span>
                        </div>
                        <div className="mt-1 font-display font-bold text-slate-900">
                          {post.title}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          {post.excerpt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditPostEditor(post)}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-[#155E95] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteBlogPost(post.id);
                          showToast('Blog post deleted.');
                        }}
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVICES & TECH CMS TAB */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Hospitality, Real Estate &amp; Tech Services CMS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage service divisions, division tags, and deliverables shown across the website and dedicated service pages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewServiceEditor}
                  className="px-4 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              {editingService && (
                <form
                  onSubmit={handleSaveService}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                >
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {isNewService ? 'New Service Offering' : `Edit: ${editingService.title}`}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Service Title
                      </label>
                      <input
                        type="text"
                        required
                        minLength={3}
                        value={editingService.title}
                        onChange={(e) =>
                          setEditingService({ ...editingService, title: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Division
                      </label>
                      <select
                        value={editingService.division}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            division: e.target.value as ServiceDivision,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="hospitality">Hospitality Management</option>
                        <option value="real-estate">Real Estate Sales &amp; Leasing</option>
                        <option value="technology">Technology Solutions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Editorial Index (e.g. 01)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingService.numberLabel}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            numberLabel: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        required
                        minLength={5}
                        value={editingService.tagline}
                        onChange={(e) =>
                          setEditingService({ ...editingService, tagline: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Division Focus Label
                      </label>
                      <input
                        type="text"
                        required
                        value={editingService.metricHighlight}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            metricHighlight: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Description (20+ chars)
                    </label>
                    <textarea
                      rows={3}
                      required
                      minLength={20}
                      value={editingService.description}
                      onChange={(e) =>
                        setEditingService({ ...editingService, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Deliverables (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={deliverablesText}
                        onChange={(e) => setDeliverablesText(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Visual Image
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={
                              ASSET_IMAGE_PRESETS.some((p) => p.url === editingService.imageUrl)
                                ? editingService.imageUrl
                                : ''
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                setEditingService({
                                  ...editingService,
                                  imageUrl: e.target.value,
                                });
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="">Custom / Imported Image</option>
                            {ASSET_IMAGE_PRESETS.map((p) => (
                              <option key={p.url} value={p.url}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          <label className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer inline-flex items-center gap-1 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Import</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                const url = await compressImageFileToDataUrl(f);
                                setEditingService({ ...editingService, imageUrl: url });
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editingService.active}
                          onChange={(e) =>
                            setEditingService({ ...editingService, active: e.target.checked })
                          }
                        />
                        <span>Published on Live Website</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busyAction === 'service'}
                      className="px-5 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                    >
                      {busyAction === 'service' ? 'Saving...' : 'Save Service'}
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        {svc.numberLabel}. {svc.division} ·{' '}
                        <span className="font-mono text-[#B45309]">{svc.metricHighlight}</span> ·{' '}
                        <span>{svc.active ? 'Published' : 'Draft'}</span>
                      </div>
                      <div className="mt-1 font-display font-bold text-slate-900">{svc.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{svc.tagline}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditServiceEditor(svc)}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-[#155E95] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteService(svc.id);
                          showToast('Service offering removed.');
                        }}
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Delete ${svc.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKINGS OPERATIONS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Shortlet &amp; Inspection Bookings
                </h2>
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
                  {(['all', 'pending', 'confirmed', 'checked-in', 'completed', 'cancelled'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setBookingFilter(st)}
                        className={`px-3 py-1 text-xs font-medium rounded-md capitalize whitespace-nowrap cursor-pointer ${
                          bookingFilter === st
                            ? 'bg-[#064E3B] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st === 'all' ? 'All' : getStatusLabel(st)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {filteredBookings.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">
                    No bookings in this status category.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 font-medium">Ref</th>
                          <th className="py-3 px-4 font-medium">Client</th>
                          <th className="py-3 px-4 font-medium">Property / Suite</th>
                          <th className="py-3 px-4 font-medium">Dates</th>
                          <th className="py-3 px-4 font-medium text-right">Total</th>
                          <th className="py-3 px-4 font-medium">Status</th>
                          <th className="py-3 px-4 font-medium text-right">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                              {b.referenceCode}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-900">{b.userName}</div>
                              <div className="text-slate-500">{b.userPhone}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{b.listingTitle}</td>
                            <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                              {b.checkInDate}
                              {b.bookingType === 'shortlet' ? ` → ${b.checkOutDate}` : ''}
                            </td>
                            <td className="py-3 px-4 font-mono text-right font-semibold text-slate-900 tabular-nums">
                              {b.bookingType === 'shortlet' ? formatNaira(b.totalNgn) : 'Inspection'}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 border rounded-md font-medium ${statusBadgeStyle(b.status)}`}
                              >
                                {getStatusLabel(b.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <select
                                aria-label={`Change status for ${b.referenceCode}`}
                                value={b.status}
                                onChange={async (e) => {
                                  await updateBookingAsAdmin(b.id, {
                                    status: e.target.value as BookingStatus,
                                  });
                                  showToast(`Booking ${b.referenceCode} updated.`);
                                }}
                                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="checked-in">Checked In</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteBookingAsAdmin(b.id);
                                  showToast('Booking deleted.');
                                }}
                                className="text-red-700 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CLIENT INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Client Consultations &amp; Inquiries
              </h2>
              {inquiries.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
                  No consultation requests received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const currentStatus = statusDrafts[inq.id] ?? inq.status;
                    const currentReply = replyDrafts[inq.id] ?? inq.adminReply;
                    return (
                      <div
                        key={inq.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="font-display font-bold text-slate-900">
                              {inq.subject}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {inq.fullName} ({inq.email} · {inq.phone})
                              {inq.company ? ` · ${inq.company}` : ''} ·{' '}
                              <span className="capitalize">{inq.serviceDivision}</span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium border rounded-md ${statusBadgeStyle(inq.status)}`}
                          >
                            {getStatusLabel(inq.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {inq.message}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                          <div>
                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                setStatusDrafts({
                                  ...statusDrafts,
                                  [inq.id]: e.target.value as InquiryStatus,
                                })
                              }
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                            >
                              <option value="new">New</option>
                              <option value="in-review">In Review</option>
                              <option value="responded">Responded</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              placeholder="Write reply visible in client portal..."
                              value={currentReply}
                              onChange={(e) =>
                                setReplyDrafts({ ...replyDrafts, [inq.id]: e.target.value })
                              }
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await updateInquiryAsAdmin(inq.id, currentStatus, currentReply);
                                showToast('Inquiry response saved.');
                              }}
                              className="flex-1 px-3 py-2 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                            >
                              Save Reply
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteInquiryAsAdmin(inq.id);
                                showToast('Inquiry deleted.');
                              }}
                              className="p-2 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                              aria-label="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CLIENTS & LOGINS PROVISIONING TAB */}
          {activeTab === 'clients' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Create Client Login Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Create Client Login
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provision an Email &amp; Password account for a client or property owner to sign
                    in at <span className="font-mono text-[#155E95]">/portal</span> without signing
                    yourself out.
                  </p>
                </div>

                <form onSubmit={handleCreateClientLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Client Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Temporary Password (6+ chars) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewClientPassword(generateTempPassword())}
                        className="text-[11px] font-medium text-[#155E95] hover:underline cursor-pointer"
                      >
                        Generate New
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showClientPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newClientPassword}
                        onChange={(e) => setNewClientPassword(e.target.value)}
                        className="w-full pl-3 pr-9 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientPassword((v) => !v)}
                        aria-label={showClientPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showClientPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Company / Property
                      </label>
                      <input
                        type="text"
                        value={newClientCompany}
                        onChange={(e) => setNewClientCompany(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 pt-1">
                    <input
                      type="checkbox"
                      checked={newClientSendVerify}
                      onChange={(e) => setNewClientSendVerify(e.target.checked)}
                    />
                    <span>Send verification email to client upon creation</span>
                  </label>

                  <button
                    type="submit"
                    disabled={busyAction === 'create-client'}
                    className="w-full py-2.5 px-4 text-xs font-semibold bg-[#064E3B] hover:bg-emerald-950 disabled:bg-slate-300 text-white rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {busyAction === 'create-client'
                        ? 'Provisioning Login...'
                        : 'Create Client Login'}
                    </span>
                  </button>
                </form>

                {createdCredentials && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Client Login Created</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const txt = `PureCrest Client Portal Login\nPortal URL: ${window.location.origin}/portal\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
                          try {
                            await navigator.clipboard.writeText(txt);
                            setCopiedCreds(true);
                            setTimeout(() => setCopiedCreds(false), 2500);
                          } catch {
                            // Ignore clipboard error
                          }
                        }}
                        className="px-2 py-1 text-[11px] font-medium bg-white border border-emerald-300 rounded text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCreds ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Handoff</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-emerald-900 space-y-0.5">
                      <div>Portal: /portal</div>
                      <div>Email: {createdCredentials.email}</div>
                      <div>Password: {createdCredentials.password}</div>
                      <div>UID: {createdCredentials.uid}</div>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      {createdCredentials.verificationSent
                        ? 'Verification email dispatched so the client can verify and create bookings immediately.'
                        : 'Share these credentials with the client so they can sign in at /portal.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Client Directory */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">
                      Registered Clients ({clients.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Edit client contact info, send password reset links, or remove profiles.
                    </p>
                  </div>
                  <input
                    type="search"
                    placeholder="Filter clients..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48"
                  />
                </div>

                {editingClient && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBusyAction('edit-client');
                      try {
                        await updateUserProfile(editingClient.uid, {
                          displayName: editingClient.displayName,
                          phone: editingClient.phone,
                          company: editingClient.company,
                          savedListingIds: editingClient.savedListingIds || [],
                        });
                        setEditingClient(null);
                        showToast('Client profile updated.');
                      } catch (err) {
                        showErr(err);
                      } finally {
                        setBusyAction(null);
                      }
                    }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Edit Client: {editingClient.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingClient(null)}
                        className="text-xs text-slate-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={editingClient.displayName}
                        onChange={(e) =>
                          setEditingClient({ ...editingClient, displayName: e.target.value })
                        }
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={editingClient.phone}
                        onChange={(e) =>
                          setEditingClient({ ...editingClient, phone: e.target.value })
                        }
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={editingClient.company}
                        onChange={(e) =>
                          setEditingClient({ ...editingClient, company: e.target.value })
                        }
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busyAction === 'edit-client'}
                      className="px-4 py-1.5 text-xs font-medium bg-[#155E95] text-white rounded-md cursor-pointer"
                    >
                      Save Client Profile
                    </button>
                  </form>
                )}

                {filteredClients.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    No client accounts found yet. Create a client login on the left.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredClients.map((client) => (
                      <div
                        key={client.uid}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {client.displayName}
                          </div>
                          <div className="text-xs text-slate-600">
                            {client.email}
                            {client.phone ? ` · ${client.phone}` : ''}
                            {client.company ? ` · ${client.company}` : ''}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            UID: {client.uid}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingClient({ ...client })}
                            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-[#155E95] rounded-md cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await sendPasswordResetEmail(auth, client.email);
                                showToast(`Password reset email sent to ${client.email}.`);
                              } catch (err) {
                                showErr(err);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Reset Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteUserProfileAsAdmin(client.uid);
                              showToast(`Removed profile for ${client.email}.`);
                            }}
                            className="p-1.5 text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                            aria-label={`Remove ${client.email}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADMINS & ACCESS TAB */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              {/* /admin Login & Credentials Reference Card */}
              <div className="bg-[#064E3B] text-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F6C453]">
                    <KeyRound className="w-4 h-4" />
                    <span>Direct Admin Login Route &amp; Root Credentials</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    Login URL:{' '}
                    <a href="/admin" className="underline text-[#F6C453]">
                      /admin
                    </a>{' '}
                    · Root Email:{' '}
                    <span className="font-mono select-all">{BOOTSTRAPPED_ADMIN_EMAIL}</span>
                  </div>
                  <p className="text-xs text-emerald-100/85">
                    Your Signed-In Admin UID: <span className="font-mono">{user.uid}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Grant Admin Access
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add additional verified user UIDs to grant full CMS and operational access.
                  </p>
                  <form onSubmit={handleAddAdmin} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Firebase User UID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. XyZ91abc..."
                        value={newAdminUid}
                        onChange={(e) => setNewAdminUid(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="team@purecrest.ng"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Operations Lead"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busyAction === 'admin'}
                      className="w-full py-2 px-4 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Administrator</span>
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Active Administrators
                  </h2>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                    Primary Owner:{' '}
                    <span className="font-mono font-semibold">{BOOTSTRAPPED_ADMIN_EMAIL}</span>{' '}
                    (Bootstrapped Root Admin)
                  </div>
                  <div className="divide-y divide-slate-100">
                    {admins.length === 0 ? (
                      <div className="py-6 text-xs text-slate-500">
                        No delegated administrators added yet.
                      </div>
                    ) : (
                      admins.map((adm) => (
                        <div key={adm.uid} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {adm.displayName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {adm.email} · <span className="font-mono">{adm.uid}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              await removeAdminMember(adm.uid);
                              showToast('Admin access revoked.');
                            }}
                            className="text-xs font-medium text-red-700 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLOUDFLARE & EXPORT TAB */}
          {activeTab === 'cloudflare' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Cloudflare Pages Deployment &amp; Application Bundle
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Export a downloadable deployment bundle containing wrangler.jsonc, Cloudflare Pages headers/redirects, security rules, and live CMS JSON snapshots (including blog posts and room configurations).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyAction === 'export'}
                  onClick={() => void handleDownloadCloudflare()}
                  className="px-5 py-2.5 text-xs font-medium bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {busyAction === 'export'
                      ? 'Packaging ZIP...'
                      : 'Download Cloudflare Bundle (.zip)'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-semibold text-slate-900">
                    Included Production Artifacts
                  </div>
                  <ul className="space-y-1.5 text-slate-600 font-mono">
                    <li>wrangler.jsonc (Cloudflare Pages config)</li>
                    <li>public/_redirects (SPA routing fallback)</li>
                    <li>public/_headers (Security &amp; immutable cache)</li>
                    <li>firestore.rules (Zero-trust RBAC rules)</li>
                    <li>cms-snapshot/siteContent.json</li>
                    <li>cms-snapshot/listings.json</li>
                    <li>cms-snapshot/posts.json</li>
                    <li>cms-snapshot/services.json</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#064E3B] text-emerald-50 rounded-lg space-y-2 font-mono">
                  <div className="text-[#F6C453]"># Deploy to Cloudflare Pages</div>
                  <div>npm install</div>
                  <div>npm run build</div>
                  <div>npx wrangler pages deploy dist --project-name=purecrest-platform</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
