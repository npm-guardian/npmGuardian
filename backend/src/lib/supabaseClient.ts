import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

/**
 * Admin client using the service_role key.
 * Use this for server-side operations that bypass Row Level Security.
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Public client using the anon key.
 * Use this for operations that should respect Row Level Security.
 */
export const supabasePublic: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
