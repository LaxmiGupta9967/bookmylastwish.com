import { createClient } from '@supabase/supabase-js'

// ❗ IMPORTANT: Replace these with your actual Supabase project URL and Public Anon Key
const supabaseUrl = 'https://gvgcdwfseasqhspkllga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Z2Nkd2ZzZWFzcWhzcGtsbGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTA1MzYsImV4cCI6MjA3NDc4NjUzNn0.IGpOIFrPfO1D5uKsMwI9h3BrHLKTXFDj7-QRfcND0fg'

export const SUPABASE_CONFIGURED = !supabaseUrl.includes('your-project-ref') && !supabaseAnonKey.includes('your-public-anon-key');

if (!SUPABASE_CONFIGURED) {
    const warning = "Supabase credentials are set to placeholders in lib/supabase.ts. Authentication and data features are disabled. Please update with your project's URL and anon key for the application to function correctly.";
    console.warn(warning);
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey)