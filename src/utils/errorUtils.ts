import axios from 'axios';

/**
 * Robustly extracts a human-readable error message from an API error.
 * Handles Axios errors, standardized backend error structures, and generic Errors.
 * 
 * @param error - The error object to parse
 * @param fallback - A fallback message if no specific error can be found
 * @returns A string error message
 */
export const getErrorMessage = (error: unknown, fallback: string = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    // 1. Check for backend's standardized message
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    if (backendMessage) {
      return backendMessage;
    }

    // 2. Check for Axios generic message
    if (error.message) {
      return error.message;
    }
  }

  // 3. Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // 4. Handle strings or other types
  if (typeof error === 'string') {
    return error;
  }

  return fallback;
};
