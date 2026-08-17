import { createClient } from "@supabase/supabase-js";

let supabaseAdminClient: any = null;

function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ?? "";

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
}

// Solo usar en Server Actions y Route Handlers (nunca en código cliente)
export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseAdminClient()[prop as keyof typeof supabaseAdminClient];
  },
}) as any;
