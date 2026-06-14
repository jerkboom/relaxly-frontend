/**
 * ==================================================
 * Relaxly Frontend
 * File: src/services/bookingService.ts
 *
 * Purpose:
 * Core service for managing student and owner bookings.
 * Handles the creation, retrieval, and status updates of reservations.
 *
 * Features:
 * - Create Booking Session
 * - Retrieve My Bookings (Student)
 * - Retrieve Property Bookings (Owner)
 * - Cancel/Update Booking Status
 * - Student Check-in Workflow
 *
 * ==================================================
 */

import API from '../lib/axios';
import type {
  Booking,
  CreateBookingPayload,
} from '../types';

/**
 * Standard envelope for booking-related API responses.
 * Handles variations where data might be nested, wrapped in 'data',
 * or returned as a flat object/array.
 */
type BookingApiEnvelope =
  | Booking
  | Booking[]
  | {
      booking?: Booking;
      bookings?: Booking[];
      data?: Booking | Booking[] | { booking?: Booking; bookings?: Booking[] };
    };

/**
 * Type guard to check if an object contains a list of bookings.
 */
const hasBookingList = (
  value: Booking | { booking?: Booking; bookings?: Booking[] }
): value is { booking?: Booking; bookings: Booking[] } =>
  'bookings' in value && Array.isArray(value.bookings);

/**
 * Type guard to check if an object contains a single booking.
 */
const hasBooking = (
  value: Booking | { booking?: Booking; bookings?: Booking[] }
): value is { booking: Booking; bookings?: Booking[] } =>
  'booking' in value && value.booking !== undefined;

/**
 * Robustly extracts a single Booking object from various API response shapes.
 * 
 * Logic:
 * 1. Checks for array and takes first element.
 * 2. Checks for direct object with _id.
 * 3. Checks for .booking property.
 * 4. Checks for .data wrapper.
 */
const extractBooking = (
  payload: BookingApiEnvelope
): Booking => {
  if (Array.isArray(payload)) {
    const booking = payload[0];

    if (booking) {
      return booking;
    }

    throw new Error('Booking details unavailable');
  }

  // Handle flat object
  if ('_id' in payload) {
    return payload;
  }

  // Handle nested booking property
  if (payload.booking) {
    return payload.booking;
  }

  // Handle 'data' wrapper
  const nested = payload.data;

  if (nested && !Array.isArray(nested)) {
    if ('_id' in nested) {
      return nested;
    }

    if (
      !('_id' in nested) &&
      hasBooking(nested)
    ) {
      return nested.booking;
    }
  }

  throw new Error('Booking details unavailable');
};

/**
 * Robustly extracts an array of Booking objects from various API response shapes.
 */
const extractBookings = (
  payload: BookingApiEnvelope
): Booking[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ('_id' in payload) {
    return [payload];
  }

  if (payload.bookings) {
    return payload.bookings;
  }

  const nested = payload.data;

  if (Array.isArray(nested)) {
    return nested;
  }

  if (
    nested &&
    !Array.isArray(nested) &&
    !('_id' in nested) &&
    hasBookingList(nested)
  ) {
    return nested.bookings;
  }

  if (
    nested &&
    !Array.isArray(nested) &&
    !('_id' in nested) &&
    hasBooking(nested)
  ) {
    return [nested.booking];
  }

  return [];
};

/**
 * Creates a new booking session.
 * First step in the Student booking flow.
 *
 * Endpoint: POST /bookings
 */
export const createBooking =
  async (
    bookingData: CreateBookingPayload
  ): Promise<Booking> => {
    const response =
      await API.post(
        '/bookings',
        bookingData
      );

    return extractBooking(
      response.data
    );
  };

/**
 * Fetches a single booking by its ID.
 * 
 * Endpoint: GET /bookings/:id
 */
export const getBookingById =
  async (
    bookingId: string
  ): Promise<Booking> => {
    const response =
      await API.get(
        `/bookings/${encodeURIComponent(
          bookingId
        )}`
      );

    return extractBooking(
      response.data
    );
  };

/**
 * Retrieves all bookings for the currently authenticated student.
 * 
 * Endpoint: GET /bookings/my-bookings
 */
export const getMyBookings =
  async (
    token?: string
  ): Promise<Booking[]> => {
    const response =
      await API.get(
        '/bookings/my-bookings',
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined
      );

    return extractBookings(
      response.data
    );
  };

/**
 * Retrieves all bookings for hostels owned by the currently authenticated owner.
 * 
 * Endpoint: GET /bookings/owner
 */
export const getOwnerBookings =
  async (): Promise<Booking[]> => {
    const response =
      await API.get(
        '/bookings/owner'
      );

    return extractBookings(
      response.data
    );
  };

/**
 * Cancels an existing booking.
 * 
 * Endpoint: PUT /bookings/:id/cancel
 */
export const cancelBooking =
  async (
    bookingId: string
  ): Promise<Booking> => {
    const response =
      await API.put(
        `/bookings/${bookingId}/cancel`
      );

    return extractBooking(
      response.data
    );
  };

/**
 * Updates the status of a booking (e.g., to 'approved' or 'rejected').
 * Used by Owners to manage reservation requests.
 * 
 * Endpoint: PUT /bookings/:id/status
 */
export const updateBookingStatus =
  async (
    bookingId: string,
    status: Booking['status']
  ): Promise<Booking> => {
    const response =
      await API.put(
        `/bookings/${bookingId}/status`,
        { status }
      );

    return extractBooking(
      response.data
    );
  };

/**
 * Marks a student as checked-in to the hostel.
 * Finalizes the arrival part of the booking flow.
 * 
 * Endpoint: PATCH /bookings/:id/check-in
 */
export const checkInStudent =
  async (
    bookingId: string,
    assignmentData: { 
      assignedRoomNumber: string, 
      assignedBedNumber?: string, 
      assignedFloorNumber?: string,
      assignedBlock?: string,
      occupancyNotes?: string 
    }
  ): Promise<Booking> => {
    console.log("CHECK-IN PAYLOAD", assignmentData);

    const response =
      await API.patch(
        `/bookings/${bookingId}/check-in`,
        assignmentData
      );

    console.log("CHECK-IN RESPONSE", response.data);
    return extractBooking(
      response.data
    );
  };

/**
 * Updates an existing room assignment for a checked-in student.
 * 
 * Endpoint: PATCH /bookings/:id/room-assignment
 */
export const updateRoomAssignment =
  async (
    bookingId: string,
    assignmentData: { 
      assignedRoomNumber: string, 
      assignedBedNumber?: string, 
      assignedFloorNumber?: string,
      assignedBlock?: string,
      occupancyNotes?: string 
    }
  ): Promise<Booking> => {
    console.log("ROOM ASSIGNMENT PAYLOAD", assignmentData);

    const response =
      await API.patch(
        `/bookings/${bookingId}/room-assignment`,
        assignmentData
      );

    console.log("ROOM ASSIGNMENT RESPONSE", response.data);
    return extractBooking(
      response.data
    );
  };

/**
 * Marks a student as checked-out from the hostel.
 * Releases the occupancy record.
 * 
 * Endpoint: PATCH /bookings/:id/check-out
 */
export const checkOutStudent =
  async (
    bookingId: string
  ): Promise<Booking> => {
    const response =
      await API.patch(
        `/bookings/${bookingId}/check-out`
      );

    return extractBooking(
      response.data
    );
  };
