import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an admin Supabase client using the SUPABASE_SERVICE_ROLE_KEY.
 * Use ONLY in secure server-side environments (Server Actions, Route Handlers).
 * Never expose this or use it on client-side components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
