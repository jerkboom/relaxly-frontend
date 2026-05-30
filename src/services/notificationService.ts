import { AxiosResponse } from 'axios';
import API from '../lib/axios';

const readData = (response: AxiosResponse) =>
  response?.data?.data || response?.data;

export const getNotifications =
  async (params = {}) => {
    const response = await API.get(
      '/notifications',
      { params }
    );

    return readData(response);
  };

export const markNotificationRead =
  async (notificationId: string) => {
    const response = await API.patch(
      `/notifications/${notificationId}/read`
    );

    return readData(response);
  };

export const markAllNotificationsRead =
  async () => {
    const response = await API.patch(
      '/notifications/read-all'
    );

    return readData(response);
  };

export const getUnreadNotificationCount =
  async () => {
    try {
      const response =
        await API.get(
          '/notifications/unread-count'
        );

      return readData(response);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return { count: 0 };
    }
  };

const notificationService = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
};

export default notificationService;
