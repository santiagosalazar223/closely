import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Placeholder values keep the client from throwing when env vars are absent.
// The data hooks detect the missing config and fall back to mock data, so the
// app still boots (in demo mode) instead of 500-ing on every page.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Singleton for client components
let client: ReturnType<typeof createClient> | null = null;
export function getSupabase() {
  if (!client) client = createClient();
  return client;
}
