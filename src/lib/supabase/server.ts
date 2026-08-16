// OWNER: shared foundation. Server Components / Server Actions / Route Handlers only.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component with no request context — safe to ignore
            // as long as middleware.ts is refreshing the session.
          }
        },
      },
    }
  );
}

/**
 * SERVICE ROLE client — bypasses RLS entirely. Server-only, never import
 * this from a "use client" file or a Route Handler that echoes input back
 * unchecked. Used sparingly (e.g. admin scripts), NOT for normal request
 * handling — normal handling should go through RLS + the book_appointment
 * RPC so the database keeps enforcing correctness even if application code
 * has a bug.
 */
export function createServiceRoleClient() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
