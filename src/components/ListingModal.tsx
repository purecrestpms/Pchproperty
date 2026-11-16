import type { User } from 'firebase/auth';
import {
  Bath,
  BedDouble,
  Bookmark,
  Calendar,
  Check,
  Film,
  Images,
  MapPin,
  Maximize2,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { computeNightsBetween, formatNaira } from '../data/seedData';
import { createBooking } from '../lib/firestoreService';
import { parseVideoEmbed } from '../lib/mediaUtils';
import type { BookingType, Listing } from '../types/purecrest';
import { ResilientImage } from './ResilientImage';

interface ListingModalProps {
  listing: Listing;
  user: User | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (listingId: string) => Promise<void>;
  onRequireAuth: () => Promise<User | null>;
  onBookingCreated: (referenceCode: string) => void;
}

function getDefaultDate(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

export function ListingModal({
  listing,
  user,
  isSaved,
  onClose,
  onToggleSave,
  onRequireAuth,
  onBookingCreated,
}: ListingModalProps) {
  const isShortlet = listing.category === 'shortlet';
  const rooms = listing.rooms || [];
  const availableRooms = rooms.filter((r) => r.available);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    availableRooms[0]?.id || rooms[0]?.id || '',
  );
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId],
  );

  // Combine media for active room or property
  const activeGallery = useMemo(() => {
    const roomImgs = selectedRoom?.galleryImages || [];
    const listingImgs = [listing.imageUrl, ...(listing.galleryImages || [])];
    const combined = [...roomImgs, ...listingImgs].filter(Boolean);
    return Array.from(new Set(combined));
  }, [listing, selectedRoom]);

  const activeVideoUrl = selectedRoom?.videoUrl || listing.videoUrl || '';
  const parsedVideo = useMemo(() => parseVideoEmbed(activeVideoUrl), [activeVideoUrl]);

  const [mediaMode, setMediaMode] = useState<'photos' | 'video'>('photos');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [bookingType, setBookingType] = useState<BookingType>(
    isShortlet ? 'shortlet' : 'inspection',
  );
  const [checkInDate, setCheckInDate] = useState(getDefaultDate(2));
  const [checkOutDate, setCheckOutDate] = useState(getDefaultDate(isShortlet ? 5 : 2));
  const [guests, setGuests] = useState(
    isShortlet ? Math.min(2, selectedRoom?.maxGuests || listing.maxGuests || 2) : 1,
  );
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const activeNightlyRate = selectedRoom ? selectedRoom.pricePerNightNgn : listing.priceNgn;
  const activeMaxGuests = selectedRoom ? selectedRoom.maxGuests : listing.maxGuests || 8;
  const activeBedrooms = selectedRoom ? selectedRoom.bedrooms : listing.bedrooms;
  const activeBathrooms = selectedRoom ? selectedRoom.bathrooms : listing.bathrooms;
  const activeAmenities = useMemo(() => {
    if (!selectedRoom) return listing.amenities;
    return Array.from(new Set([...selectedRoom.amenities, ...listing.amenities]));
  }, [listing.amenities, selectedRoom]);

  const nights =
    bookingType === 'shortlet' ? computeNightsBetween(checkInDate, checkOutDate) : 0;
  const computedTotal =
    bookingType === 'shortlet' ? nights * activeNightlyRate : 0;

  const displayedPhoto = activeGallery[activePhotoIndex] || activeGallery[0] || listing.imageUrl;

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActivePhotoIndex(0);
    setMediaMode('photos');
    const nextRoom = rooms.find((r) => r.id === roomId);
    if (nextRoom && guests > nextRoom.maxGuests) {
      setGuests(nextRoom.maxGuests);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phone.trim() || phone.trim().length < 5) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }

    if (bookingType === 'shortlet' && checkOutDate <= checkInDate) {
      setErrorMsg('Check-out date must be after check-in date.');
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

      const resolvedName = fullName.trim() || activeUser.displayName || 'PureCrest Guest';
      const result = await createBooking({
        user: activeUser,
        userName: resolvedName,
        userPhone: phone.trim(),
        listing,
        selectedRoomName: selectedRoom?.name,
        bookingType,
        checkInDate,
        checkOutDate: bookingType === 'shortlet' ? checkOutDate : checkInDate,
        guests,
        nights,
        totalNgn: computedTotal,
        notes: notes.trim(),
      });
      setConfirmedRef(result.referenceCode);
      onBookingCreated(result.referenceCode);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to complete booking right now. Please try again.',
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
      aria-labelledby="listing-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-5xl w-full overflow-hidden my-auto shadow-xl max-h-[94vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#064E3B] text-white shrink-0">
          <div className="text-xs font-medium text-emerald-100">
            <span>
              {listing.category === 'shortlet'
                ? 'Executive Shortlet'
                : listing.category === 'sale'
                  ? 'Property Acquisition'
                  : 'Commercial / Residential Lease'}
            </span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void onToggleSave(listing.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-[#E5A024] border-[#E5A024] text-slate-950'
                  : 'bg-emerald-800/60 border-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close property details"
              className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Property Dossier, Media Gallery, Video & Multi-Room Selector */}
          <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* Media Viewport */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMediaMode('photos')}
                    className={`px-3 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer ${
                      mediaMode === 'photos'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span>Photo Gallery</span>
                  </button>
                  {parsedVideo && (
                    <button
                      type="button"
                      onClick={() => setMediaMode('video')}
                      className={`px-3 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer ${
                        mediaMode === 'video'
                          ? 'bg-white text-[#155E95] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Video Tour</span>
                    </button>
                  )}
                </div>
              </div>

              {mediaMode === 'video' && parsedVideo ? (
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-200">
                  {parsedVideo.kind === 'iframe' ? (
                    <iframe
                      src={parsedVideo.src}
                      title={`${listing.title} video tour`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={parsedVideo.src}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <>
                  <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <ResilientImage
                      src={displayedPhoto}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      fallbackLabel={listing.title}
                    />
                  </div>
                  {activeGallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {activeGallery.map((imgUrl, idx) => (
                        <button
                          key={`${imgUrl.slice(0, 32)}-${idx}`}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`h-14 w-20 rounded-lg overflow-hidden border shrink-0 cursor-pointer transition-opacity ${
                            activePhotoIndex === idx
                              ? 'border-[#155E95] ring-2 ring-[#155E95]/40'
                              : 'border-slate-200 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <ResilientImage
                            src={imgUrl}
                            alt={`${listing.title} photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <h2 id="listing-modal-title" className="font-display text-2xl font-bold text-slate-900">
                {listing.title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#155E95] shrink-0" />
                <span>{listing.address}</span>
              </p>
            </div>

            {/* Multiple Rooms / Suites Selector */}
            {rooms.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Select Room / Suite Option
                  </h3>
                  <span className="text-xs text-[#155E95] font-medium">
                    Tailored room rates &amp; amenities
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {rooms.map((room) => {
                    const isSelected = room.id === selectedRoomId;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        disabled={!room.available}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#155E95] bg-[#155E95]/5'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        } ${!room.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold text-sm text-slate-900">
                            {room.name}
                          </div>
                          <div className="font-mono text-sm font-bold text-[#064E3B] tabular-nums">
                            {formatNaira(room.pricePerNightNgn)}
                            <span className="text-xs font-sans font-normal text-slate-500">
                              /night
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{room.bedrooms} Bed</span>
                          <span aria-hidden="true">·</span>
                          <span>{room.bathrooms} Bath</span>
                          <span aria-hidden="true">·</span>
                          <span>Up to {room.maxGuests} Guests</span>
                          {!room.available && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-red-700 font-medium">Unavailable</span>
                            </>
                          )}
                        </div>
                        {room.amenities.length > 0 && (
                          <div className="mt-2 text-xs text-slate-600">
                            {room.amenities.join(' · ')}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 py-4 border-y border-slate-200 text-sm">
              <div>
                <div className="text-xs text-slate-500">Rate / Price</div>
                <div className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                  {formatNaira(activeNightlyRate)}
                  <span className="text-xs font-sans font-normal text-slate-500">
                    {listing.priceUnit === 'night'
                      ? '/night'
                      : listing.priceUnit === 'year'
                        ? '/yr'
                        : ''}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Bedrooms</div>
                <div className="font-semibold text-slate-900 tabular-nums mt-0.5 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-slate-400" />
                  <span>{activeBedrooms || 'Flex'}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Bathrooms</div>
                <div className="font-semibold text-slate-900 tabular-nums mt-0.5 flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-slate-400" />
                  <span>{activeBathrooms}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Area</div>
                <div className="font-semibold text-slate-900 tabular-nums mt-0.5 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-slate-400" />
                  <span>{listing.areaSqm} sqm</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Overview</h3>
              <p className="text-sm leading-relaxed text-slate-600">{listing.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2.5">
                Specifications &amp; Amenities
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {activeAmenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#155E95] shrink-0" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Booking / Inspection Panel */}
          <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col justify-between">
            {confirmedRef ? (
              <div className="my-auto py-8 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Reservation Request Recorded
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your {bookingType === 'shortlet' ? 'shortlet reservation' : 'private inspection'} has been logged in the PureCrest database. Our concierge team will confirm availability shortly.
                </p>
                <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="text-xs text-slate-500">Booking Reference</div>
                  <div className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                    {confirmedRef}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-[#155E95] hover:bg-[#0E446E] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {isShortlet ? 'Reserve Shortlet Stay' : 'Schedule Private Inspection'}
                  </h3>
                  {selectedRoom && (
                    <div className="mt-1 text-xs font-medium text-[#155E95]">
                      Selected suite: {selectedRoom.name}
                    </div>
                  )}
                  {user && (
                    <p className="text-xs text-slate-500 mt-1">Booking as {user.email}</p>
                  )}
                </div>

                {isShortlet && (
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setBookingType('shortlet')}
                      className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        bookingType === 'shortlet'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Book Stay
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('inspection')}
                      className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        bookingType === 'inspection'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Viewing Only
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {bookingType === 'shortlet' ? 'Check-In' : 'Preferred Date'}
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      min={getDefaultDate(0)}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                    />
                  </div>
                  {bookingType === 'shortlet' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Check-Out
                      </label>
                      <input
                        type="date"
                        required
                        value={checkOutDate}
                        min={checkInDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Attendees
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                  )}
                </div>

                {bookingType === 'shortlet' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Guests (Max {activeMaxGuests})
                    </label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, activeMaxGuests)}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Concierge Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={400}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E95] resize-none"
                  />
                </div>

                {bookingType === 'shortlet' && (
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        {formatNaira(activeNightlyRate)} × {nights} night{nights > 1 ? 's' : ''}
                      </span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {formatNaira(computedTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900 pt-1.5 border-t border-slate-100">
                      <span>Estimated Total</span>
                      <span className="font-mono tabular-nums">{formatNaira(computedTotal)}</span>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || listing.status !== 'available'}
                  className="w-full py-2.5 px-4 bg-[#155E95] hover:bg-[#0E446E] disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Submitting Request...'
                      : listing.status !== 'available'
                        ? 'Currently Unavailable'
                        : bookingType === 'shortlet'
                          ? 'Confirm Reservation Request'
                          : 'Request Inspection'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
