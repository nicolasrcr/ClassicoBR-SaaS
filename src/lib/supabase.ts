import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xofxreamixinswjxncxf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZnhyZWFtaXhpbnN3anhuY3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDM2OTksImV4cCI6MjA5NjUxOTY5OX0.qNTPD3YfMeTpyt5ojUQcyU3PVLwxIxeT2Up0Wuz9TbA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
