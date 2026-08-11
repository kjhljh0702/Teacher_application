import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const APP_ROLES = new Set(["teacher", "director", "operator", "admin"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 4096;

function allowedOrigins(): Set<string> {
  return new Set(
    (Deno.env.get("ALLOWED_ORIGINS") || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function responseHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
  if (origin && allowedOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "authorization, apikey, content-type, x-client-info";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return headers;
}

function json(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

function bearerToken(value: string | null): string | null {
  if (!value || value.length > 8192) return null;
  const match = value.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] || null;
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  const origin = request.headers.get("Origin");
  const origins = allowedOrigins();

  if (origin && !origins.has(origin)) {
    return json(403, { error: "origin_not_allowed", requestId }, null);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (request.method !== "POST") {
    return json(405, { error: "method_not_allowed", requestId }, origin);
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json(413, { error: "request_too_large", requestId }, origin);
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(415, { error: "json_required", requestId }, origin);
  }

  const token = bearerToken(request.headers.get("Authorization"));
  if (!token) {
    return json(401, { error: "authentication_required", requestId }, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serverSecret = Deno.env.get("APP_SUPABASE_SECRET_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serverSecret) {
    console.error(JSON.stringify({ requestId, event: "missing_server_configuration" }));
    return json(503, { error: "service_unavailable", requestId }, origin);
  }

  const admin = createClient(supabaseUrl, serverSecret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const authResult = await admin.auth.getUser(token);
  const actor = authResult.data.user;
  if (authResult.error || !actor) {
    return json(401, { error: "invalid_session", requestId }, origin);
  }
  if (actor.is_anonymous) {
    return json(403, { error: "permanent_admin_account_required", requestId }, origin);
  }

  const accessResult = await admin
    .from("user_roles")
    .select("role,verified,revoked_at")
    .eq("user_id", actor.id)
    .maybeSingle();
  if (accessResult.error) {
    console.error(JSON.stringify({ requestId, event: "admin_access_lookup_failed", code: accessResult.error.code }));
    return json(500, { error: "role_change_failed", requestId }, origin);
  }
  if (
    accessResult.data?.role !== "admin" ||
    accessResult.data?.verified !== true ||
    accessResult.data?.revoked_at
  ) {
    return json(403, { error: "administrator_access_required", requestId }, origin);
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json(413, { error: "request_too_large", requestId }, origin);
    }
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(400, { error: "invalid_json", requestId }, origin);
    }
    body = parsed as Record<string, unknown>;
  } catch (_) {
    return json(400, { error: "invalid_json", requestId }, origin);
  }

  const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : "";
  const role = typeof body.role === "string" ? body.role : "";
  const verified = body.verified;
  if (!UUID_PATTERN.test(targetUserId) || !APP_ROLES.has(role) || typeof verified !== "boolean") {
    return json(400, { error: "invalid_role_change", requestId }, origin);
  }
  if (targetUserId === actor.id) {
    return json(403, { error: "self_role_change_forbidden", requestId }, origin);
  }

  const targetResult = await admin.auth.admin.getUserById(targetUserId);
  if (targetResult.error || !targetResult.data.user) {
    return json(404, { error: "target_user_not_found", requestId }, origin);
  }

  const changeResult = await admin.rpc("admin_set_user_role", {
    p_actor_user_id: actor.id,
    p_target_user_id: targetUserId,
    p_role: role,
    p_verified: verified,
    p_request_id: requestId,
  });
  if (changeResult.error) {
    console.error(JSON.stringify({ requestId, event: "role_change_failed", code: changeResult.error.code }));
    const status = changeResult.error.code === "42501" ? 403 : changeResult.error.code === "P0001" ? 429 : 500;
    return json(status, { error: "role_change_failed", requestId }, origin);
  }

  return json(200, { data: changeResult.data, requestId }, origin);
});
