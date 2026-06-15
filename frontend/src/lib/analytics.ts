// frontend/src/lib/analytics.ts
//
// Google Analytics 4 consent helper (Consent Mode v2).
//
// The gtag.js library and its default "denied" consent state are set up in
// frontend/index.html. This module only flips ANALYTICS consent on or off in
// response to the cookie banner, so no _ga cookies are set until the visitor
// accepts analytical cookies — matching our Cookies Policy and GDPR.
//
// We intentionally only touch analytics_storage. Advertising signals
// (ad_storage / ad_user_data / ad_personalization) stay denied, because we
// don't run ads and only disclose analytics cookies in the policy.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Grant or revoke Google Analytics storage consent.
 * Called when the visitor accepts/declines the cookie banner, and on load
 * for returning visitors who already accepted (since the page defaults to
 * denied on every load).
 */
export function setAnalyticsConsent(granted: boolean): void {
  window.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}
