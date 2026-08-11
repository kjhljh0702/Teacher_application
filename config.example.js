// Copy the public Supabase values and Kakao JavaScript key only.
// sb_publishable_* is safe with RLS; restrict the Kakao key to exact web domains.
window.APP_CONFIG = Object.freeze({
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabasePublishableKey: "sb_publishable_REPLACE_ME",
  kakaoMapJavaScriptKey: "KAKAO_JAVASCRIPT_KEY",
  turnstileSiteKey: "TURNSTILE_PUBLIC_SITE_KEY",
  allowedOAuthRedirectOrigins: ["http://localhost:4173", "https://YOUR_APP_DOMAIN"],
  allowDemoMode: false,
});
