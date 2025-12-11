import { createClient } from '@supabase/supabase-js'

// supabaseClient.js initializes the Supabase client used throughout the app.
// Keep this file minimal; if you rotate keys or use environment variables,
// update the constants here or replace them with a secure process.env usage.
const SUPABASE_URL = 'https://mdvqplgklaxlujugvaij.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdnFwbGdrbGF4bHVqdWd2YWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NzE4MTAsImV4cCI6MjA4MDA0NzgxMH0.HS_R5rxiMsQmXo-9qsVCv_hIIxdCzEPTe5b7bBoCeDQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
