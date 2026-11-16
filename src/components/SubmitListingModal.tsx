import type { User } from 'firebase/auth';
import { BedDouble, Check, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { ASSET_IMAGE_PRESETS } from '../data/seedData';
import { submitPropertyListing } from '../lib/firestoreService';
import { compressImageFileToDataUrl, readSmallVideoFileToDataUrl } from '../lib/mediaUtils';
import type {
  ListingCategory,
  PriceUnit,
  PropertyType,
  ShortletRoom,
} from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface SubmitListingModalProps {
  user: User | null;
  onClose: () => void;
  onRequireAuth: () => Promise<User | null>;
  onOpenPortal: () => void;
}

export function SubmitListingModal({
  user,
  onClose,
  onRequireAuth,
  onOpenPortal,
}: SubmitListingModalProps) {
  const [ownerName, setOwnerName] = useState(user?.displayName || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [ownerPhone, setOwnerPhone] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>('shortlet');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [location, setLocation] = useState('Abuja, FCT');
  const [address, setAddress] = useState('');
  const [priceNgn, setPriceNgn] = useState(145000);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('night');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [areaSqm, setAreaSqm] = useState(160);
  const [maxGuests, setMaxGuests] = useState(4);
  const [amenitiesText, setAmenitiesText] = useState(
    '24/7 Power, High-Speed Fiber Wi-Fi, Smart Keyless Access, Gated Security',
  );
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');

  const [galleryImages, setGalleryImages] = useState<string[]>([ASSET_IMAGE_PRESETS[2].url]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [rooms, setRooms] = useState<ShortletRoom[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleImportImages = async (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);
    try {
      const imported: string[] = [];
      for (const file of Array.from(files)) {
        imported.push(await compressImageFileToDataUrl(file));
      }
      setGalleryImages((prev) => [...prev, ...imported].slice(0, 15));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to import selected image.');
    }
  };

  const handleImportVideo = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setErrorMsg(null);
    try {
      const dataUrl = await readSmallVideoFileToDataUrl(files[0]);
      setVideoUrl(dataUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to import video clip.');
    }
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: `Suite Option ${prev.length + 1}`,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNightNgn: priceNgn || 120000,
        amenities: ['King Bed', 'Fiber Wi-Fi', 'Kitchenette'],
        galleryImages: [galleryImages[0] || ASSET_IMAGE_PRESETS[2].url],
        videoUrl: '',
        available: true,
      },
    ]);
  };

  const updateRoom = (roomId: string, patch: Partial<ShortletRoom>) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...patch } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 3) {
      setErrorMsg('Please enter a descriptive property title (3+ characters).');
      return;
    }
    if (ownerPhone.trim().length < 5) {
      setErrorMsg('Please enter a valid phone / WhatsApp number.');
      return;
    }
    if (summary.trim().length < 10) {
      setErrorMsg('Please provide a short summary (at least 10 characters).');
      return;
    }
    if (description.trim().length < 20) {
      setErrorMsg('Please provide a detailed property overview (at least 20 characters).');
      return;
    }
    if (galleryImages.length === 0) {
      setErrorMsg('Please add or import at least one property photo.');
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

      const id = await submitPropertyListing(
        {
          ownerName: ownerName.trim() || activeUser.displayName || 'Property Owner',
          ownerEmail: ownerEmail.trim() || activeUser.email || 'owner@purecrest.ng',
          ownerPhone: ownerPhone.trim(),
          title: title.trim(),
          category,
          propertyType,
          location: location.trim(),
          address: address.trim(),
          priceNgn: Number(priceNgn) || 0,
          priceUnit,
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          areaSqm: Number(areaSqm) || 0,
          maxGuests: Number(maxGuests) || 1,
          summary: summary.trim(),
          description: description.trim(),
          amenities: amenitiesText
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean),
          imageUrl: galleryImages[0],
          galleryImages,
          videoUrl: videoUrl.trim(),
          rooms,
        },
        activeUser,
      );
      setSubmittedId(id);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to submit listing. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-listing-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full overflow-hidden my-auto shadow-xl max-h-[94vh] flex flex-col">
        <div className="px-6 py-4 bg-[#064E3B] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-emerald-100">PureCrest Property Onboarding</div>
            <h2 id="submit-listing-title" className="font-display text-xl font-bold text-white">
              Submit a Property or Shortlet Listing
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close submit listing modal"
            className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {submittedId ? (
            <div className="py-10 max-w-lg mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Property Submission Received
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your property has been queued for PureCrest admin verification under reference{' '}
                <span className="font-mono font-semibold text-slate-900">{submittedId}</span>. Once
                approved, it publishes directly into the live PureCrest catalog.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPortal();
                  }}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#155E95] hover:bg-[#0E446E] text-white rounded-lg cursor-pointer"
                >
                  Track in Client Portal
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Owner / Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                  />
                </div>
              </div>

              {/* Property Identity */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={140}
                    placeholder="e.g. Maitama Executive 3-Bedroom Shortlet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const nextCat = e.target.value as ListingCategory;
                      setCategory(nextCat);
                      setPriceUnit(
                        nextCat === 'shortlet' ? 'night' : nextCat === 'lease' ? 'year' : 'total',
                      );
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="shortlet">Short Let</option>
                    <option value="sale">For Sale</option>
                    <option value="lease">For Rent / Lease</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">House / Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Wuse II, Abuja"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Street / Estate Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street or Estate name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={priceNgn}
                      onChange={(e) => setPriceNgn(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                    <select
                      value={priceUnit}
                      onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                      className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="night">/ Night</option>
                      <option value="year">/ Year</option>
                      <option value="total">Outright</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Area (sqm)</label>
                  <input
                    type="number"
                    min={0}
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Media Gallery & Video Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    Property Gallery Images
                  </span>
                  <label className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                    <ImagePlus className="w-3.5 h-3.5 text-[#155E95]" />
                    <span>Import Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => void handleImportImages(e.target.files)}
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newImageUrl.trim()) return;
                      setGalleryImages((prev) => [...prev, newImageUrl.trim()].slice(0, 15));
                      setNewImageUrl('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={`${img.slice(0, 20)}-${idx}`}
                      className="relative w-20 h-14 rounded-md overflow-hidden border border-slate-200"
                    >
                      <ResilientImage
                        src={img}
                        alt={`Submitted photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        aria-label="Remove image"
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-xs cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Optional Video Walkthrough URL (YouTube, Vimeo, MP4)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <label className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Clip</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => void handleImportVideo(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {/* Optional Multi-Room Builder for Shortlets */}
              {category === 'shortlet' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                      <BedDouble className="w-4 h-4 text-[#064E3B]" />
                      <span>Shortlet Room / Suite Breakdown</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRoom}
                      className="px-3 py-1.5 text-xs font-medium bg-[#064E3B] text-white rounded-lg inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Suite / Room</span>
                    </button>
                  </div>
                  {rooms.map((room, rIdx) => (
                    <div
                      key={room.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          Room #{rIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRooms((prev) => prev.filter((r) => r.id !== room.id))
                          }
                          className="text-xs text-red-700 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Room / Suite Name"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                          className="sm:col-span-2 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                        <input
                          type="number"
                          min={0}
                          placeholder="Rate / Night (₦)"
                          value={room.pricePerNightNgn}
                          onChange={(e) =>
                            updateRoom(room.id, { pricePerNightNgn: Number(e.target.value) })
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Amenities (comma-separated)
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
                  Short Summary (10-300 chars) *
                </label>
                <input
                  type="text"
                  required
                  minLength={10}
                  maxLength={300}
                  placeholder="One-line highlight shown on the public property card"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Property Details (20+ chars) *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={20}
                  maxLength={2500}
                  placeholder="Describe layout, power/water setup, security, nearby landmarks, and title/stay terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  {user
                    ? `Submitting as ${user.email}`
                    : 'Sign in with Google upon submission to track approval status.'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-xs font-semibold bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white rounded-lg cursor-pointer"
                  >
                    {submitting
                      ? 'Submitting...'
                      : user
                        ? 'Submit Property for Review'
                        : 'Sign In & Submit Property'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
