import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// NOTE:
// In some preview/build environments, Vite env injection can fail temporarily.
// This wrapper keeps the app functional by falling back to known-safe public values.
// (Anon/publishable key + project URL are safe to ship to the browser.)

const FALLBACK_SUPABASE_URL = "https://mkwnlztpyzjjhzfxgixx.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd25senRweXpqamh6ZnhnaXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzQzNzQsImV4cCI6MjA4NDg1MDM3NH0.VYVhu_ao6PwxDZl3DjNPytZ9E6_zZg-f3ROP5IfkKpk";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
