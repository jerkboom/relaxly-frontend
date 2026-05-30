'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import toast from 'react-hot-toast';

import {
  FaBell,
  FaBullhorn,
  FaCheckDouble,
  FaCommentDots,
  FaCreditCard,
  FaHome,
  FaUserShield,
} from 'react-icons/fa';

import {
  connectSocket,
  disconnectSocket,
} from '../../lib/socket';

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';

import { useAuthStore } from '../../store/authStore';

const normalizeList = (data) =>
  data?.notifications ||
  data?.items ||
  data?.results ||
  (Array.isArray(data) ? data : []);

const normalizeCount = (data) =>
  Number(
    data?.count ??
      data?.unreadCount ??
      data?.total ??
      data ??
      0
  );

const iconMap = {
  booking: FaHome,
  payment: FaCreditCard,
  account: FaUserShield,
  admin: FaBullhorn,
  announcement: FaBullhorn,
  finance: FaCreditCard,
};

const getNotificationId = (item) =>
  item?._id || item?.id;

const getNotificationHref = (item) => {
  const type = String(
    item?.type || ''
  ).toLowerCase();

  if (item?.url) return item.url;
  if (item?.link) return item.link;
  if (type === 'booking')
    return '/student/bookings';
  if (type === 'payment')
    return '/student/bookings';
  if (type === 'account')
    return '/profile';
  if (type === 'finance')
    return '/owner/payout-history';

  return '#';
};

export default function NotificationCenter() {
  const { token, user } =
    useAuthStore();

  const [open, setOpen] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [notifications, setNotifications] =
    useState([]);
  const [unreadCount, setUnreadCount] =
    useState(0);
  const panelRef = useRef(null);
  const lastFetchRef = useRef(0);

  const authenticated =
    Boolean(token && user);

  const fetchNotifications =
    useCallback(async (force = false) => {
      if (
        typeof window === 'undefined' ||
        !authenticated
      ) {
        return;
      }

      // Prevent spam: only fetch if forced or if 30 seconds have passed since last fetch
      const now = Date.now();
      if (!force && now - lastFetchRef.current < 30000) {
        return;
      }

      setLoading(true);
      lastFetchRef.current = now;

      try {
        const [listData, countData] =
          await Promise.all([
            getNotifications({
              limit: 20,
            }),
            getUnreadNotificationCount(),
          ]);

        setNotifications(
          normalizeList(listData)
        );
        setUnreadCount(
          normalizeCount(countData)
        );
      } catch (error) {
        if (
          process.env.NODE_ENV ===
          'development'
        ) {
          console.warn(error);
        }
      } finally {
        setLoading(false);
      }
    }, [authenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!authenticated) {
      setNotifications([]);
      setUnreadCount(0);
      lastFetchRef.current = 0;
      disconnectSocket();
      return;
    }

    let cancelled = false;
    let activeSocket = null;

    // Use a ref to track if we've already fetched to avoid spam during re-renders
    // and only fetch once per mount/auth-change
    fetchNotifications();

    const pollingInterval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    const handleNotification = (
      notification
    ) => {
      setNotifications((current) => [
        notification,
        ...current.filter(
          (item) =>
            getNotificationId(item) !==
            getNotificationId(
              notification
            )
        ),
      ]);

      setUnreadCount(
        (count) => count + 1
      );

      toast.success(
        notification?.title ||
          notification?.message ||
          'New notification'
      );
    };

    const handleUnreadCount = (data) => {
      setUnreadCount(
        normalizeCount(data)
      );
    };

    void connectSocket(token).then(
      (socket) => {
        if (cancelled || !socket) {
          return;
        }

        activeSocket = socket;

        socket.off(
          'notification',
          handleNotification
        );
        socket.off(
          'newNotification',
          handleNotification
        );
        socket.off(
          'notificationCount',
          handleUnreadCount
        );

        socket.on(
          'notification',
          handleNotification
        );
        socket.on(
          'newNotification',
          handleNotification
        );
        socket.on(
          'notificationCount',
          handleUnreadCount
        );
      }
    );

    return () => {
      cancelled = true;
      clearInterval(pollingInterval);
      activeSocket?.off(
        'notification',
        handleNotification
      );
      activeSocket?.off(
        'newNotification',
        handleNotification
      );
      activeSocket?.off(
        'notificationCount',
        handleUnreadCount
      );
    };
  }, [
    authenticated,
    fetchNotifications,
    token,
  ]);

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
  }, []);

  const visibleNotifications =
    useMemo(
      () => notifications.slice(0, 20),
      [notifications]
    );

  const handleMarkRead = async (
    notification
  ) => {
    const id =
      getNotificationId(notification);

    if (!id || notification.read)
      return;

    try {
      await markNotificationRead(id);

      setNotifications((current) =>
        current.map((item) =>
          getNotificationId(item) === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );

      setUnreadCount((count) =>
        Math.max(count - 1, 0)
      );
    } catch {
      toast.error(
        'Unable to mark notification as read'
      );
    }
  };

  const handleMarkAllRead =
    async () => {
      try {
        await markAllNotificationsRead();

        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            read: true,
          }))
        );

        setUnreadCount(0);
      } catch {
        toast.error(
          'Unable to mark notifications as read'
        );
      }
    };

  if (!authenticated) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed right-4 top-4 z-[70]"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-label="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-blue-200 hover:text-blue-600"
      >
        <FaBell />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="mt-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="font-bold text-slate-900">
                Notifications
              </h2>
              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={
                unreadCount === 0
              }
              aria-label="Mark all notifications as read"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 disabled:opacity-40"
            >
              <FaCheckDouble />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  )
                )}
              </div>
            ) : visibleNotifications.length ===
              0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FaBell />
                </div>
                <p className="font-semibold text-slate-900">
                  No notifications
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Updates will appear here.
                </p>
              </div>
            ) : (
              visibleNotifications.map(
                (notification) => {
                  const type = String(
                    notification?.type ||
                      'account'
                  ).toLowerCase();
                  const Icon =
                    iconMap[type] ||
                    FaBell;
                  const href =
                    getNotificationHref(
                      notification
                    );

                  return (
                    <Link
                      key={
                        getNotificationId(
                          notification
                        ) ||
                        notification.createdAt
                      }
                      href={href}
                      onClick={() =>
                        handleMarkRead(
                          notification
                        )
                      }
                      className="flex gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <span
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          notification.read
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <Icon />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-900">
                          {notification.title ||
                            type}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm text-slate-600">
                          {notification.message ||
                            notification.body ||
                            'You have a new update.'}
                        </span>
                        {notification.createdAt && (
                          <span className="mt-1 block text-xs text-slate-400">
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </span>
                        )}
                      </span>

                      {!notification.read && (
                        <span className="mt-3 h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  );
                }
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
