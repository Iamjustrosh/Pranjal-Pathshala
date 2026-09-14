import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/supabaseClient";

import {
  archiveNotification,
  createNotification,
  deleteArchivedNotification,
  deleteArchivedNotificationsBefore,
  deleteDraftNotification,
  listNotificationStudents,
  loadAdminNotifications,
  publishNotification,
  updateDraftNotification,
} from "@/services/notifications";

const TYPE_OPTIONS = [
  "general",
  "announcement",
  "assessment",
  "attendance",
  "material",
  "quiz",
  "fee",
  "system",
];

const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];

const ACTION_OPTIONS = [
  { label: "No action", value: "" },
  { label: "Dashboard", value: "/student-dashboard" },
  { label: "Performance / Results", value: "/student-dashboard?tab=performance" },
  { label: "Attendance", value: "/student-dashboard?tab=attendance" },
  { label: "Study Materials", value: "/student-dashboard?tab=study" },
  { label: "Quizzes", value: "/student-dashboard?tab=quiz" },
];

const STATUS_BADGES = {
  published:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  draft:
    "border-amber-500/20 bg-amber-500/10 text-amber-600",
  archived:
    "border-border bg-muted text-muted-foreground",
};

const PRIORITY_BADGES = {
  low: "border-border bg-muted text-muted-foreground",
  normal:
    "border-blue-500/20 bg-blue-500/10 text-blue-600",
  high:
    "border-orange-500/20 bg-orange-500/10 text-orange-600",
  urgent:
    "border-red-500/20 bg-red-500/10 text-red-600",
};

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function NotificationBadge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${className}`}
    >
      {children}
    </span>
  );
}


function FieldHelp({ text }) {
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const showTooltip = () => {
    const rect =
      buttonRef.current?.getBoundingClientRect();

    if (rect) {
      setPosition({
        top: rect.bottom + 8,
        left: Math.min(
          Math.max(rect.left + rect.width / 2, 140),
          window.innerWidth - 140
        ),
      });
    }

    setOpen(true);
  };

  const hideTooltip = () => setOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={text}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="ml-1.5 inline-flex h-[17px] w-[17px] translate-y-[1px] items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-semibold leading-none text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700 focus:outline-none focus-visible:border-indigo-500"
      >
        ?
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform: "translateX(-50%)",
            }}
            className="pointer-events-none z-[9999] w-[min(18rem,calc(100vw-2rem))] rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-normal leading-5 text-white shadow-xl"
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}

export default function NotificationsPage() {
  const currentYear = new Date().getFullYear();

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, index) => currentYear + 1 - index
      ),
    [currentYear]
  );

  const classOptions = useMemo(
    () =>
      Array.from(
        { length: 12 },
        (_, index) => index + 1
      ),
    []
  );

  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");

  const [showComposer, setShowComposer] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    type: "general",
    priority: "normal",
    actionUrl: "",
    expiresAt: "",
  });

  const [year, setYear] = useState(currentYear);
  const [classNumber, setClassNumber] = useState(6);
  const [audienceMode, setAudienceMode] = useState("class");

  const [showCleanup, setShowCleanup] = useState(false);
  const [cleanupPeriod, setCleanupPeriod] = useState("90");
  const [cleanupDate, setCleanupDate] = useState("");
  const [cleanupRunning, setCleanupRunning] = useState(false);

  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "general",
    priority: "normal",
    actionUrl: "",
    expiresAt: "",
    status: "published",
  });

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const data = await loadAdminNotifications(supabase);

      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);

      const data = await listNotificationStudents(supabase, {
        year,
        classNumber:
          audienceMode === "class"
            ? classNumber
            : null,
      });

      setStudents(data);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load students.");
    } finally {
      setStudentsLoading(false);
    }
  }, [year, classNumber, audienceMode]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!showComposer) return;

    loadStudents();
  }, [showComposer, loadStudents]);

  const summary = useMemo(() => {
    return {
      total: notifications.length,
      published: notifications.filter(
        (item) => item.status === "published"
      ).length,
      drafts: notifications.filter(
        (item) => item.status === "draft"
      ).length,
      unread: notifications.reduce(
        (total, item) => total + (item.unreadCount ?? 0),
        0
      ),
    };
  }, [notifications]);

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(
      students.map((student) => student.studentId)
    );
  };

  const clearSelectedStudents = () => {
    setSelectedStudentIds([]);
  };

  const resetComposer = () => {
    setForm({
      title: "",
      body: "",
      type: "general",
      priority: "normal",
      actionUrl: "",
      expiresAt: "",
      status: "published",
    });

    setSelectedStudentIds([]);
  };

  const handleCreateNotification = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Notification title is required.");
      return;
    }

    if (!form.body.trim()) {
      setError("Notification message is required.");
      return;
    }

    if (selectedStudentIds.length === 0) {
      setError("Select at least one student.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const recipients = students
        .filter((student) =>
          selectedStudentIds.includes(student.studentId)
        )
        .map((student) => ({
          studentId: student.studentId,
          academicRecordId: student.academicRecordId,
        }));

      await createNotification(supabase, {
        title: form.title,
        body: form.body,
        type: form.type,
        priority: form.priority,
        actionUrl: form.actionUrl || null,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
        status: form.status,
        recipients,
      });

      resetComposer();
      setShowComposer(false);

      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create notification.");
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (notificationId) => {
    try {
      setActionId(notificationId);
      setError("");

      await publishNotification(supabase, notificationId);

      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to publish notification.");
    } finally {
      setActionId(null);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      setActionId(notificationId);
      setError("");

      await archiveNotification(supabase, notificationId);

      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to archive notification.");
    } finally {
      setActionId(null);
    }
  };

  const openViewDialog = (notification) => setViewingNotification(notification);

  const openEditDialog = (notification) => {
    setEditingNotification(notification);
    setEditForm({
      title: notification.title ?? "",
      body: notification.body ?? "",
      type: notification.type ?? "general",
      priority: notification.priority ?? "normal",
      actionUrl: notification.actionUrl ?? "",
      expiresAt: notification.expiresAt
        ? new Date(notification.expiresAt).toISOString().slice(0, 16)
        : "",
    });
  };

  const closeEditDialog = () => {
    setEditingNotification(null);
    setEditForm({ title: "", body: "", type: "general", priority: "normal", actionUrl: "", expiresAt: "" });
  };

  const handleUpdateDraft = async (event) => {
    event.preventDefault();
    if (!editingNotification) return;
    try {
      setActionId(editingNotification.id);
      setError("");
      await updateDraftNotification(supabase, editingNotification.id, {
        title: editForm.title,
        body: editForm.body,
        type: editForm.type,
        priority: editForm.priority,
        actionUrl: editForm.actionUrl || null,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
      });
      closeEditDialog();
      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update draft notification.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteDraft = async (notification) => {
    if (!window.confirm(`Delete draft "${notification.title}" permanently? This cannot be undone.`)) return;
    try {
      setActionId(notification.id);
      setError("");
      await deleteDraftNotification(supabase, notification.id);
      if (viewingNotification?.id === notification.id) setViewingNotification(null);
      if (editingNotification?.id === notification.id) closeEditDialog();
      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete draft notification.");
    } finally {
      setActionId(null);
    }
  };


  const handleDeleteArchived = async (notification) => {
    const confirmed = window.confirm(
      `Permanently delete archived notification "${notification.title}"? This also removes its recipient history and cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionId(notification.id);
      setError("");

      await deleteArchivedNotification(
        supabase,
        notification.id
      );

      if (viewingNotification?.id === notification.id) {
        setViewingNotification(null);
      }

      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to permanently delete archived notification."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleCleanupArchived = async () => {
    let before;

    if (cleanupPeriod === "custom") {
      if (!cleanupDate) {
        setError("Select a cleanup date.");
        return;
      }

      before = new Date(`${cleanupDate}T23:59:59`);
    } else {
      const days = Number(cleanupPeriod);
      before = new Date();
      before.setDate(before.getDate() - days);
    }

    const label =
      cleanupPeriod === "custom"
        ? `before ${cleanupDate}`
        : `older than ${cleanupPeriod} days`;

    const confirmed = window.confirm(
      `Permanently delete all archived notifications ${label}? This also removes their recipient history and cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setCleanupRunning(true);
      setError("");

      const deletedCount =
        await deleteArchivedNotificationsBefore(
          supabase,
          before
        );

      window.alert(
        `${deletedCount} archived notification${
          deletedCount === 1 ? "" : "s"
        } permanently deleted.`
      );

      await loadNotifications();
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to clean up archived notifications."
      );
    } finally {
      setCleanupRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Create and manage in-app notifications for students."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={loadNotifications}
            disabled={loading}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCleanup((value) => !value)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {showCleanup
              ? "Close Cleanup"
              : "Cleanup Archived"}
          </Button>

          <Button
            onClick={() => setShowComposer((value) => !value)}
          >
            <Plus className="mr-2 h-4 w-4" />

            {showComposer
              ? "Close Composer"
              : "New Notification"}
          </Button>
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.total}
              </p>
            </div>

            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Published
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.published}
              </p>
            </div>

            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Drafts
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.drafts}
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Unread Recipients
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {summary.unread}
              </p>
            </div>

            <Mail className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {showCleanup && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Cleanup Archived Notifications
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Permanently remove archived notifications and their recipient history.
                  Published notifications must be archived before they can be deleted.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Remove archived items
                    <FieldHelp text="Only archived notifications are affected. Published notifications are never permanently deleted by cleanup." />
                  </span>

                  <select
                    value={cleanupPeriod}
                    onChange={(event) =>
                      setCleanupPeriod(event.target.value)
                    }
                    className="h-10 min-w-52 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="30">Older than 30 days</option>
                    <option value="90">Older than 90 days</option>
                    <option value="180">Older than 6 months</option>
                    <option value="365">Older than 1 year</option>
                    <option value="custom">Before custom date</option>
                  </select>
                </label>

                {cleanupPeriod === "custom" && (
                  <label className="space-y-2">
                    <span className="inline-flex items-center text-sm font-medium">
                      Before date
                    </span>
                    <input
                      type="date"
                      value={cleanupDate}
                      onChange={(event) =>
                        setCleanupDate(event.target.value)
                      }
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                  </label>
                )}

                <Button
                  variant="destructive"
                  onClick={handleCleanupArchived}
                  disabled={cleanupRunning}
                >
                  {cleanupRunning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Permanently Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showComposer && (
        <Card>
          <CardContent className="p-6 ">
            <form
              onSubmit={handleCreateNotification}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  Create Notification
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Send an in-app notification to selected students.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Title
                    <FieldHelp text="Short heading shown to the student in the notification list and notification details." />
                  </span>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                    placeholder="Enter notification title"
                  />
                </label>

                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Action
                    <FieldHelp text="Choose where the student should be taken after opening the notification. Select No action when the notification is informational only." />
                  </span>
                  <select
                    value={form.actionUrl}
                    onChange={(event) => setForm((current) => ({ ...current, actionUrl: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                  >
                    {ACTION_OPTIONS.map((option) => (
                      <option key={option.value || "none"} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="inline-flex items-center text-sm font-medium">
                  Message
                  <FieldHelp text="The main notification text shown to the selected students." />
                </span>

                <textarea
                  value={form.body}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-200 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                  placeholder="Write the notification message..."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Type
                    <FieldHelp text="Categorizes the notification, for example assessment, attendance, material or quiz. This can be used for filtering and presentation." />
                  </span>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                  >
                    {TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Priority
                    <FieldHelp text="Indicates importance to students. This currently affects notification metadata/presentation; device push behavior will be handled separately in Phase 10." />
                  </span>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Status
                    <FieldHelp text="Publish Now immediately delivers the in-app notification. Save Draft keeps it editable and unpublished." />
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                  >
                    <option value="published">
                      Publish Now
                    </option>

                    <option value="draft">
                      Save Draft
                    </option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="inline-flex items-center text-sm font-medium">
                    Expires At
                    <FieldHelp text="Optional expiry time for time-sensitive notifications. Leave blank when the notification should not expire." />
                  </span>

                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        expiresAt: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                  />
                </label>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid flex-1 gap-4 sm:grid-cols-3">
                    <label className="space-y-2">
                      <span className="inline-flex items-center text-sm font-medium">
                        Audience
                        <FieldHelp text="Class targets one class in the selected academic year. Whole Batch loads every active student in that academic year across all classes." />
                      </span>

                      <select
                        value={audienceMode}
                        onChange={(event) =>
                          setAudienceMode(event.target.value)
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                      >
                        <option value="class">
                          Single Class
                        </option>
                        <option value="batch">
                          Whole Academic-Year Batch
                        </option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="inline-flex items-center text-sm font-medium">
                        Academic Year
                        <FieldHelp text="Chooses the academic-year records used to build the recipient list." />
                      </span>

                      <select
                        value={year}
                        onChange={(event) =>
                          setYear(Number(event.target.value))
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                      >
                        {yearOptions.map((optionYear) => (
                          <option
                            key={optionYear}
                            value={optionYear}
                          >
                            {optionYear}
                          </option>
                        ))}
                      </select>
                    </label>

                    {audienceMode === "class" && (
                      <label className="space-y-2">
                        <span className="inline-flex items-center text-sm font-medium">
                          Class
                          <FieldHelp text="Limits recipients to active students in this class for the selected academic year." />
                        </span>

                        <select
                          value={classNumber}
                          onChange={(event) =>
                            setClassNumber(
                              Number(event.target.value)
                            )
                          }
                          className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0"
                        >
                          {classOptions.map(
                            (optionClass) => (
                              <option
                                key={optionClass}
                                value={optionClass}
                              >
                                Class {optionClass}
                              </option>
                            )
                          )}
                        </select>
                      </label>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={selectAllStudents}
                      disabled={
                        studentsLoading ||
                        students.length === 0
                      }
                    >
                      Select All
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearSelectedStudents}
                      disabled={
                        selectedStudentIds.length === 0
                      }
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 accent-indigo-600 outline-none focus:ring-0" />

                  {selectedStudentIds.length} of{" "}
                  {students.length} students selected
                  {audienceMode === "batch"
                    ? ` from academic year ${year}`
                    : ` from Class ${classNumber} · ${year}`}
                </div>

                <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border">
                  {studentsLoading ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading students...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {audienceMode === "batch"
                        ? "No active students found for this academic year."
                        : "No active students found for this class and academic year."}
                    </div>
                  ) : (
                    students.map((student) => {
                      const checked =
                        selectedStudentIds.includes(
                          student.studentId
                        );

                      return (
                        <label
                          key={student.academicRecordId}
                          className={`flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 ${
                            checked
                              ? "bg-indigo-50/70"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleStudent(student.studentId)
                            }
                            className="h-4 w-4 accent-indigo-600 outline-none focus:ring-0"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {student.studentName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {student.uid} · Class{" "}
                              {student.class} ·{" "}
                              {student.academicYear}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetComposer();
                    setShowComposer(false);
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}

                  {form.status === "draft"
                    ? "Save Draft"
                    : "Publish Notification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 font-medium">
                No notifications yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first student notification.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {notification.title}
                        </h3>

                        <NotificationBadge
                          className={
                            STATUS_BADGES[
                              notification.status
                            ] ?? ""
                          }
                        >
                          {notification.status}
                        </NotificationBadge>

                        <NotificationBadge
                          className={
                            PRIORITY_BADGES[
                              notification.priority
                            ] ?? ""
                          }
                        >
                          {notification.priority}
                        </NotificationBadge>

                        <NotificationBadge>
                          {notification.type}
                        </NotificationBadge>
                      </div>

                      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        {notification.body}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        <span>
                          Recipients:{" "}
                          {notification.recipientCount}
                        </span>

                        <span>
                          Read: {notification.readCount}
                        </span>

                        <span>
                          Unread:{" "}
                          {notification.unreadCount}
                        </span>

                        <span>
                          Dismissed:{" "}
                          {notification.dismissedCount}
                        </span>

                        <span>
                          Published:{" "}
                          {formatDate(
                            notification.publishedAt
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openViewDialog(notification)}>
                        <Eye className="mr-2 h-4 w-4" />View
                      </Button>

                      {notification.status === "draft" && (<>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(notification)} disabled={actionId === notification.id}>
                          <Pencil className="mr-2 h-4 w-4" />Edit
                        </Button>
                        <Button size="sm" onClick={() => handlePublish(notification.id)} disabled={actionId === notification.id}>
                          <Send className="mr-2 h-4 w-4" />Publish
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteDraft(notification)} disabled={actionId === notification.id}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </Button>
                      </>)}

                      {notification.status !== "archived" && (
                        <Button size="sm" variant="outline" onClick={() => handleArchive(notification.id)} disabled={actionId === notification.id}>
                          <Archive className="mr-2 h-4 w-4" />Archive
                        </Button>
                      )}

                      {notification.status === "archived" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteArchived(notification)
                          }
                          disabled={
                            actionId === notification.id
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viewingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div><h2 className="text-lg font-semibold">Notification Details</h2><p className="mt-1 text-sm text-muted-foreground">Read-only notification information.</p></div>
              <Button size="icon" variant="ghost" onClick={() => setViewingNotification(null)}><X className="h-4 w-4 accent-indigo-600 outline-none focus:ring-0" /></Button>
            </div>
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <NotificationBadge className={STATUS_BADGES[viewingNotification.status] ?? ""}>{viewingNotification.status}</NotificationBadge>
                <NotificationBadge className={PRIORITY_BADGES[viewingNotification.priority] ?? ""}>{viewingNotification.priority}</NotificationBadge>
                <NotificationBadge>{viewingNotification.type}</NotificationBadge>
              </div>
              <div><p className="text-xs font-medium uppercase text-muted-foreground">Title</p><p className="mt-1 font-medium">{viewingNotification.title}</p></div>
              <div><p className="text-xs font-medium uppercase text-muted-foreground">Message</p><p className="mt-1 whitespace-pre-wrap text-sm">{viewingNotification.body}</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs font-medium uppercase text-muted-foreground">Action</p><p className="mt-1 break-all text-sm">{viewingNotification.actionUrl || "No action"}</p></div>
                <div><p className="text-xs font-medium uppercase text-muted-foreground">Expires</p><p className="mt-1 text-sm">{formatDate(viewingNotification.expiresAt)}</p></div>
                <div><p className="text-xs font-medium uppercase text-muted-foreground">Published</p><p className="mt-1 text-sm">{formatDate(viewingNotification.publishedAt)}</p></div>
                <div><p className="text-xs font-medium uppercase text-muted-foreground">Recipients</p><p className="mt-1 text-sm">{viewingNotification.recipientCount}</p></div>
              </div>
            </div>
            <div className="flex justify-end border-t p-5"><Button variant="outline" onClick={() => setViewingNotification(null)}>Close</Button></div>
          </div>
        </div>
      )}

      {editingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border bg-background shadow-xl">
            <form onSubmit={handleUpdateDraft}>
              <div className="flex items-center justify-between border-b p-5">
                <div><h2 className="text-lg font-semibold">Edit Draft Notification</h2><p className="mt-1 text-sm text-muted-foreground">Recipients remain unchanged.</p></div>
                <Button type="button" size="icon" variant="ghost" onClick={closeEditDialog}><X className="h-4 w-4 accent-indigo-600 outline-none focus:ring-0" /></Button>
              </div>
              <div className="space-y-4 p-5">
                <label className="block space-y-2"><span className="inline-flex items-center text-sm font-medium">Title</span><input value={editForm.title} onChange={(e) => setEditForm((c) => ({...c,title:e.target.value}))} className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0" /></label>
                <label className="block space-y-2"><span className="inline-flex items-center text-sm font-medium">Message</span><textarea rows={5} value={editForm.body} onChange={(e) => setEditForm((c) => ({...c,body:e.target.value}))} className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm" /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2"><span className="inline-flex items-center text-sm font-medium">Type</span><select value={editForm.type} onChange={(e) => setEditForm((c) => ({...c,type:e.target.value}))} className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0">{TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <label className="space-y-2"><span className="inline-flex items-center text-sm font-medium">Priority</span><select value={editForm.priority} onChange={(e) => setEditForm((c) => ({...c,priority:e.target.value}))} className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0">{PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
                  <label className="space-y-2"><span className="inline-flex items-center text-sm font-medium">
                    Action
                    <FieldHelp text="Choose where the student should be taken after opening the notification. Select No action when the notification is informational only." />
                  </span><select value={editForm.actionUrl} onChange={(e) => setEditForm((c) => ({...c,actionUrl:e.target.value}))} className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0">{ACTION_OPTIONS.map((option) => <option key={option.value || "none"} value={option.value}>{option.label}</option>)}</select></label>
                  <label className="space-y-2"><span className="inline-flex items-center text-sm font-medium">Expires At</span><input type="datetime-local" value={editForm.expiresAt} onChange={(e) => setEditForm((c) => ({...c,expiresAt:e.target.value}))} className="h-10 w-full rounded-md border border-slate-200 bg-background px-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-0" /></label>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t p-5">
                <Button type="button" variant="outline" onClick={closeEditDialog}>Cancel</Button>
                <Button type="submit" disabled={actionId === editingNotification.id}>{actionId === editingNotification.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}