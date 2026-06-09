/**
 * ==================================================
 * Relaxly Frontend
 * File: src/types/index.ts
 *
 * Purpose:
 * Central type definitions for the Relaxly frontend.
 * Defines the core data structures used across the application.
 *
 * Entities:
 * - University: Academic institutions near hostels.
 * - User: Students, Owners, and Admins.
 * - Room: Individual room variants within a hostel.
 * - Hostel: The main property entity.
 * - Booking: The bridge between students and rooms.
 *
 * Financial Types:
 * - FinancialSnapshot: Immutable pricing at time of booking.
 * - PaymentStatus: States for Paystack integration.
 *
 * ==================================================
 */

export interface University {
  _id: string;

  name: string;

  location: string;
}

/**
 * User profile and account status.
 */
export interface User {
  _id: string;

  name: string;

  email: string;

  role: 'student' | 'owner' | 'admin';

  gender: 'Male' | 'Female';

  isEmailVerified: boolean;

  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';

  rejectionReason?: string;

  phone?: string;

  studentId?: string;

  university?: University;
}

/**
 * Room configuration and availability.
 */
export interface Room {
  _id: string;

  roomType: string;

  /** Multi-student sharing styles (1-in-1 up to 8-in-1). */
  occupancyStyle:
    | '1-in-1'
    | '2-in-1'
    | '3-in-1'
    | '4-in-1'
    | '5-in-1'
    | '6-in-1'
    | '7-in-1'
    | '8-in-1';

  /** Base price before platform adjustments. */
  price: number;

  basePrice?: number;

  adjustmentAmount?: number;

  totalPrice?: number;

  capacity: number;

  availableBeds: number;

  maleAvailableBeds?: number;

  femaleAvailableBeds?: number;

  billingPeriod:
    | 'monthly'
    | 'semester'
    | 'academic year';

  privateWashroom: boolean;

  hasAC: boolean;

  images: string[];

  featuredImage?: string;

  displayImage?: string;

  roomStatus:
    | 'available'
    | 'unavailable'
    | 'maintenance';

  genderAllocation:
    | 'Mixed'
    | 'Male'
    | 'Female';

  amenities: string[];

  description?: string;

  /** Associated hostel ID or populated object. */
  hostel: string | Hostel;
}

/**
 * Represents the core booking states.
 */
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired';

/**
 * Represents the payment processing states.
 */
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'abandoned'
  | 'expired'
  | 'success'
  | 'completed';

/**
 * Encapsulates the financial details of a booking at a specific point in time.
 * This is used to ensure the price the user sees is the price they pay.
 */
export interface FinancialSnapshot {
  /** The base price of the room at the time of booking. */
  roomPrice: number;

  /** Any applicable service or booking fees. */
  bookingFee: number;

  /** The total amount to be paid by the student (roomPrice + bookingFee - discount). */
  totalPaid: number;

  /** Any discount applied to the booking. */
  discount?: number;
}

/**
 * Represents a Booking object returned from the backend.
 * Now includes a mandatory financial snapshot (roomPrice, bookingFee, totalPaid)
 * to prevent frontend price calculation logic.
 */
export interface Booking {
  _id: string;

  room: string | Room;

  hostel: string | Hostel;

  user: string | User;

  /** @deprecated Use totalPaid instead for final amount. */
  amount?: number;

  basePrice: number;

  platformAdjustment: number;

  displayPrice: number;

  roomPrice: number;

  bookingFee: number;

  totalPaid: number;

  bookingId?: string;

  status: BookingStatus;

  /** @deprecated Alias for 'status'. */
  bookingStatus?: BookingStatus;

  paymentStatus: PaymentStatus;

  paymentReference?: string;

  checkInDate?: Date | string;

  /** ISO string representing when the pending reservation expires if not paid. */
  expiresAt?: string;

  createdAt: string;
}

/**
 * Payload required to create a new booking.
 */
export interface CreateBookingPayload {
  room: string;

  hostel: string;

  checkInDate: string;
}

/**
 * Response received when a booking snapshot is created or retrieved.
 */
export interface BookingSnapshotResponse extends FinancialSnapshot {
  bookingId: string;

  paymentReference?: string;

  paymentStatus: PaymentStatus;
}

/**
 * Paystack-specific initialization response.
 */
export interface InitializePaymentResponse {
  /** The URL to redirect the user to for payment. */
  authorization_url: string;

  /** The Paystack access code for this transaction. */
  access_code: string;

  /** The unique transaction reference. */
  reference: string;
}

/**
 * Response received after verifying a payment.
 */
export interface VerifyPaymentResponse {
  /** Whether the verification request was successful. */
  success: boolean;

  /** A descriptive message from the server. */
  message?: string;

  /** The updated booking object, if available. */
  booking?: Booking;

  /** Potential nested booking data depending on backend version. */
  data?: {
    booking?: Booking;
  };
}

export type HostelSortOption =
  | 'newest'
  | 'price_low'
  | 'price_high'
  | 'popular'
  | 'rated';

/**
 * Parameters for the advanced hostel filtering system.
 */
export interface HostelFilterParams {
  location?: string;
  university?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  roomTypes?: string[];
  gender?: 'Male' | 'Female' | 'Mixed';
  verified?: boolean;
  availableNow?: boolean;
  sort?: HostelSortOption;
  page?: number;
  limit?: number;
}

/**
 * High-level property configuration.
 */
export interface Hostel {
  _id: string;

  name: string;

  description: string;

  location: string;

  /** Display price for searching/sorting. */
  price: number;

  pricingType:
    | 'monthly'
    | 'semester'
    | 'academic year';

  images: string[];

  featuredImage?: string;

  displayImage?: string;

  rules?: string[];

  policies?: string[];

  amenities: string[];

  wifi: boolean;

  ac: boolean;

  security: boolean;

  water: boolean;

  electricity: boolean;

  totalRooms: number;

  availableRooms: number;

  genderAllowed:
    | 'Mixed'
    | 'Male'
    | 'Female';

  available: boolean;

  university: University;

  nearbyUniversities?: string[];

  owner?: User;

  rooms?: Room[];
}
