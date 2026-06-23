/**
 * ==================================================
 * Relaxly Frontend
 * File: src/services/hostelService.ts
 *
 * Purpose:
 * Primary service for property and room management.
 * Handles CRUD operations for hostels and room variants.
 *
 * Logic:
 * - Image Normalization: Ensures consistent image arrays/fallbacks.
 * - Paginated Discovery: Supports advanced filtering for students.
 * - Owner Management: Fetches properties owned by authenticated user.
 * - Media Uploads: Interfaces with cloud storage endpoints.
 *
 * ==================================================
 */

import API from '../lib/axios';
import { normalizeImages } from '../utils/imageUtils';
import { HostelFilterParams } from '../types';

/**
 * Ensures hostel data is UI-ready with stable image arrays.
 */
const normalizeHostel = (hostel: any) => {
  if (!hostel) return null;
  
  const images = normalizeImages(hostel.images || hostel.image);
  const featuredImage = hostel.featuredImage || hostel.displayImage;
  
  // Remove duplicates and ensure featured image is at the start
  const uniqueImages = Array.from(new Set(images));
  const finalImages = featuredImage 
    ? [featuredImage, ...uniqueImages.filter(img => img !== featuredImage)]
    : uniqueImages;

  const fallback = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop';

  return {
    ...hostel,
    images: finalImages.length > 0 ? finalImages : [fallback],
    displayImage: featuredImage || finalImages[0] || fallback,
    rooms: Array.isArray(hostel.rooms) ? hostel.rooms.map(normalizeRoom) : []
  };
};

/**
 * Ensures room variant data is UI-ready.
 */
const normalizeRoom = (room: any) => {
  if (!room) return null;

  const images = normalizeImages(room.images || room.image);
  const featuredImage = room.featuredImage || room.displayImage;

  // Remove duplicates and ensure featured image is at the start
  const uniqueImages = Array.from(new Set(images));
  const finalImages = featuredImage 
    ? [featuredImage, ...uniqueImages.filter(img => img !== featuredImage)]
    : uniqueImages;

  const fallback = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop';

  return {
    ...room,
    images: finalImages.length > 0 ? finalImages : [fallback],
    displayImage: featuredImage || finalImages[0] || fallback,
  };
};

/**
 * Retrieves a list of hostels based on search/filter criteria.
 * Supports pagination and sorting.
 * 
 * Endpoint: GET /hostels
 */
export const getHostels = async (params: HostelFilterParams = {}) => {
  const response = await API.get('/hostels', { params });
  console.log('GET /hostels Response:', response.data);
  
  const data = response.data?.data || response.data;
  
  // Handle paginated response structure
  if (data?.hostels && Array.isArray(data.hostels)) {
    return {
      hostels: data.hostels.map(normalizeHostel),
      total: data.total || data.hostels.length,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1
    };
  }
  
  // Handle direct array structure (backward compatibility)
  if (Array.isArray(data)) {
    return {
      hostels: data.map(normalizeHostel),
      total: data.length,
      currentPage: 1,
      totalPages: 1
    };
  }

  // Handle legacy paginated structure
  if (data?.results && Array.isArray(data.results)) {
     return {
      hostels: data.results.map(normalizeHostel),
      total: data.total || data.results.length,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1
    };
  }
  
  return {
    hostels: [],
    total: 0,
    currentPage: 1,
    totalPages: 1
  };
};

/**
 * Retrieves hostels belonging to the logged-in owner.
 * 
 * Endpoint: GET /hostels/owner
 */
export const getOwnerHostels = async () => {
  const response = await API.get('/hostels/owner');
  console.log('GET /hostels/owner Response:', response.data);

  let data = response.data;
  
  if (data?.data?.hostels && Array.isArray(data.data.hostels)) {
    return data.data.hostels.map(normalizeHostel);
  }

  if (data?.hostels && Array.isArray(data.hostels)) {
    return data.hostels.map(normalizeHostel);
  }
  
  if (data?.data && Array.isArray(data.data)) {
    return data.data.map(normalizeHostel);
  }
  
  if (Array.isArray(data)) {
    return data.map(normalizeHostel);
  }
  
  return [];
};

/**
 * Retrieves aggregate metrics for the owner dashboard.
 * 
 * Endpoint: GET /dashboard/owner
 */
export const getOwnerDashboardStats = async () => {
  const response = await API.get('/dashboard/owner');
  return response.data;
};

/**
 * Creates a new hostel property.
 * 
 * Endpoint: POST /hostels
 */
export const createHostel = async (hostelData: any) => {
  const response = await API.post('/hostels', hostelData);
  return response.data;
};

/**
 * Retrieves a single hostel by ID.
 * 
 * Endpoint: GET /hostels/:id
 */
export const getSingleHostel = async (id: string) => {
  const response = await API.get(`/hostels/${id}`);
  const data = response.data?.data || response.data;
  return normalizeHostel(data);
};

/**
 * Updates an existing hostel.
 * 
 * Endpoint: PUT /hostels/:id
 */
export const updateHostel = async (id: string, hostelData: any) => {
  const response = await API.put(`/hostels/${id}`, hostelData);
  const data = response.data?.data || response.data;
  return normalizeHostel(data);
};

/**
 * Deletes a hostel property.
 * 
 * Endpoint: DELETE /hostels/:id
 */
export const deleteHostel = async (id: string) => {
  const response = await API.delete(`/hostels/${id}`);
  return response.data;
};

/**
 * Retrieves all room variants for a specific hostel.
 * 
 * Endpoint: GET /hostels/:id/rooms
 */
export const getHostelRooms = async (hostelId: string) => {
  const response = await API.get(`/hostels/${hostelId}/rooms`);
  if (response.data?.rooms) {
    response.data.rooms = response.data.rooms.map(normalizeRoom);
    return response.data.rooms;
  } else if (response.data?.data && Array.isArray(response.data.data)) {
     return response.data.data.map(normalizeRoom);
  } else if (Array.isArray(response.data)) {
    return response.data.map(normalizeRoom);
  }
  return response.data;
};

/**
 * Retrieves a single room variant by ID.
 * 
 * Endpoint: GET /rooms/:id
 */
export const getSingleRoom = async (id: string) => {
  const response = await API.get(`/rooms/${id}`);
  const data = response.data?.data || response.data;
  return normalizeRoom(data);
};

/**
 * Adds a new room variant to a hostel.
 * 
 * Endpoint: POST /rooms
 */
export const createRoom = async (roomData: any) => {
  const response = await API.post(`/rooms`, roomData);
  const data = response.data?.data || response.data;
  return normalizeRoom(data);
};

/**
 * Updates a specific room variant.
 * 
 * Endpoint: PUT /rooms/:id
 */
export const updateRoom = async (id: string, roomData: any) => {
  const response = await API.put(`/rooms/${id}`, roomData);
  const data = response.data?.data || response.data;
  return normalizeRoom(data);
};

/**
 * Deletes a room variant.
 * 
 * Endpoint: DELETE /rooms/:id
 */
export const deleteRoom = async (id: string) => {
  const response = await API.delete(`/rooms/${id}`);
  return response.data;
};

/**
 * Retrieves gated owner contact details for a hostel.
 * Requires the student to have a valid booking.
 * 
 * Endpoint: GET /hostels/:id/contact
 */
export const getHostelContactDetails = async (id: string) => {
  const response = await API.get(`/hostels/${id}/contact`);
  return response.data?.data || response.data;
};
export const getActiveUniversities = async () => {
  const response = await API.get('/hostels/active-universities');
  return response.data?.data || response.data || [];
};

export const getSearchSuggestions = async (q: string) => {
  const response = await API.get('/hostels/search-suggestions', { params: { q } });
  return response.data?.data?.suggestions || response.data?.suggestions || [];
};

/**
 * Uploads media files (images) for hostels or rooms.
 * 
 * Endpoint: POST /upload
 */
export const uploadImages = async (formData: FormData) => {
  const response = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (response.data?.images) {
    response.data.images = normalizeImages(response.data.images);
  }
  return response.data;
};
