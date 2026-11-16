import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  DEFAULT_BLOG_POSTS,
  DEFAULT_LISTINGS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CONTENT,
  generateReferenceCode,
} from '../data/seedData';
import type {
  AdminMember,
  BlogPost,
  Booking,
  BookingStatus,
  BookingType,
  Inquiry,
  InquiryDivision,
  InquiryStatus,
  Listing,
  ListingSubmission,
  ServiceOffering,
  ShortletRoom,
  SiteContent,
  SubmissionStatus,
  UserProfile,
} from '../types/purecrest';
import { db, handleFirestoreError, OperationType, secondaryAuth } from './firebase';
import { countWords, slugify } from './mediaUtils';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 120);
  return cleaned || `item-${Date.now()}`;
}

function clampStr(val: string, maxLen: number): string {
  return (val ?? '').trim().slice(0, maxLen);
}

function sanitizeRoom(room: ShortletRoom, idx: number): ShortletRoom {
  return {
    id: sanitizeId(room.id || `room-${idx + 1}`),
    name: clampStr(room.name || `Suite ${idx + 1}`, 100),
    bedrooms: Math.max(0, Math.min(20, Number(room.bedrooms) || 1)),
    bathrooms: Math.max(0, Math.min(20, Number(room.bathrooms) || 1)),
    maxGuests: Math.max(1, Math.min(30, Number(room.maxGuests) || 2)),
    pricePerNightNgn: Math.max(0, Math.min(100000000, Number(room.pricePerNightNgn) || 0)),
    amenities: (room.amenities || [])
      .map((a) => clampStr(a, 60))
      .filter(Boolean)
      .slice(0, 15),
    galleryImages: (room.galleryImages || [])
      .map((u) => clampStr(u, 340000))
      .filter(Boolean)
      .slice(0, 10),
    videoUrl: clampStr(room.videoUrl || '', 690000),
    available: Boolean(room.available),
  };
}

export async function ensureUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        displayName: clampStr(user.displayName || user.email?.split('@')[0] || 'Client', 100),
        email: clampStr(user.email || '', 150),
        phone: '',
        company: '',
        savedListingIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createClientAccountAsAdmin(input: {
  displayName: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  sendVerification: boolean;
}): Promise<{ uid: string; email: string; verificationSent: boolean }> {
  const emailTrimmed = clampStr(input.email, 150).toLowerCase();
  const displayNameTrimmed = clampStr(input.displayName, 100) || 'PureCrest Client';
  let newUid = '';
  let verificationSent = false;

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      emailTrimmed,
      input.password,
    );
    newUid = cred.user.uid;
    await updateProfile(cred.user, { displayName: displayNameTrimmed });
    if (input.sendVerification) {
      try {
        await sendEmailVerification(cred.user);
        verificationSent = true;
      } catch {
        verificationSent = false;
      }
    }
    await firebaseSignOut(secondaryAuth);
  } catch (error: unknown) {
    try {
      await firebaseSignOut(secondaryAuth);
    } catch {
      // Ignore cleanup error
    }
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';
    if (code === 'auth/operation-not-allowed') {
      throw new Error(
        'Email/Password authentication is currently disabled in Firebase Console. Open Firebase Console → Authentication → Sign-in method → Enable Email/Password, then retry creating the client login.',
      );
    }
    if (code === 'auth/email-already-in-use') {
      throw new Error(
        `An account with ${emailTrimmed} already exists in Firebase Authentication. The client can sign in at /portal or reset their password.`,
      );
    }
    if (code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters long.');
    }
    throw error;
  }

  const path = `users/${newUid}`;
  try {
    await setDoc(doc(db, 'users', newUid), {
      uid: newUid,
      displayName: displayNameTrimmed,
      email: emailTrimmed,
      phone: clampStr(input.phone, 30),
      company: clampStr(input.company, 120),
      savedListingIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return { uid: newUid, email: emailTrimmed, verificationSent };
}

export async function updateUserProfile(
  uid: string,
  updates: { displayName: string; phone: string; company: string; savedListingIds: string[] },
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: clampStr(updates.displayName, 100) || 'Client',
      phone: clampStr(updates.phone, 30),
      company: clampStr(updates.company, 120),
      savedListingIds: updates.savedListingIds.slice(0, 50).map(sanitizeId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserProfileAsAdmin(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function toggleSavedListing(
  user: User,
  profile: UserProfile | null,
  listingId: string,
): Promise<string[]> {
  await ensureUserProfile(user);
  const current = profile?.savedListingIds ?? [];
  const exists = current.includes(listingId);
  const next = exists
    ? current.filter((id) => id !== listingId)
    : [...current, listingId].slice(0, 50);

  await updateUserProfile(user.uid, {
    displayName: profile?.displayName || user.displayName || 'Client',
    phone: profile?.phone || '',
    company: profile?.company || '',
    savedListingIds: next,
  });
  return next;
}

const OBSOLETE_DEMO_LISTING_IDS = [
  'richgates-apartments-abuja',
  'ikoyi-lagoon-penthouse',
  'vi-adeola-executive-suite',
  'ikoyi-travertine-villa',
  'vi-catalyst-commercial-floor',
  'maitama-diplomatic-residence',
  'lekki-phase1-waterfront-loft',
];

const OBSOLETE_DEMO_POST_IDS = [
  'investing-lagos-serviced-shortlets-2026',
];

export async function seedInitialDatabase(adminUid: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    const siteRef = doc(db, 'siteContent', 'main');
    const { id: _siteId, updatedAt: _siteUpdated, ...sitePayload } = DEFAULT_SITE_CONTENT;
    batch.set(siteRef, {
      ...sitePayload,
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });

    for (const obsoleteId of OBSOLETE_DEMO_LISTING_IDS) {
      batch.delete(doc(db, 'listings', obsoleteId));
    }

    for (const obsoletePostId of OBSOLETE_DEMO_POST_IDS) {
      batch.delete(doc(db, 'posts', obsoletePostId));
    }

    for (const listing of DEFAULT_LISTINGS) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = listing;
      batch.set(doc(db, 'listings', sanitizeId(id)), {
        ...rest,
        authorId: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const svc of DEFAULT_SERVICES) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = svc;
      batch.set(doc(db, 'services', sanitizeId(id)), {
        ...rest,
        authorId: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const post of DEFAULT_BLOG_POSTS) {
      const { id, createdAt: _c, updatedAt: _u, ...rest } = post;
      batch.set(doc(db, 'posts', sanitizeId(id)), {
        ...rest,
        authorId: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteContent/main');
  }
}

export async function saveSiteContent(
  content: Omit<SiteContent, 'id' | 'updatedAt' | 'updatedBy'>,
  adminUid: string,
): Promise<void> {
  const path = 'siteContent/main';
  try {
    await setDoc(doc(db, 'siteContent', 'main'), {
      sectionKey: 'main',
      brandName: clampStr(content.brandName, 60),
      logoUrl: clampStr(content.logoUrl || '', 340000),
      heroEyebrow: clampStr(content.heroEyebrow, 100),
      heroTitle: clampStr(content.heroTitle, 160),
      heroSubtitle: clampStr(content.heroSubtitle, 400),
      heroPrimaryCta: clampStr(content.heroPrimaryCta, 40),
      heroSecondaryCta: clampStr(content.heroSecondaryCta, 40),
      heroImageUrl: clampStr(content.heroImageUrl, 340000),
      servicesHeroImageUrl: clampStr(content.servicesHeroImageUrl || '', 340000),
      aboutHeadline: clampStr(content.aboutHeadline, 160),
      aboutBody: clampStr(content.aboutBody, 1200),
      statPropertiesManaged: clampStr(content.statPropertiesManaged, 40),
      statOccupancyRate: clampStr(content.statOccupancyRate, 40),
      statCitiesActive: clampStr(content.statCitiesActive, 40),
      statEnterpriseClients: clampStr(content.statEnterpriseClients, 40),
      contactEmail: clampStr(content.contactEmail, 120),
      contactPhone: clampStr(content.contactPhone, 40),
      officeAddress: clampStr(content.officeAddress, 240),
      announcementBanner: clampStr(content.announcementBanner || '', 200),
      officeHoursWeekday: clampStr(content.officeHoursWeekday || '8:00 AM – 6:00 PM', 80),
      officeHoursSaturday: clampStr(content.officeHoursSaturday || '9:00 AM – 4:00 PM', 80),
      officeHoursSunday: clampStr(content.officeHoursSunday || 'By Appointment', 80),
      updatedBy: adminUid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function upsertListing(
  listing: Omit<Listing, 'createdAt' | 'updatedAt' | 'authorId'>,
  adminUid: string,
  isNew: boolean,
): Promise<string> {
  const id = sanitizeId(listing.id || `${listing.category}-${Date.now()}`);
  const path = `listings/${id}`;
  const sanitizedGallery = (listing.galleryImages || [])
    .map((u) => clampStr(u, 340000))
    .filter(Boolean)
    .slice(0, 15);
  const coverImage = clampStr(listing.imageUrl, 340000) || sanitizedGallery[0] || '';

  const payload = {
    title: clampStr(listing.title, 140),
    category: listing.category,
    propertyType: listing.propertyType,
    location: clampStr(listing.location, 100),
    address: clampStr(listing.address, 200),
    priceNgn: Math.max(0, Math.min(50000000000, Number(listing.priceNgn) || 0)),
    priceUnit: listing.priceUnit,
    bedrooms: Math.max(0, Math.min(50, Number(listing.bedrooms) || 0)),
    bathrooms: Math.max(0, Math.min(50, Number(listing.bathrooms) || 0)),
    areaSqm: Math.max(0, Math.min(100000, Number(listing.areaSqm) || 0)),
    maxGuests: Math.max(0, Math.min(100, Number(listing.maxGuests) || 0)),
    summary: clampStr(listing.summary, 300),
    description: clampStr(listing.description, 2500),
    amenities: (listing.amenities || [])
      .map((a) => clampStr(a, 60))
      .filter(Boolean)
      .slice(0, 20),
    imageUrl: coverImage,
    galleryImages: sanitizedGallery,
    videoUrl: clampStr(listing.videoUrl || '', 690000),
    rooms: (listing.rooms || []).slice(0, 15).map(sanitizeRoom),
    featured: Boolean(listing.featured),
    status: listing.status,
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'listings', id), {
        ...payload,
        authorId: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'listings', id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteListing(id: string): Promise<void> {
  const path = `listings/${id}`;
  try {
    await deleteDoc(doc(db, 'listings', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitPropertyListing(
  input: {
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    title: string;
    category: Listing['category'];
    propertyType: Listing['propertyType'];
    location: string;
    address: string;
    priceNgn: number;
    priceUnit: Listing['priceUnit'];
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    maxGuests: number;
    summary: string;
    description: string;
    amenities: string[];
    imageUrl: string;
    galleryImages: string[];
    videoUrl: string;
    rooms: ShortletRoom[];
  },
  user: User,
): Promise<string> {
  const submissionId = sanitizeId(`sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const path = `listingSubmissions/${submissionId}`;
  const sanitizedGallery = (input.galleryImages || [])
    .map((u) => clampStr(u, 340000))
    .filter(Boolean)
    .slice(0, 15);
  const coverImage = clampStr(input.imageUrl, 340000) || sanitizedGallery[0] || '';

  try {
    await setDoc(doc(db, 'listingSubmissions', submissionId), {
      ownerUid: user.uid,
      ownerName: clampStr(input.ownerName || user.displayName || 'Property Owner', 100),
      ownerEmail: clampStr(input.ownerEmail || user.email || 'owner@purecrest.ng', 150),
      ownerPhone: clampStr(input.ownerPhone, 30),
      title: clampStr(input.title, 140),
      category: input.category,
      propertyType: input.propertyType,
      location: clampStr(input.location, 100),
      address: clampStr(input.address, 200),
      priceNgn: Math.max(0, Math.min(50000000000, Number(input.priceNgn) || 0)),
      priceUnit: input.priceUnit,
      bedrooms: Math.max(0, Math.min(50, Number(input.bedrooms) || 0)),
      bathrooms: Math.max(0, Math.min(50, Number(input.bathrooms) || 0)),
      areaSqm: Math.max(0, Math.min(100000, Number(input.areaSqm) || 0)),
      maxGuests: Math.max(0, Math.min(100, Number(input.maxGuests) || 0)),
      summary: clampStr(input.summary, 300),
      description: clampStr(input.description, 2500),
      amenities: (input.amenities || [])
        .map((a) => clampStr(a, 60))
        .filter(Boolean)
        .slice(0, 20),
      imageUrl: coverImage,
      galleryImages: sanitizedGallery,
      videoUrl: clampStr(input.videoUrl || '', 690000),
      rooms: (input.rooms || []).slice(0, 15).map(sanitizeRoom),
      status: 'pending',
      adminNotes: '',
      publishedListingId: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return submissionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function approveAndPublishSubmission(
  submission: ListingSubmission,
  adminUid: string,
  adminNotes: string,
): Promise<string> {
  const listingId = sanitizeId(
    submission.publishedListingId || `${slugify(submission.title).slice(0, 48)}-${Date.now()}`,
  );
  try {
    await upsertListing(
      {
        id: listingId,
        title: submission.title,
        category: submission.category,
        propertyType: submission.propertyType,
        location: submission.location,
        address: submission.address,
        priceNgn: submission.priceNgn,
        priceUnit: submission.priceUnit,
        bedrooms: submission.bedrooms,
        bathrooms: submission.bathrooms,
        areaSqm: submission.areaSqm,
        maxGuests: submission.maxGuests,
        summary: submission.summary,
        description: submission.description,
        amenities: submission.amenities,
        imageUrl: submission.imageUrl,
        galleryImages: submission.galleryImages,
        videoUrl: submission.videoUrl,
        rooms: submission.rooms || [],
        featured: false,
        status: 'available',
      },
      adminUid,
      !submission.publishedListingId,
    );

    await updateDoc(doc(db, 'listingSubmissions', submission.id), {
      status: 'approved',
      adminNotes: clampStr(adminNotes || 'Approved and published to live catalog.', 500),
      publishedListingId: listingId,
      updatedAt: serverTimestamp(),
    });
    return listingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `listingSubmissions/${submission.id}`);
  }
}

export async function rejectListingSubmission(
  submissionId: string,
  adminNotes: string,
): Promise<void> {
  const path = `listingSubmissions/${submissionId}`;
  try {
    await updateDoc(doc(db, 'listingSubmissions', submissionId), {
      status: 'rejected',
      adminNotes: clampStr(adminNotes || 'Submission requires additional verification.', 500),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteListingSubmission(submissionId: string): Promise<void> {
  const path = `listingSubmissions/${submissionId}`;
  try {
    await deleteDoc(doc(db, 'listingSubmissions', submissionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function upsertBlogPost(
  post: Omit<BlogPost, 'createdAt' | 'updatedAt' | 'authorId'>,
  adminUid: string,
  isNew: boolean,
): Promise<string> {
  const id = sanitizeId(post.id || slugify(post.title) || `post-${Date.now()}`);
  const path = `posts/${id}`;
  const cleanedContent = clampStr(post.content, 60000);
  const words = countWords(cleanedContent);

  const payload = {
    title: clampStr(post.title, 180),
    slug: clampStr(post.slug || slugify(post.title) || id, 180),
    category: post.category,
    authorName: clampStr(post.authorName || 'PureCrest Editorial Desk', 100),
    publishedDate: clampStr(post.publishedDate || new Date().toISOString().slice(0, 10), 40),
    excerpt: clampStr(post.excerpt, 500),
    content: cleanedContent,
    wordCount: words,
    coverImageUrl: clampStr(post.coverImageUrl, 340000),
    galleryImages: (post.galleryImages || [])
      .map((u) => clampStr(u, 340000))
      .filter(Boolean)
      .slice(0, 12),
    videoUrl: clampStr(post.videoUrl || '', 690000),
    published: Boolean(post.published),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'posts', id), {
        ...payload,
        authorId: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'posts', id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  const path = `posts/${id}`;
  try {
    await deleteDoc(doc(db, 'posts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function upsertService(
  service: Omit<ServiceOffering, 'createdAt' | 'updatedAt' | 'authorId'>,
  adminUid: string,
  isNew: boolean,
): Promise<string> {
  const id = sanitizeId(service.id || `svc-${Date.now()}`);
  const path = `services/${id}`;
  const payload = {
    title: clampStr(service.title, 120),
    division: service.division,
    numberLabel: clampStr(service.numberLabel, 10),
    tagline: clampStr(service.tagline, 180),
    description: clampStr(service.description, 1500),
    deliverables: service.deliverables
      .map((d) => clampStr(d, 120))
      .filter(Boolean)
      .slice(0, 12),
    metricHighlight: clampStr(service.metricHighlight, 80),
    imageUrl: clampStr(service.imageUrl, 340000),
    active: Boolean(service.active),
    sortOrder: Math.max(0, Math.min(1000, Number(service.sortOrder) || 0)),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'services', id), {
        ...payload,
        authorId: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'services', id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteService(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createBooking(input: {
  user: User;
  userName: string;
  userPhone: string;
  listing: Listing;
  selectedRoomName?: string;
  bookingType: BookingType;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  nights: number;
  totalNgn: number;
  notes: string;
}): Promise<{ id: string; referenceCode: string }> {
  const bookingId = sanitizeId(`bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const referenceCode = generateReferenceCode('PC');
  const path = `bookings/${bookingId}`;

  const listingSnap = await getDoc(doc(db, 'listings', input.listing.id));
  if (!listingSnap.exists()) {
    throw new Error(
      'This listing is pending database synchronization. Please ask an administrator to initialize the live database in the Admin CMS.',
    );
  }

  const resolvedTitle = input.selectedRoomName
    ? `${input.listing.title} — ${input.selectedRoomName}`
    : input.listing.title;

  try {
    await setDoc(doc(db, 'bookings', bookingId), {
      userId: input.user.uid,
      userEmail: clampStr(input.user.email || 'client@purecrest.ng', 150),
      userName: clampStr(input.userName, 100),
      userPhone: clampStr(input.userPhone, 30),
      listingId: sanitizeId(input.listing.id),
      listingTitle: clampStr(resolvedTitle, 200),
      bookingType: input.bookingType,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      guests: Math.max(1, Math.min(50, Math.round(input.guests))),
      nights: Math.max(0, Math.min(365, Math.round(input.nights))),
      totalNgn: Math.max(0, Math.min(5000000000, Math.round(input.totalNgn))),
      notes: clampStr(input.notes, 500),
      status: 'pending',
      referenceCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: bookingId, referenceCode };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cancelBookingAsCustomer(bookingId: string): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateBookingAsAdmin(
  bookingId: string,
  updates: Partial<
    Pick<Booking, 'status' | 'checkInDate' | 'checkOutDate' | 'guests' | 'nights' | 'totalNgn' | 'notes'>
  >,
): Promise<void> {
  const path = `bookings/${bookingId}`;
  const cleanUpdates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (updates.status !== undefined) cleanUpdates.status = updates.status;
  if (updates.checkInDate !== undefined) cleanUpdates.checkInDate = updates.checkInDate;
  if (updates.checkOutDate !== undefined) cleanUpdates.checkOutDate = updates.checkOutDate;
  if (updates.guests !== undefined) cleanUpdates.guests = Math.max(1, Math.min(50, updates.guests));
  if (updates.nights !== undefined) cleanUpdates.nights = Math.max(0, Math.min(365, updates.nights));
  if (updates.totalNgn !== undefined) cleanUpdates.totalNgn = Math.max(0, updates.totalNgn);
  if (updates.notes !== undefined) cleanUpdates.notes = clampStr(updates.notes, 500);

  try {
    await updateDoc(doc(db, 'bookings', bookingId), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBookingAsAdmin(bookingId: string): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createInquiry(input: {
  user: User;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  serviceDivision: InquiryDivision;
  subject: string;
  message: string;
  budgetRange: string;
}): Promise<string> {
  const inquiryId = sanitizeId(`inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const path = `inquiries/${inquiryId}`;
  try {
    await setDoc(doc(db, 'inquiries', inquiryId), {
      userId: input.user.uid,
      fullName: clampStr(input.fullName, 100),
      email: clampStr(input.email, 150),
      phone: clampStr(input.phone, 30),
      company: clampStr(input.company, 120),
      serviceDivision: input.serviceDivision,
      subject: clampStr(input.subject, 160),
      message: clampStr(input.message, 2000),
      budgetRange: clampStr(input.budgetRange, 80),
      status: 'new',
      adminReply: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInquiryAsAdmin(
  inquiryId: string,
  status: InquiryStatus,
  adminReply: string,
): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    await updateDoc(doc(db, 'inquiries', inquiryId), {
      status,
      adminReply: clampStr(adminReply, 1500),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInquiryAsAdmin(inquiryId: string): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    await deleteDoc(doc(db, 'inquiries', inquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addAdminMember(
  member: { uid: string; email: string; displayName: string },
  addedByUid: string,
): Promise<void> {
  const uid = sanitizeId(member.uid);
  const path = `admins/${uid}`;
  try {
    await setDoc(doc(db, 'admins', uid), {
      uid,
      email: clampStr(member.email, 150),
      displayName: clampStr(member.displayName, 100),
      addedBy: addedByUid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeAdminMember(uid: string): Promise<void> {
  const path = `admins/${uid}`;
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function getStatusLabel(
  status: BookingStatus | InquiryStatus | Listing['status'] | SubmissionStatus,
): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    'checked-in': 'Checked In',
    completed: 'Completed',
    cancelled: 'Cancelled',
    new: 'New',
    'in-review': 'In Review',
    responded: 'Responded',
    closed: 'Closed',
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    maintenance: 'Maintenance',
    approved: 'Approved',
    rejected: 'Declined',
  };
  return map[status] || status;
}

export type { AdminMember };
