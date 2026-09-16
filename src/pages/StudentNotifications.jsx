import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiInformationLine,
  RiNotification3Line,
  RiRefreshLine,
} from 'react-icons/ri';

import { supabase } from '../supabaseClient';

import {
  getUnreadNotificationCount,
  loadStudentNotifications,
  markNotificationRead,
} from '../services/notifications';


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


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

function getNotificationPreview(body = '') {
  return String(body)
    // Images -> alt text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

    // Markdown links -> link text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    // Remove bold / italic / strike / inline code markers
    .replace(/[*_~`]/g, '')

    // Remove headings / blockquotes
    .replace(/^\s*[#>]+\s*/gm, '')

    // Remove list markers
    .replace(/^\s*[-+]\s+/gm, '')

    // Turn line breaks into spaces for compact preview
    .replace(/\n+/g, ' ')

    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export default function StudentNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all');


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


  const handleViewNotification = async (notification) => {
    setSelectedNotification(notification);

    if (!notification.isRead) {
      await handleMarkRead(notification);

      setSelectedNotification((current) =>
        current?.notificationId === notification.notificationId
          ? {
            ...current,
            isRead: true,
            readAt: new Date().toISOString(),
          }
          : current
      );
    }
  };

  const handleNotificationAction = (notification) => {
    if (!notification?.actionUrl) return;

    if (
      notification.actionUrl.startsWith('/') ||
      notification.actionUrl.startsWith(window.location.origin)
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


  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => !item.isRead);
    }

    if (filter === 'read') {
      return notifications.filter((item) => item.isRead);
    }

    return notifications;
  }, [notifications, filter]);

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
        {/* Header */}
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
              onClick={() => navigate('/student-dashboard')}
              className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-slate-50 text-slate-600
              transition hover:bg-slate-100
            "
              aria-label="Back to dashboard"
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
                    px-2 py-0.5
                    text-[10px] font-bold text-white
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
              transition
              hover:bg-indigo-50 hover:text-indigo-600
              disabled:opacity-50
            "
              aria-label="Refresh notifications"
            >
              <RiRefreshLine
                size={18}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="px-4 py-5">
          {/* Error */}
          {error && (
            <div
              className="
              mb-4 rounded-2xl border
              border-red-100 bg-red-50
              px-4 py-3
              text-sm text-red-600
            "
            >
              {error}
            </div>
          )}

          {/* Loading */}
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
            /* Empty state */
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
                Updates about results, quizzes, study materials,
                attendance, announcements and other student activities
                will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Filter tabs */}
              <div className="mb-4 rounded-xl bg-slate-100 p-1">
                <div className="grid grid-cols-3 gap-1">
                  {[
                    {
                      value: 'all',
                      label: 'All',
                    },
                    {
                      value: 'unread',
                      label: `Unread (${unreadCount})`,
                    },
                    {
                      value: 'read',
                      label: 'Read',
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={`
                      rounded-lg px-3 py-2
                      text-xs font-semibold
                      transition
                      ${filter === item.value
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                        }
                    `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification list */}
              <div
                className="
                overflow-hidden rounded-2xl
                border border-slate-100
                bg-white shadow-sm
              "
              >
                {filteredNotifications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <RiNotification3Line
                      size={26}
                      className="mx-auto text-indigo-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {filter === 'unread'
                        ? 'No unread notifications'
                        : filter === 'read'
                          ? 'No read notifications'
                          : 'No notifications'}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {filter === 'unread'
                        ? "You're all caught up."
                        : 'Nothing to show here yet.'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map(
                    (notification, index) => {
                      const Icon = getNotificationIcon(
                        notification.type
                      );

                      const isLong =
                        String(notification.body ?? '').length > 100;

                      return (
                        <article
                          key={notification.recipientId}
                          onClick={() =>
                            handleViewNotification(notification)
                          }
                          className={`
                          group relative cursor-pointer
                          px-4 py-4
                          transition-colors duration-150
                          hover:bg-slate-50
                          ${!notification.isRead
                              ? 'bg-indigo-50/40'
                              : 'bg-white'
                            }
                          ${index !==
                              filteredNotifications.length - 1
                              ? 'border-b border-slate-100'
                              : ''
                            }
                        `}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className={`
                              flex h-10 w-10 shrink-0
                              items-center justify-center
                              rounded-full border
                              ${notification.isRead
                                  ? `
                                    border-slate-200
                                    bg-white
                                    text-slate-400
                                  `
                                  : `
                                    border-indigo-100
                                    bg-indigo-50
                                    text-indigo-600
                                  `
                                }
                            `}
                            >
                              <Icon size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Title + date */}
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    {!notification.isRead && (
                                      <span
                                        className="
                                        h-1.5 w-1.5 shrink-0
                                        rounded-full bg-indigo-500
                                      "
                                      />
                                    )}

                                    <h2
                                      className={`
                                      truncate text-sm
                                      text-slate-900
                                      ${notification.isRead
                                          ? 'font-semibold'
                                          : 'font-bold'
                                        }
                                    `}
                                    >
                                      {notification.title}
                                    </h2>
                                  </div>
                                </div>

                                <span
                                  className="
                                  shrink-0 whitespace-nowrap
                                  text-[10px] text-slate-400
                                "
                                >
                                  {formatDate(
                                    notification.publishedAt ??
                                    notification.createdAt
                                  )}
                                </span>
                              </div>

                              {/* Preview */}
                              <div className="break-words text-sm leading-7 text-slate-600">
                                {/* Preview */}
                                <p
                                  className="
    mt-1 line-clamp-2
    text-xs leading-5
    text-slate-500
  "
                                >
                                  {getNotificationPreview(notification.body)}
                                </p>
                              </div>

                              {/* Read more */}
                              {isLong && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    handleViewNotification(
                                      notification
                                    );
                                  }}
                                  className="
                                  mt-1 text-[11px]
                                  font-semibold text-indigo-600
                                  transition hover:text-indigo-700
                                "
                                >
                                  Read more
                                </button>
                              )}

                              {/* Type */}
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <span
                                  className="
                                  text-[9px] font-semibold
                                  uppercase tracking-wider
                                  text-slate-400
                                "
                                >
                                  {TYPE_LABELS[
                                    notification.type
                                  ] ?? notification.type}
                                </span>

                                <span
                                  className="
                                  text-[11px] font-semibold
                                  text-indigo-500
                                  opacity-0 transition
                                  group-hover:opacity-100
                                "
                                >
                                  View
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Full notification modal */}
      {selectedNotification && (
        <div
          className="
          fixed inset-0 z-50
          flex items-end justify-center
          bg-slate-950/30
          backdrop-blur-[2px]
          sm:items-center
          sm:px-4
        "
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="
            flex max-h-[88dvh] w-full
            flex-col overflow-hidden
            rounded-t-[28px]
            bg-white shadow-2xl
            sm:max-w-[460px]
            sm:rounded-[28px]
          "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="
              flex shrink-0 items-center
              justify-between gap-4
              border-b border-slate-100
              bg-white px-5 py-4
            "
            >
              <span
                className="
                text-[10px] font-bold
                uppercase tracking-wider
                text-indigo-600
              "
              >
                {TYPE_LABELS[selectedNotification.type] ??
                  selectedNotification.type}
              </span>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="
                flex h-8 w-8 items-center
                justify-center rounded-full
                bg-slate-100 text-lg
                text-slate-500 transition
                hover:bg-slate-200
              "
                aria-label="Close notification"
              >
                ×
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div
                className="
                flex h-12 w-12
                items-center justify-center
                rounded-2xl bg-indigo-50
                text-indigo-600
              "
              >
                {(() => {
                  const Icon = getNotificationIcon(
                    selectedNotification.type
                  );

                  return <Icon size={21} />;
                })()}
              </div>

              <h2
                className="
                mt-4 text-xl font-bold
                leading-7 text-slate-900
              "
              >
                {selectedNotification.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">
                  {formatDate(
                    selectedNotification.publishedAt ??
                    selectedNotification.createdAt
                  )}
                </span>

                {selectedNotification.priority &&
                  selectedNotification.priority !== 'normal' && (
                    <>
                      <span className="text-slate-300">•</span>

                      <span
                        className="
                        text-[10px] font-semibold
                        uppercase tracking-wide
                        text-indigo-500
                      "
                      >
                        {selectedNotification.priority}
                      </span>
                    </>
                  )}
              </div>

              <div className="my-5 border-t border-slate-100" />

              {/* Exact admin-entered formatting */}
              {/* Markdown notification body */}
              <div className="break-words text-sm leading-7 text-slate-600">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0">
                        {children}
                      </p>
                    ),

                    strong: ({ children }) => (
                      <strong className="font-bold text-slate-900">
                        {children}
                      </strong>
                    ),

                    em: ({ children }) => (
                      <em className="italic">
                        {children}
                      </em>
                    ),

                    ul: ({ children }) => (
                      <ul className="my-3 list-disc space-y-1 pl-5">
                        {children}
                      </ul>
                    ),

                    ol: ({ children }) => (
                      <ol className="my-3 list-decimal space-y-1 pl-5">
                        {children}
                      </ol>
                    ),

                    li: ({ children }) => (
                      <li>{children}</li>
                    ),

                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
            font-medium text-indigo-600
            underline underline-offset-2
          "
                      >
                        {children}
                      </a>
                    ),

                    h1: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-lg font-bold text-slate-900">
                        {children}
                      </h3>
                    ),

                    h2: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-base font-bold text-slate-900">
                        {children}
                      </h3>
                    ),

                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-3 text-sm font-bold text-slate-900">
                        {children}
                      </h3>
                    ),

                    blockquote: ({ children }) => (
                      <blockquote className="my-3 border-l-2 border-indigo-300 pl-3 text-slate-500">
                        {children}
                      </blockquote>
                    ),

                    code: ({ children }) => (
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {selectedNotification.body ?? ''}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action */}
            {selectedNotification.actionUrl && (
              <div
                className="
                shrink-0 border-t
                border-slate-100
                bg-white p-4
              "
              >
                <button
                  type="button"
                  onClick={() =>
                    handleNotificationAction(
                      selectedNotification
                    )
                  }
                  className="
                  flex w-full items-center
                  justify-center gap-2
                  rounded-xl bg-indigo-600
                  px-4 py-3
                  text-sm font-semibold text-white
                  transition hover:bg-indigo-700
                "
                >
                  Open
                  <RiExternalLinkLine size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}