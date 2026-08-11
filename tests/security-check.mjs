import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

const [app, contentPolicy, config, configExample, html, schema, serviceWorker, edgeFunction, headers] = await Promise.all([
  read("app.js"),
  read("content-policy.js"),
  read("config.js"),
  read("config.example.js"),
  read("index.html"),
  read("supabase/schema.sql"),
  read("service-worker.js"),
  read("supabase/functions/manage-user-role/index.ts"),
  read("_headers"),
]);

const checks = [];
function check(name, condition, message) {
  assert.ok(condition, message || name);
  checks.push(name);
}

check("public config starts empty", /supabasePublishableKey:\s*""/.test(config));
check("Kakao public JavaScript key starts empty", /kakaoMapJavaScriptKey:\s*""/.test(config));
check("production config example disables demo mode", /allowDemoMode:\s*false/.test(configExample));
check("browser rejects secret keys", /startsWith\("sb_secret_"\)/.test(app));
check("legacy browser key inputs removed", !/id="(?:cloudUrl|cloudAnonKey)"/.test(html));
check("cloud credentials are not persisted", !/state\.cloud\.(?:url|anonKey|publishableKey)\s*=/.test(app));
check(
  "cloud mode never falls back to local director access",
  /if \(!cloudRuntime\.client\) return state\.profile\.role === "director";\s*if \(!cloudRuntime\.user\) return false;/.test(app),
);
check("Supabase SDK is version pinned", /@supabase\/supabase-js@2\.95\.0/.test(html));
check("Supabase SDK has SRI", /integrity="sha384-[A-Za-z0-9+/=]+"/.test(html));
check("runtime config is network only", /config\.js/.test(serviceWorker) && /cache:\s*"no-store"/.test(serviceWorker));
check("online static assets are network first", /event\.respondWith\(\s*fetch\(event\.request\)/.test(serviceWorker));
check("login gate precedes app shell", html.indexOf('id="authGate"') < html.indexOf('id="appShell"'));
check("Kakao login is the primary entry action", /id="cloudKakaoBtn"[^>]*class="btn kakao"/.test(html));
check("content policy loads before the app", html.indexOf("content-policy.js") < html.indexOf("app.js?v="));
check(
  "feature pages are isolated panels",
  ["homePanel", "facilitiesPanel", "reviewsPanel", "jobsPanel", "communityPanel", "profilePanel", "moderationPanel"].every((id) =>
    html.includes(`id="${id}" class="panel`),
  ),
);

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateHtmlIds = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
const dynamicIds = new Set(["turnstile-script", "kakao-map-script"]);
const referencedIds = [...app.matchAll(/getElementById\("([^"]+)"\)/g)].map((match) => match[1]);
check("HTML IDs are unique", duplicateHtmlIds.length === 0);
check("all static JavaScript DOM references resolve", referencedIds.every((id) => htmlIds.includes(id) || dynamicIds.has(id)));

check("trusted role table exists", /create table if not exists public\.user_roles/.test(schema));
check("all sensitive tables force RLS", (schema.match(/force row level security/g) || []).length >= 10);
check("profile selection is self-only", /create policy profiles_select_self[\s\S]*?auth\.uid\(\)\) = user_id/.test(schema));
check("content updates are owner-only", (schema.match(/create policy (?:reviews|jobs|community)_update_owner/g) || []).length === 3);
check(
  "facility updates are pending-owner-only",
  /facilities_update_pending_owner[\s\S]*?auth\.uid\(\)\) = user_id and status = 'pending'[\s\S]*?with check \(\(select auth\.uid\(\)\) = user_id and status = 'pending'\)/.test(schema),
);
check("facility duplicate addresses are blocked", /unique index if not exists uq_facilities_name_address/.test(schema));
check("facility coordinates are constrained to Korea", /latitude between 33\.0 and 38\.7[\s\S]*longitude between 124\.5 and 131\.9/.test(schema));
check("jobs require a trusted verified role", /jobs_insert_authenticated[\s\S]*?has_app_role\(array\['director', 'admin'\]/.test(schema));
check("anonymous users cannot create jobs", /jobs_insert_authenticated[\s\S]*?is_anonymous[\s\S]*?is distinct from 'true'/.test(schema));
check("report events have no SELECT policy", !/create policy report_events_select/i.test(schema));
check("report events have no SELECT grant", !/grant select[^;]*report_events/i.test(schema));
check("duplicate reports are blocked", /create unique index[^\n]*report_events \(item_id, reporter_id\)/.test(schema));
check("report reasons use a fixed client allowlist", /REPORT_REASON_OPTIONS/.test(app) && !/prompt\("신고 사유/.test(app));
check("report reasons use a fixed database allowlist", /report_events_reason_check/.test(schema) && /invalid report reason/.test(schema));
check("public report RPC returns aggregates", /function public\.get_report_statuses\(\)/.test(schema));
check("operator queue checks trusted roles", /get_operator_report_queue[\s\S]*?has_app_role\(array\['operator', 'admin'\]/.test(schema));
check("role changes are atomic and audited", /admin_set_user_role[\s\S]*?insert into public\.role_audit_log/.test(schema));
check("client cannot administer trusted roles", !/grant (?:insert|update|delete|all)[^;]*user_roles to authenticated/i.test(schema));
check("server enforces write rate limits", /pg_advisory_xact_lock/.test(schema) && /write rate limit exceeded/.test(schema));
check(
  "client masks targeted names, institutions, profanity, and sexual language",
  /type: "person"/.test(app) && /type: "institution"/.test(app) && /maskRestrictedLanguage/.test(app)
    && /profanity:/.test(contentPolicy) && /sexual:/.test(contentPolicy) && /maskWithStars/.test(app),
);
check("public free-text fields have policy previews", (html.match(/data-policy-preview/g) || []).length >= 6);
check(
  "server rejects unmasked policy bypasses",
  /function public\.enforce_public_text_policy\(\)/.test(schema) && /public text policy violation/.test(schema),
);
check(
  "public text policy covers inserts and updates",
  (schema.match(/public_text_policy before insert or update/g) || []).length === 5,
);
check(
  "text policy helpers are not client callable",
  /revoke all on function public\.public_text_has_restricted_language\(text\) from public, anon, authenticated/.test(schema)
    && /revoke all on function public\.public_text_has_prohibited_content\(text, boolean\) from public, anon, authenticated/.test(schema)
    && /revoke all on function public\.enforce_public_text_policy\(\) from public, anon, authenticated/.test(schema),
);

for (const table of ["reviews", "jobs", "community_posts", "facilities"]) {
  const grant = schema.match(new RegExp(`grant select \\(([^)]*)\\)\\s*on table public\\.${table}`, "i"));
  check(`${table} hides author UUID`, Boolean(grant) && !grant[1].split(",").map((value) => value.trim()).includes("user_id"));
}

check("client cannot set server timestamps", !/\b(?:created_at|updated_at|handled_by|handled_at):/.test(app));
const facilityRowMapper = app.match(/function facilityToRow\(facility\) \{[\s\S]*?\n\}/)?.[0] || "";
check("client cannot self-verify facilities", Boolean(facilityRowMapper) && !/\bstatus:/.test(facilityRowMapper));
check("nearby location remains runtime-only", /const mapRuntime =[\s\S]*?userLocation: null/.test(app) && !/snapshot\.(?:userLocation|location)/.test(app));
check("role function requires a user JWT", /admin\.auth\.getUser\(token\)/.test(edgeFunction));
check("role function rejects anonymous admins", /actor\.is_anonymous/.test(edgeFunction));
check("role function uses exact origin allowlist", /ALLOWED_ORIGINS/.test(edgeFunction) && !/Access-Control-Allow-Origin.*\*/.test(edgeFunction));
check("role function secret is environment-only", /Deno\.env\.get\("APP_SUPABASE_SECRET_KEY"\)/.test(edgeFunction));
check("role function calls atomic DB RPC", /admin\.rpc\("admin_set_user_role"/.test(edgeFunction));
check("deployment headers block framing", /frame-ancestors 'none'/.test(headers) && /X-Frame-Options: DENY/.test(headers));
check("deployment headers disable MIME sniffing", /X-Content-Type-Options: nosniff/.test(headers));
check("geolocation is limited to this origin", /Permissions-Policy:[^\n]*geolocation=\(self\)/.test(headers));

console.log(`security-check: ${checks.length} checks passed`);
