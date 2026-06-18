import API from '../lib/axios';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  profileImage?: string;
  bio?: string;
  university?: {
    _id: string;
    name: string;
  };
  wishlist: string[];
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await API.get('/users/profile');
  // Handle both { success: true, data: user } and legacy direct user object
  return response.data?.data || response.data;
};

export const updateUserProfile = async (userData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await API.put('/users/profile', userData);
  return response.data?.data || response.data;
};

export const getUserById = async (id: string): Promise<UserProfile> => {
  const response = await API.get(`/users/${id}`);
  return response.data?.data || response.data;
};

export const toggleWishlist = async (hostelId: string): Promise<{ isSaved: boolean }> => {
  const response = await API.post(`/users/wishlist/${hostelId}`);
  return response.data?.data || response.data;
};

export const getWishlist = async (): Promise<any[]> => {
  const response = await API.get('/users/wishlist');
  return response.data?.data || response.data;
};
