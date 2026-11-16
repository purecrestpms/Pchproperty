import type { Timestamp } from 'firebase/firestore';

export type ListingCategory = 'shortlet' | 'sale' | 'lease';
export type PropertyType = 'Penthouse' | 'Villa' | 'Apartment' | 'Commercial' | 'Land';
export type PriceUnit = 'night' | 'year' | 'total';
export type ListingStatus = 'available' | 'reserved' | 'sold' | 'maintenance';

export type ServiceDivision = 'hospitality' | 'real-estate' | 'technology';
export type InquiryDivision = ServiceDivision | 'general';

export type BookingType = 'shortlet' | 'inspection';
export type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
export type InquiryStatus = 'new' | 'in-review' | 'responded' | 'closed';

export type BlogCategory = 'Hospitality' | 'Real Estate' | 'PropTech' | 'Investment';

export type AppView = 'public' | 'services' | 'portal' | 'admin';
export type LegalDocType = 'privacy' | 'cookies' | 'terms';

export interface ShortletRoom {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNightNgn: number;
  amenities: string[];
  galleryImages: string[];
  videoUrl: string;
  available: boolean;
}

export interface SiteContent {
  id: string;
  sectionKey: 'main';
  brandName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroImageUrl: string;
  aboutHeadline: string;
  aboutBody: string;
  statPropertiesManaged: string;
  statOccupancyRate: string;
  statCitiesActive: string;
  statEnterpriseClients: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  announcementBanner: string;
  officeHoursWeekday?: string;
  officeHoursSaturday?: string;
  officeHoursSunday?: string;
  updatedBy: string;
  updatedAt?: Timestamp | Date | null;
}

export interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  propertyType: PropertyType;
  location: string;
  address: string;
  priceNgn: number;
  priceUnit: PriceUnit;
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
  featured: boolean;
  status: ListingStatus;
  authorId: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface ListingSubmission {
  id: string;
  ownerUid: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  title: string;
  category: ListingCategory;
  propertyType: PropertyType;
  location: string;
  address: string;
  priceNgn: number;
  priceUnit: PriceUnit;
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
  status: SubmissionStatus;
  adminNotes: string;
  publishedListingId: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  authorName: string;
  excerpt: string;
  content: string;
  wordCount: number;
  coverImageUrl: string;
  galleryImages: string[];
  videoUrl: string;
  published: boolean;
  authorId: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface ServiceOffering {
  id: string;
  title: string;
  division: ServiceDivision;
  numberLabel: string;
  tagline: string;
  description: string;
  deliverables: string[];
  metricHighlight: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
  authorId: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  listingId: string;
  listingTitle: string;
  bookingType: BookingType;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  nights: number;
  totalNgn: number;
  notes: string;
  status: BookingStatus;
  referenceCode: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface Inquiry {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  serviceDivision: InquiryDivision;
  subject: string;
  message: string;
  budgetRange: string;
  status: InquiryStatus;
  adminReply: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  company: string;
  savedListingIds: string[];
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface AdminMember {
  uid: string;
  email: string;
  displayName: string;
  addedBy: string;
  createdAt?: Timestamp | Date | null;
}
