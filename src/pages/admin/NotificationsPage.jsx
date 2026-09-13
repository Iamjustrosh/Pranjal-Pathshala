import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Plus,
  RefreshCcw,
  Send,
  Users,
} from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/supabaseClient";

import {
  archiveNotification,
  createNotification,
  listNotificationStudents,
  loadAdminNotifications,
  publishNotification,
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

export default function NotificationsPage() {
  const currentYear = new Date().getFullYear();

  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");

  const [showComposer, setShowComposer] = useState(false);

  const [year, setYear] = useState(currentYear);
  const [classNumber, setClassNumber] = useState(6);

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
        classNumber,
      });

      setStudents(data);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load students.");
    } finally {
      setStudentsLoading(false);
    }
  }, [year, classNumber]);

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

      {showComposer && (
        <Card>
          <CardContent className="p-6">
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
                  <span className="text-sm font-medium">
                    Title
                  </span>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter notification title"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Action URL
                  </span>

                  <input
                    value={form.actionUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        actionUrl: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="/student-dashboard"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium">
                  Message
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
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Write the notification message..."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Type
                  </span>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Priority
                  </span>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                  <span className="text-sm font-medium">
                    Status
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                  <span className="text-sm font-medium">
                    Expires At
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
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  />
                </label>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Academic Year
                      </span>

                      <input
                        type="number"
                        value={year}
                        onChange={(event) =>
                          setYear(Number(event.target.value))
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Class
                      </span>

                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={classNumber}
                        onChange={(event) =>
                          setClassNumber(
                            Number(event.target.value)
                          )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      />
                    </label>
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
                  <Users className="h-4 w-4" />

                  {selectedStudentIds.length} of{" "}
                  {students.length} students selected
                </div>

                <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border">
                  {studentsLoading ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading students...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No students found for this class and year.
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
                          className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/40"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleStudent(student.studentId)
                            }
                            className="h-4 w-4"
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

                    <div className="flex shrink-0 gap-2">
                      {notification.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handlePublish(notification.id)
                          }
                          disabled={
                            actionId === notification.id
                          }
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Publish
                        </Button>
                      )}

                      {notification.status !==
                        "archived" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleArchive(notification.id)
                          }
                          disabled={
                            actionId === notification.id
                          }
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
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
    </div>
  );
}