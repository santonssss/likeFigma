import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fovxpbsaajkpqgutzzbk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdnhwYnNhYWprcHFndXR6emJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDY0OTcsImV4cCI6MjA0ODI4MjQ5N30.1xGgtT6hygLBcH13J3FcsaLwBu0flOrCVc4ZzwIPxB0";
const supabase = createClient(supabaseUrl, supabaseKey);
