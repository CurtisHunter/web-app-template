import { Purchases } from "@revenuecat/purchases-js";
import type { PurchaseResult } from "@revenuecat/purchases-js";

const revenueCatApiKey = import.meta.env.VITE_REVENUECAT_API_KEY;

export function configureRevenueCat(appUserId: string) {
  if (!revenueCatApiKey) return null;

  if (Purchases.isConfigured()) {
    return Purchases.getSharedInstance();
  }

  return Purchases.configure({
    apiKey: revenueCatApiKey,
    appUserId,
  });
}

export async function userHasProEntitlement() {
  const purchases = Purchases.getSharedInstance();
  const customerInfo = await purchases.getCustomerInfo();

  return "pro" in customerInfo.entitlements.active;
}

export async function presentProPaywall(): Promise<PurchaseResult | null> {
  const purchases = Purchases.getSharedInstance();
  const offerings = await purchases.getOfferings();
  const currentOffering = offerings.current;

  if (!currentOffering) {
    return null;
  }

  return purchases.presentPaywall({ offering: currentOffering });
}
