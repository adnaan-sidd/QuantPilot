import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credentials provided by user
const supabaseUrl = "https://vdtlviqnilbtjnncbkiu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdGx2aXFuaWxidGpubmNia2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkzMjMsImV4cCI6MjA4MDM2NTMyM30.AQdzTAIY1xkEw5JHpCOm8ZC0isQRQ0Sr0j1PkIinPtA";

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = (): boolean => {
    return true; // We now have hardcoded valid credentials
}