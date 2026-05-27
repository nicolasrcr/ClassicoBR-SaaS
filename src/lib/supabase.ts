import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ygynluulrrazxfqrwcby.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneW5sdXVscnJhenhmcXJ3Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDIzNTEsImV4cCI6MjA5NTM3ODM1MX0.IEuqB_m9SB35LP4cyeZLCjvkvmK9C2gwjUIyBL9-w8w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
