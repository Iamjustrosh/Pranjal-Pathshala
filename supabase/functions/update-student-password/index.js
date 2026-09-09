import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return reply({ error: "Authentication required" }, 401);
    const url = Deno.env.get("SUPABASE_URL");
    const callerClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY"), {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser(authorization.slice(7).trim());
    if (authError || !user) return reply({ error: "Invalid or expired session" }, 401);
    const { data: caller, error: roleError } = await callerClient.from('app_users')
      .select('role, status').eq('auth_user_id', user.id).single();
    if (roleError || caller?.status !== 'active' || !['admin', 'super_admin'].includes(caller?.role)) {
      return reply({ error: "Only active admins can change student passwords" }, 403);
    }
    let body;
    try { body = await req.json(); } catch { return reply({ error: "Invalid JSON body" }, 400); }
    const studentId = Number(body?.studentId);
    const password = body?.password;
    if (!Number.isSafeInteger(studentId) || studentId <= 0 || typeof password !== 'string' || password.length < 6) {
      return reply({ error: "A valid student and password of at least 6 characters are required" }, 400);
    }
    // Verify the target is visible to this admin before using privileged Auth APIs.
    const { data: student, error: studentError } = await callerClient.from('students')
      .select('id, login_username').eq('id', studentId).single();
    if (studentError || !student?.login_username) return reply({ error: "Enrolled student not found or access denied" }, 404);
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Resolve Auth identity server-side. Never accept an arbitrary Auth user ID.
    const { data: target, error: mappingError } = await service.from('app_users')
      .select('auth_user_id').eq('student_id', studentId).eq('role', 'student').single();
    if (mappingError || !target?.auth_user_id) return reply({ error: "Student Auth mapping not found or ambiguous" }, 409);
    const { error } = await service.auth.admin.updateUserById(target.auth_user_id, { password });
    if (error) return reply({ error: error.message }, 400);
    return reply({ success: true });
  } catch {
    return reply({ error: "Unable to change password. Verify the function configuration and try again." }, 500);
  }
});
