'use client';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates.jsx';
import { useToast } from '@/hooks/use-toast.jsx';

/**
 * Saves a homestay booking to Firestore for both the tourist and the host.
 * @param {Firestore} firestore - The Firestore instance.
 * @param {string} userId - The tourist's ID.
 * @param {object} bookingDetails - The details of the booking, must include hostId.
 */
export function saveHomestayBooking(firestore, userId, bookingDetails) {
  if (!firestore || !userId || !bookingDetails.hostId) {
    console.error("Firestore, user ID, or host ID is missing.");
    const { toast } = useToast();
    toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'Could not save booking. Missing required information.',
    });
    return;
  }

  // Generate a new booking ID to use for both documents
  const bookingId = doc(collection(firestore, 'users')).id;

  const dataToSave = {
    ...bookingDetails,
    id: bookingId,
    userId, // tourist's ID who is making the booking
    bookingDate: serverTimestamp(),
  };

  // Path for tourist's own booking record
  const touristBookingRef = doc(firestore, 'users', userId, 'homestayBookings', bookingId);
  setDocumentNonBlocking(touristBookingRef, dataToSave, { merge: false });

  // Path for host's received booking record
  const hostBookingRef = doc(firestore, 'users', bookingDetails.hostId, 'receivedHomestayBookings', bookingId);
  setDocumentNonBlocking(hostBookingRef, dataToSave, { merge: false });
}


/**
 * Saves a guide booking to Firestore for both the tourist and the guide.
 * @param {Firestore} firestore - The Firestore instance.
 * @param {string} userId - The tourist's ID.
 * @param {object} bookingDetails - The details of the booking, must include guideId.
 */
export function saveGuideBooking(firestore, userId, bookingDetails) {
  if (!firestore || !userId || !bookingDetails.guideId) {
    console.error("Firestore, user ID, or guide ID is missing.");
    const { toast } = useToast();
    toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'Could not save booking. Missing required information.',
    });
    return;
  }

  // Generate a new booking ID to use for both documents
  const bookingId = doc(collection(firestore, 'users')).id;

  const dataToSave = {
    ...bookingDetails,
    id: bookingId,
    userId, // tourist's ID who is making the booking
    bookingDate: serverTimestamp(),
  };

  // Path for tourist's own booking record
  const touristBookingRef = doc(firestore, 'users', userId, 'guideBookings', bookingId);
  setDocumentNonBlocking(touristBookingRef, dataToSave, { merge: false });

  // Path for guide's received booking record
  const guideBookingRef = doc(firestore, 'users', bookingDetails.guideId, 'receivedGuideBookings', bookingId);
  setDocumentNonBlocking(guideBookingRef, dataToSave, { merge: false });
}
