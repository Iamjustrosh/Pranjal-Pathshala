import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const jsonResponse = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  let createdAuthUserId = null;
  let databaseEnrollmentCompleted = false;

  try {
    if (req.method !== "POST") {
      return jsonResponse(
        {
          success: false,
          error: "Method not allowed",
        },
        405
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        "Required Supabase environment variables are missing"
      );
    }

    // --------------------------------------------------
    // 1. Extract logged-in admin JWT
    // --------------------------------------------------

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        {
          success: false,
          error: "Missing authorization token",
        },
        401
      );
    }

    // Client running in the CALLER'S JWT context.
    // This client is used for DB/RPC operations so auth.uid()
    // inside enroll_student_v2() resolves to the actual admin.
    const adminJwtClient = createClient(
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

    // Privileged server-only client.
    // ONLY use this for auth.admin operations.
    const serviceClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // --------------------------------------------------
    // 2. Verify JWT
    // --------------------------------------------------

    const token = authorization.replace("Bearer ", "").trim();

    const {
      data: { user: caller },
      error: callerError,
    } = await adminJwtClient.auth.getUser(token);

    if (callerError || !caller) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid or expired authentication token",
        },
        401
      );
    }

    // --------------------------------------------------
    // 3. Verify active admin / super_admin
    // --------------------------------------------------

    const { data: callerAppUser, error: callerAppUserError } =
      await adminJwtClient
        .from("app_users")
        .select("auth_user_id, role, status")
        .eq("auth_user_id", caller.id)
        .single();

    if (callerAppUserError || !callerAppUser) {
      return jsonResponse(
        {
          success: false,
          error: "Application user mapping not found",
        },
        403
      );
    }

    if (
      !["admin", "super_admin"].includes(callerAppUser.role) ||
      callerAppUser.status !== "active"
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Only active admins can enroll students",
        },
        403
      );
    }

    // --------------------------------------------------
    // 4. Read + validate request
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

    const { studentId, academicYear } = body ?? {};

    const parsedStudentId = Number(studentId);
    const parsedAcademicYear = Number(academicYear);

    if (
      !Number.isInteger(parsedStudentId) ||
      parsedStudentId <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Valid studentId is required",
        },
        400
      );
    }

    if (
      !Number.isInteger(parsedAcademicYear) ||
      parsedAcademicYear < 2000 ||
      parsedAcademicYear > 2100
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Valid academicYear is required",
        },
        400
      );
    }

    // --------------------------------------------------
    // 5. Verify permanent student exists
    // --------------------------------------------------

    const { data: student, error: studentError } =
      await adminJwtClient
        .from("students")
        .select(
          "id, student_name, class, status, login_username, contact_number"
        )
        .eq("id", parsedStudentId)
        .single();

    if (studentError || !student) {
      return jsonResponse(
        {
          success: false,
          error: "Student not found",
        },
        404
      );
    }

    const password = String(student.contact_number ?? '').replace(/\D/g, '');
    if (password.length < 6) {
      return jsonResponse({ success: false, error: 'Update the student contact number before enrolling (at least 6 digits required).' }, 400);
    }

    // Defensive pre-check.
    // enroll_student_v2() remains the authoritative DB check.
    if (student.login_username) {
      return jsonResponse(
        {
          success: false,
          error: "Student is already enrolled",
        },
        409
      );
    }

    // --------------------------------------------------
    // 6. Create TEMPORARY Auth account
    // --------------------------------------------------

    const temporaryEmail =
      `pending-${parsedStudentId}-${crypto.randomUUID()}` +
      "@students.pranjalpathshala.local";

    const {
      data: createdAuth,
      error: createAuthError,
    } = await serviceClient.auth.admin.createUser({
      email: temporaryEmail,
      password,
      email_confirm: true,
    });

    if (createAuthError || !createdAuth?.user) {
      throw new Error(
        `Failed to create Auth user: ${
          createAuthError?.message ?? "Unknown error"
        }`
      );
    }

    createdAuthUserId = createdAuth.user.id;

    // --------------------------------------------------
    // 7. Database enrollment
    //
    // IMPORTANT:
    // Do NOT generate UID here.
    // enroll_student_v2() owns UID generation.
    // --------------------------------------------------

    const { data: enrollmentRows, error: enrollmentError } =
      await adminJwtClient.rpc("enroll_student_v2", {
        p_student_id: parsedStudentId,
        p_auth_user_id: createdAuthUserId,
        p_academic_year: parsedAcademicYear,
      });

    if (enrollmentError) {
      // DB enrollment failed, so the new Auth identity must
      // not be left orphaned.
      const { error: cleanupError } =
        await serviceClient.auth.admin.deleteUser(
          createdAuthUserId
        );

      createdAuthUserId = null;

      if (cleanupError) {
        console.error(
          "Failed to clean up Auth user after enrollment failure:",
          cleanupError
        );
      }

      return jsonResponse(
        {
          success: false,
          error: "Database enrollment failed",
          details: enrollmentError.message,
          authCleanupSucceeded: !cleanupError,
        },
        400
      );
    }

    const enrollment = Array.isArray(enrollmentRows)
      ? enrollmentRows[0]
      : enrollmentRows;

    if (!enrollment?.login_username) {
      // At this point the DB may already contain the enrollment.
      // Therefore DO NOT delete the Auth account.
      databaseEnrollmentCompleted = true;

      return jsonResponse(
        {
          success: false,
          partialSuccess: true,
          error:
            "Database enrollment completed but no login username was returned",
          authUserId: createdAuthUserId,
        },
        500
      );
    }

    databaseEnrollmentCompleted = true;

    // --------------------------------------------------
    // 8. Convert temporary Auth email → permanent email
    // --------------------------------------------------

    const finalEmail =
      `${enrollment.login_username.toLowerCase()}` +
      "@students.pranjalpathshala.local";

    const { error: updateAuthError } =
      await serviceClient.auth.admin.updateUserById(
        createdAuthUserId,
        {
          email: finalEmail,
          email_confirm: true,
        }
      );

    if (updateAuthError) {
      // CRITICAL:
      // DB enrollment already succeeded.
      // DO NOT delete the Auth user.
      return jsonResponse(
        {
          success: false,
          partialSuccess: true,
          error:
            "Student was enrolled, but the Auth email could not be finalized",
          details: updateAuthError.message,
          authUserId: createdAuthUserId,
          temporaryEmail,
          expectedEmail: finalEmail,
          enrollment,
        },
        500
      );
    }

    // --------------------------------------------------
    // 9. Success
    // --------------------------------------------------

    return jsonResponse({
      success: true,
      message: "Student enrolled successfully",
      enrollment: {
        ...enrollment,
        auth_user_id: createdAuthUserId,
        auth_email: finalEmail,
      },
    });
  } catch (error) {
    console.error("enroll-student error:", error);

    // Only clean up if the Auth user exists AND DB enrollment
    // has definitely not completed.
    if (createdAuthUserId && !databaseEnrollmentCompleted) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY"
        );

        if (supabaseUrl && serviceRoleKey) {
          const cleanupClient = createClient(
            supabaseUrl,
            serviceRoleKey
          );

          const { error: cleanupError } =
            await cleanupClient.auth.admin.deleteUser(
              createdAuthUserId
            );

          if (cleanupError) {
            console.error(
              "Emergency Auth cleanup failed:",
              cleanupError
            );
          }
        }
      } catch (cleanupException) {
        console.error(
          "Emergency cleanup exception:",
          cleanupException
        );
      }
    }

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected enrollment error",
      },
      500
    );
  }
});