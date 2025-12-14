import { createClient } from '@supabase/supabase-js'

// Use Vite environment variables.
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_ANON_KEY=...
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.warn('Missing VITE_SUPABASE_* env vars — create .env with keys')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
