// Supabase client factory. The URL + anon (publishable) key are injected at build
// time from Vite env vars. The anon key is meant to be public — security is
// enforced by row-level security on the database (public read-only, no writes),
// NOT by hiding this key. The service_role key must never appear in this bundle.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Not configured (e.g. local dev before secrets are set) → use JSON fallback.
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}
