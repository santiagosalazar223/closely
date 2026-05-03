"use client";

import { getSupabase } from "./supabase";

type EventName =
  | "page_view"
  | "register_started"
  | "register_completed"
  | "login_completed"
  | "onboarding_started"
  | "onboarding_completed"
  | "listing_created"
  | "listing_viewed"
  | "business_saved"
  | "valuation_started"
  | "valuation_completed"
  | "valuation_failed"
  | "valuation_applied"
  | "message_sent"
  | "feedback_submitted"
  | "pricing_viewed"
  | "upgrade_clicked"
  | "search_performed"
  | "filter_applied"
  | "cta_clicked";

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

let cachedUserId: string | null = null;

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    cachedUserId = data.user?.id ?? null;
    return cachedUserId;
  } catch {
    return null;
  }
}

export async function track(name: EventName, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;

  try {
    const supabase = getSupabase();
    const userId = await getUserId();

    await supabase.from("events").insert({
      user_id: userId,
      name,
      properties: properties as never,
      path: window.location.pathname,
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch {
    // Never let analytics break the app
  }
}

// Reset cached user id on logout
export function resetAnalyticsUser() {
  cachedUserId = null;
}

// Convenience wrapper for page views
export function trackPageView(path?: string) {
  track("page_view", { path: path ?? (typeof window !== "undefined" ? window.location.pathname : "") });
}
