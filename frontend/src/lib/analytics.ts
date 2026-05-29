import mixpanel from "mixpanel-browser";

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

if (mixpanelToken) {
  // Frontend analytics is best-effort. Browser privacy tools may block it, so
  // app behavior should never depend on Mixpanel requests succeeding.
  mixpanel.init(mixpanelToken, {
    autocapture: true,
    record_sessions_percent: import.meta.env.DEV ? 100 : 10,
  });
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.track(eventName, properties);
}

export function identifyUser(userId: string) {
  if (!mixpanelToken) {
    return;
  }

  // Use the stable Supabase user id, not email/name, to avoid unnecessary PII.
  mixpanel.identify(userId);
}

export function resetAnalytics() {
  if (!mixpanelToken) {
    return;
  }

  // Prevent the next user on the same browser from inheriting this identity.
  mixpanel.reset();
}
