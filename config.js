// Public runtime configuration only. Never place secret/service-role keys here.
window.APP_CONFIG = Object.freeze({
  supabaseUrl: "",
  supabasePublishableKey: "",
  kakaoMapJavaScriptKey: "",
  turnstileSiteKey: "",
  allowedOAuthRedirectOrigins: ["http://localhost:4173"],
  allowDemoMode: true,
});
