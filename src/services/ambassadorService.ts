import API from '../lib/axios';

export interface AmbassadorApplicationData {
  university: string;
  faculty: string;
  level: string;
  hallHostel: string;
  phone: string;
  whatsapp: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  groupsManagedCount: number;
  estimatedStudentReach: number;
  leadershipExperience?: string;
  whyBecomeAmbassador?: string;
  studentIdUrl?: string;
  profilePictureUrl?: string;
  agreedToTerms: boolean;
}

export const submitAmbassadorApplication = async (data: AmbassadorApplicationData): Promise<any> => {
  const response = await API.post('/ambassadors/apply', data);
  return response.data?.data || response.data;
};
