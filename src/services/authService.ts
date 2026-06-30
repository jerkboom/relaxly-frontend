/**
 * ==================================================
 * Relaxly Frontend
 * File: src/services/authService.ts
 *
 * Purpose:
 * Handles all authentication-related API requests.
 * Manages user registration, login, and password recovery.
 *
 * Targets:
 * - student Registration
 * - owner Registration
 * - Security Validation
 *
 * ==================================================
 */

import API from '../lib/axios';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female';
  phone: string;
  role: 'student' | 'owner';
  /** Required for owner verification. */
  accessCode?: string;
  /** Verification document for owners. */
  governmentIdUrl?: string;
  university?: string;
  customUniversity?: string;
  studentId?: string;
  agreeToPolicies: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Registers a new student or owner.
 * 
 * Endpoint: POST /auth/register
 */
export const registerUser =
  async (
    userData: RegisterData
  ) => {
    // SECURITY: Prevent admin registration from public API
    const allowedRoles = ['student', 'owner'];
    if (!allowedRoles.includes(userData.role)) {
      throw new Error('Unauthorized role registration attempted.');
    }

    const response =
      await API.post(
        '/auth/register',
        userData
      );

    const result = response.data?.data || response.data;
    return result;
  };

/**
 * Logs in a user and retrieves a JWT token.
 * 
 * Endpoint: POST /auth/login
 */
export const loginUser =
  async (
    userData: LoginData
  ) => {
    const response =
      await API.post(
        '/auth/login',
        userData
      );

    return response.data?.data || response.data;
  };

/**
 * Initiates the password recovery flow.
 * 
 * Endpoint: POST /auth/forgot-password
 */
export const forgotPassword =
  async (email: string) => {
    const response =
      await API.post(
        '/auth/forgot-password',
        { email }
      );

    return response.data?.data || response.data;
  };

/**
 * Resets a user password using a verified token.
 * 
 * Endpoint: PUT /auth/reset-password/:token
 */
export const resetPassword =
  async (
    token: string,
    password: string
  ) => {
    const response =
      await API.put(
        `/auth/reset-password/${token}`,
        { password }
      );

    return response.data?.data || response.data;
  };

/**
 * Verifies a user's email address.
 * 
 * Endpoint: GET /auth/verify-email/:token
 */
export const verifyEmail =
  async (token: string) => {
    const response =
      await API.get(
        `/auth/verify-email/${token}`
      );

    return response.data?.data || response.data;
  };

/**
 * Resends the verification email to the user.
 * 
 * Endpoint: POST /auth/resend-verification
 */
export const resendVerification =
  async (email: string) => {
    const response =
      await API.post(
        '/auth/resend-verification',
        { email }
      );

    return response.data?.data || response.data;
  };

