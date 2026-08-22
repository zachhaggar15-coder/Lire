export type SubscriptionStatus = "none" | "active" | "grace_period" | "cancelled" | "expired";

export interface PremiumStatus {
  isPremium: boolean;
  status: SubscriptionStatus;
  expiresAt: string | null;
}

export const FREE_PREMIUM_STATUS: PremiumStatus = {
  isPremium: false,
  status: "none",
  expiresAt: null,
};
