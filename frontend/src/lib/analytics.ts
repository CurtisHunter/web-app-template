import mixpanel from "mixpanel-browser";

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

if (mixpanelToken) {
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

  mixpanel.identify(userId);
}

export function resetAnalytics() {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.reset();
}
