import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof typeof supabaseClient];
  },
}) as any;
