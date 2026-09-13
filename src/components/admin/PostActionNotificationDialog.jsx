import { useEffect, useState } from "react";
import {
  Bell,
  Loader2,
  Send,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createNotification } from "@/services/notifications";
import { supabase } from "@/supabaseClient";

const PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
];

export default function PostActionNotificationDialog({
  open,
  onClose,

  title = "",
  body = "",
  type = "general",
  priority = "normal",
  actionUrl = null,

  recipients = [],

  contextLabel = "",
  onSent,
}) {
  const [form, setForm] = useState({
    title,
    body,
    priority,
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm({
      title: title ?? "",
      body: body ?? "",
      priority: priority ?? "normal",
    });

    setError("");
  }, [
    open,
    title,
    body,
    priority,
  ]);

  if (!open) return null;

  const handleSend = async () => {
    if (!form.title.trim()) {
      setError("Notification title is required.");
      return;
    }

    if (!form.body.trim()) {
      setError("Notification message is required.");
      return;
    }

    if (!recipients.length) {
      setError(
        "No eligible students were found for this notification."
      );
      return;
    }

    try {
      setSending(true);
      setError("");

      const notification =
        await createNotification(supabase, {
          title: form.title.trim(),
          body: form.body.trim(),
          type,
          priority: form.priority,
          actionUrl,
          status: "published",
          recipients,
        });

      onSent?.(notification);

      onClose();
    } catch (err) {
      console.error(
        "Failed to send notification:",
        err
      );

      setError(
        err?.message ||
          "Unable to send notification."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/45 p-4
        backdrop-blur-sm
      "
    >
      <button
        type="button"
        aria-label="Close notification dialog"
        className="absolute inset-0"
        onClick={() => {
          if (!sending) onClose();
        }}
      />

      <div
        className="
          relative z-10
          w-full max-w-lg
          overflow-hidden rounded-2xl
          border bg-background shadow-2xl
        "
      >
        <div
          className="
            flex items-start justify-between
            border-b px-6 py-5
          "
        >
          <div className="flex gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl bg-primary/10
                text-primary
              "
            >
              <Bell className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Send student notification?
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                The action was completed successfully.
                You can now notify the affected students.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={sending}
            onClick={onClose}
            className="
              rounded-lg p-1.5
              text-muted-foreground
              hover:bg-muted
              disabled:opacity-50
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {contextLabel && (
            <div
              className="
                rounded-xl border
                bg-muted/40 px-4 py-3
              "
            >
              <p
                className="
                  text-xs font-medium
                  text-muted-foreground
                "
              >
                Notification audience
              </p>

              <p className="mt-1 text-sm font-medium">
                {contextLabel}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {recipients.length}{" "}
                {recipients.length === 1
                  ? "student"
                  : "students"}
              </p>
            </div>
          )}

          <label className="block space-y-2">
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
              className="
                h-10 w-full rounded-md
                border bg-background px-3
                text-sm outline-none
                focus:ring-2 focus:ring-ring
              "
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">
              Message
            </span>

            <textarea
              rows={4}
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
              className="
                w-full resize-none rounded-md
                border bg-background
                px-3 py-2 text-sm
                outline-none
                focus:ring-2 focus:ring-ring
              "
            />
          </label>

          <label className="block space-y-2">
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
              className="
                h-10 w-full rounded-md
                border bg-background px-3
                text-sm
              "
            >
              {PRIORITIES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div
              className="
                rounded-xl border
                border-destructive/20
                bg-destructive/10
                px-4 py-3
                text-sm text-destructive
              "
            >
              {error}
            </div>
          )}
        </div>

        <div
          className="
            flex items-center justify-end
            gap-2 border-t px-6 py-4
          "
        >
          <Button
            type="button"
            variant="ghost"
            disabled={sending}
            onClick={onClose}
          >
            Not now
          </Button>

          <Button
            type="button"
            disabled={
              sending ||
              recipients.length === 0
            }
            onClick={handleSend}
          >
            {sending ? (
              <Loader2
                className="
                  mr-2 h-4 w-4
                  animate-spin
                "
              />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}

            Send Notification
          </Button>
        </div>
      </div>
    </div>
  );
}