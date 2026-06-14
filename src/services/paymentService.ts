import axios from 'axios';
import API from '../lib/axios';
import type {
  InitializePaymentResponse,
  VerifyPaymentResponse,
} from '../types';

/**
 * Extracts a user-friendly error message from a payment-related API failure.
 * Maps common backend errors to polished production copy.
 */
const getPaymentErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    
    if (backendMessage) {
      // Ensure backendMessage is a string before calling toLowerCase
      const msg = String(backendMessage).toLowerCase();
      if (msg.includes('expired')) return 'This reservation has expired. Please restart the booking process.';
      if (msg.includes('already paid')) return 'This booking has already been paid for.';
      if (msg.includes('unauthorized')) return 'Please log in again to continue your payment.';
      if (msg.includes('insufficient beds') || msg.includes('unavailable')) return 'This room is no longer available.';
      
      // If it's an object, stringify it for the error display or return a generic message
      return typeof backendMessage === 'string' ? backendMessage : 'An unexpected error occurred during payment';
    }
    
    return error.message || 'Unable to process payment request';
  }

  return error instanceof Error ? error.message : 'Unable to initialize secure payment';
};

/**
 * Initializes a new payment session for a specific booking.
 * This should be called after a booking snapshot has been created.
 *
 * @param bookingId - The unique ID of the booking to pay for.
 * @param callbackUrl - Optional custom callback URL for payment verification.
 * @returns An object containing the Paystack authorization URL and reference.
 * @throws Error with a specific message if initialization fails.
 */
 export const initializePayment =
 async (
   bookingId: string,
   callbackUrl?: string
 ): Promise<InitializePaymentResponse> => {
   try {
     const payload = { 
       bookingId,
       callback_url: callbackUrl
     };

     console.log("INITIALIZE PAYMENT PAYLOAD", payload);

     const response = await API.post(
       '/payments/initialize',
       payload
     );

     const data = response.data?.data || response.data;

      return {
        authorization_url:
          data.authorization_url ||
          data.authorizationUrl,
        access_code:
          data.access_code ||
          data.accessCode,
        reference: data.reference,
      };
    } catch (error) {
      throw new Error(
        getPaymentErrorMessage(error)
      );
    }
  };

/**
 * Verifies the status of a payment using its reference.
 * This is typically called after the user is redirected back from Paystack.
 *
 * @param reference - The Paystack transaction reference to verify.
 * @returns The verification result including booking status.
 * @throws Error if the verification request itself fails.
 */
export const verifyPayment =
  async (
    reference: string
  ): Promise<VerifyPaymentResponse> => {
    try {
      const response = await API.get(
        `/payments/verify/${encodeURIComponent(
          reference
        )}`
      );

      return response.data;
    } catch (error) {
      const paymentError = new Error(
        getPaymentErrorMessage(error)
      );

      if (axios.isAxiosError(error)) {
        Object.assign(paymentError, {
          statusCode: error.response?.status,
        });
      }

      throw paymentError;
    }
  };
