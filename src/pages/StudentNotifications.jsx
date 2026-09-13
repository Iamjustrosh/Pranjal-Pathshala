import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  RiArrowLeftLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiInformationLine,
  RiNotification3Line,
  RiRefreshLine,
} from 'react-icons/ri';

import { supabase } from '../supabaseClient';

import {
  dismissNotification,
  getUnreadNotificationCount,
  loadStudentNotifications,
  markNotificationRead,
} from '../services/notifications';

const TYPE_LABELS = {
  general: 'General',
  announcement: 'Announcement',
  assessment: 'Assessment',
  attendance: 'Attendance',
  material: 'Study Material',
  quiz: 'Quiz',
  fee: 'Fee',
  system: 'System',
};

const PRIORITY_STYLES = {
  low: {
    badge: 'bg-slate-100 text-slate-500',
    border: 'border-slate-100',
  },

  normal: {
    badge: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
  },

  high: {
    badge: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },

  urgent: {
    badge: 'bg-red-50 text-red-600',
    border: 'border-red-100',
  },
};

function formatDate(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getNotificationIcon(type) {
  switch (type) {
    case 'system':
      return RiErrorWarningLine;

    case 'announcement':
      return RiInformationLine;

    default:
      return RiNotification3Line;
  }
}

export default function StudentNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async (manual = false) => {
    try {
      setError('');

      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await loadStudentNotifications(supabase);

      setNotifications(data);
    } catch (err) {
      console.error(
        'Failed to load student notifications:',
        err
      );

      setError(
        err?.message ||
          'Unable to load notifications right now.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications]
  );

  const handleMarkRead = async (notification) => {
    if (notification.isRead) return;

    try {
      setActionId(notification.notificationId);

      await markNotificationRead(
        supabase,
        notification.notificationId
      );

      setNotifications((current) =>
        current.map((item) =>
          item.notificationId === notification.notificationId
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        'Failed to mark notification read:',
        err
      );

      setError(
        err?.message ||
          'Unable to update notification.'
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDismiss = async (notification) => {
    try {
      setActionId(notification.notificationId);
      setError('');

      await dismissNotification(
        supabase,
        notification.notificationId
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item.notificationId !==
            notification.notificationId
        )
      );
    } catch (err) {
      console.error(
        'Failed to dismiss notification:',
        err
      );

      setError(
        err?.message ||
          'Unable to dismiss notification.'
      );
    } finally {
      setActionId(null);
    }
  };

  const handleOpenNotification = async (notification) => {
    await handleMarkRead(notification);

    if (!notification.actionUrl) return;

    if (
      notification.actionUrl.startsWith('/') ||
      notification.actionUrl.startsWith(
        window.location.origin
      )
    ) {
      const target = notification.actionUrl.replace(
        window.location.origin,
        ''
      );

      navigate(target);
      return;
    }

    window.open(
      notification.actionUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="min-h-screen bg-slate-200 sm:flex sm:justify-center">
      <div
        className="
          min-h-[100dvh] w-full bg-slate-50
          sm:my-4
          sm:min-h-[calc(100dvh-32px)]
          sm:max-w-[500px]
          sm:rounded-[32px]
          sm:border
          sm:border-white/70
          sm:shadow-2xl
          sm:shadow-slate-400/20
          overflow-hidden
        "
      >
        <header
          className="
            sticky top-0 z-30
            border-b border-slate-100
            bg-white/95 backdrop-blur-xl
          "
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() =>
                navigate('/student-dashboard')
              }
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl bg-slate-50 text-slate-600
                transition hover:bg-slate-100
              "
            >
              <RiArrowLeftLine size={20} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span
                    className="
                      rounded-full bg-indigo-600
                      px-2 py-0.5 text-[10px]
                      font-bold text-white
                    "
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Updates from Pranjal Pathshala
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl bg-slate-50 text-slate-500
                transition hover:bg-indigo-50
                hover:text-indigo-600
                disabled:opacity-50
              "
              aria-label="Refresh notifications"
            >
              <RiRefreshLine
                size={18}
                className={
                  refreshing ? 'animate-spin' : ''
                }
              />
            </button>
          </div>
        </header>

        <main className="px-4 py-5">
          {error && (
            <div
              className="
                mb-4 rounded-2xl border
                border-red-100 bg-red-50
                px-4 py-3 text-sm text-red-600
              "
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              className="
                flex min-h-[60vh]
                flex-col items-center justify-center
                text-slate-400
              "
            >
              <div
                className="
                  h-8 w-8 animate-spin rounded-full
                  border-4 border-slate-200
                  border-t-indigo-500
                "
              />

              <p className="mt-3 text-sm font-medium">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="
                flex min-h-[65vh]
                flex-col items-center justify-center
                px-6 text-center
              "
            >
              <div
                className="
                  flex h-16 w-16 items-center justify-center
                  rounded-3xl bg-indigo-50
                  text-indigo-600
                "
              >
                <RiNotification3Line size={28} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No notifications yet
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                Updates about results, quizzes, study
                materials, attendance, announcements and
                other student activities will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(
                  notification.type
                );

                const priority =
                  PRIORITY_STYLES[
                    notification.priority
                  ] ?? PRIORITY_STYLES.normal;

                const busy =
                  actionId === notification.notificationId;

                return (
                  <article
                    key={notification.recipientId}
                    className={`
                      relative overflow-hidden
                      rounded-3xl border bg-white
                      p-4 shadow-sm
                      ${priority.border}
                      ${
                        notification.isRead
                          ? 'opacity-80'
                          : ''
                      }
                    `}
                  >
                    {!notification.isRead && (
                      <span
                        className="
                          absolute right-4 top-4
                          h-2.5 w-2.5 rounded-full
                          bg-indigo-500
                        "
                      />
                    )}

                    <div className="flex gap-3">
                      <div
                        className="
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-2xl bg-indigo-50
                          text-indigo-600
                        "
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="
                              rounded-full bg-slate-100
                              px-2 py-1 text-[10px]
                              font-semibold text-slate-500
                            "
                          >
                            {TYPE_LABELS[
                              notification.type
                            ] ?? notification.type}
                          </span>

                          <span
                            className={`
                              rounded-full px-2 py-1
                              text-[10px] font-semibold
                              capitalize
                              ${priority.badge}
                            `}
                          >
                            {notification.priority}
                          </span>
                        </div>

                        <h2 className="mt-2 text-sm font-bold leading-5 text-slate-900">
                          {notification.title}
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {notification.body}
                        </p>

                        <p className="mt-3 text-[10px] text-slate-400">
                          {formatDate(
                            notification.publishedAt ??
                              notification.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-4 flex flex-wrap items-center
                        justify-between gap-2
                        border-t border-slate-100 pt-3
                      "
                    >
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleMarkRead(notification)
                            }
                            className="
                              flex items-center gap-1.5
                              rounded-xl bg-indigo-50
                              px-3 py-2 text-xs
                              font-semibold text-indigo-600
                              transition hover:bg-indigo-100
                              disabled:opacity-50
                            "
                          >
                            <RiCheckDoubleLine size={15} />
                            Mark read
                          </button>
                        )}

                        {notification.actionUrl && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleOpenNotification(
                                notification
                              )
                            }
                            className="
                              flex items-center gap-1.5
                              rounded-xl bg-slate-100
                              px-3 py-2 text-xs
                              font-semibold text-slate-600
                              transition hover:bg-slate-200
                              disabled:opacity-50
                            "
                          >
                            <RiExternalLinkLine size={14} />
                            Open
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleDismiss(notification)
                        }
                        className="
                          flex h-9 w-9 items-center
                          justify-center rounded-xl
                          text-slate-400 transition
                          hover:bg-red-50 hover:text-red-500
                          disabled:opacity-50
                        "
                        aria-label="Dismiss notification"
                      >
                        <RiCloseLine size={18} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}