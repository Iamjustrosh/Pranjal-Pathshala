import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  const jsonResponse = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed",
      },
      405
    );
  }

  try {
    // --------------------------------------------------
    // 1. Environment variables
    // --------------------------------------------------

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const vapidPublicKey =
      Deno.env.get("VAPID_PUBLIC_KEY");

    const vapidPrivateKey =
      Deno.env.get("VAPID_PRIVATE_KEY");

    const vapidSubject =
      Deno.env.get("VAPID_SUBJECT");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey ||
      !vapidPublicKey ||
      !vapidPrivateKey ||
      !vapidSubject
    ) {
      throw new Error(
        "Required environment variables are missing"
      );
    }

    // --------------------------------------------------
    // 2. Authenticate caller
    // --------------------------------------------------

    const authorization =
      req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        {
          success: false,
          error: "Authentication required",
        },
        401
      );
    }

    const callerClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const token = authorization
      .replace("Bearer ", "")
      .trim();

    const {
      data: { user },
      error: authError,
    } = await callerClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid or expired session",
        },
        401
      );
    }

    // --------------------------------------------------
    // 3. Verify active admin
    // --------------------------------------------------

    const {
      data: caller,
      error: callerError,
    } = await callerClient
      .from("app_users")
      .select("role, status")
      .eq("auth_user_id", user.id)
      .single();

    if (
      callerError ||
      !caller ||
      caller.status !== "active" ||
      !["admin", "super_admin"].includes(caller.role)
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Only active admins can send push notifications",
        },
        403
      );
    }

    // --------------------------------------------------
    // 4. Request body
    // --------------------------------------------------

    let body;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "Invalid JSON body",
        },
        400
      );
    }

    const notificationId =
      Number(body?.notificationId);

    if (
      !Number.isSafeInteger(notificationId) ||
      notificationId <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Valid notificationId is required",
        },
        400
      );
    }

    // --------------------------------------------------
    // 5. Service-role client
    // --------------------------------------------------

    const serviceClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // --------------------------------------------------
    // 6. Load notification
    // --------------------------------------------------

    const {
      data: notification,
      error: notificationError,
    } = await serviceClient
      .from("notifications")
      .select(`
        id,
        title,
        body,
        action_url,
        status
      `)
      .eq("id", notificationId)
      .single();

    if (notificationError || !notification) {
      return jsonResponse(
        {
          success: false,
          error: "Notification not found",
        },
        404
      );
    }

    if (notification.status !== "published") {
      return jsonResponse(
        {
          success: false,
          error:
            "Only published notifications can be pushed",
        },
        409
      );
    }

    // --------------------------------------------------
    // 7. Resolve notification recipients
    // --------------------------------------------------

    const {
      data: recipients,
      error: recipientError,
    } = await serviceClient
      .from("notification_recipients")
      .select("student_id")
      .eq("notification_id", notificationId);

    if (recipientError) {
      throw recipientError;
    }

    const studentIds = [
      ...new Set(
        (recipients ?? [])
          .map((row) => Number(row.student_id))
          .filter((id) => Number.isSafeInteger(id))
      ),
    ];

    if (studentIds.length === 0) {
      return jsonResponse({
        success: true,
        notificationId,
        subscriptions: 0,
        sent: 0,
        failed: 0,
        message: "Notification has no recipients",
      });
    }

    // --------------------------------------------------
    // 8. Load active push subscriptions
    // --------------------------------------------------

    const {
      data: subscriptions,
      error: subscriptionError,
    } = await serviceClient
      .from("push_subscriptions")
      .select(`
        id,
        student_id,
        endpoint,
        p256dh,
        auth_key,
        failure_count
      `)
      .in("student_id", studentIds)
      .eq("is_active", true);

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscriptions?.length) {
      return jsonResponse({
        success: true,
        notificationId,
        subscriptions: 0,
        sent: 0,
        failed: 0,
        message:
          "No active push subscriptions found",
      });
    }

    // --------------------------------------------------
    // 9. Configure VAPID
    // --------------------------------------------------

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      notificationId: notification.id,

      title:
        notification.title ||
        "Pranjal Pathshala",

      body:
        notification.body || "",

      actionUrl:
        notification.action_url ||
        "/student-dashboard",
    });

    let sent = 0;
    let failed = 0;

    // --------------------------------------------------
    // 10. Send push to each subscription
    // --------------------------------------------------

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,

            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth_key,
            },
          },
          payload
        );

        sent += 1;

        const now = new Date().toISOString();

        await serviceClient
          .from("push_subscriptions")
          .update({
            last_success_at: now,
            failure_count: 0,
            updated_at: now,
          })
          .eq("id", subscription.id);
      } catch (error) {
        failed += 1;

        const statusCode =
          error &&
          typeof error === "object" &&
          "statusCode" in error
            ? Number(error.statusCode)
            : null;

        const failureCount =
          Number(subscription.failure_count ?? 0) + 1;

        // 404 / 410 means the browser subscription
        // is no longer valid.
        const subscriptionExpired =
          statusCode === 404 ||
          statusCode === 410;

        console.error(
          "Push delivery failed:",
          {
            subscriptionId: subscription.id,
            studentId: subscription.student_id,
            statusCode,
            error,
          }
        );

        const now = new Date().toISOString();

        await serviceClient
          .from("push_subscriptions")
          .update({
            last_failure_at: now,
            failure_count: failureCount,
            is_active:
              subscriptionExpired
                ? false
                : true,
            updated_at: now,
          })
          .eq("id", subscription.id);
      }
    }

    // --------------------------------------------------
    // 11. Response
    // --------------------------------------------------

    return jsonResponse({
      success: true,
      notificationId,
      subscriptions: subscriptions.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error(
      "send-push-notification error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send push notification",
      },
      500
    );
  }
});