import { createBrowserClient } from '@supabase/ssr'

// No <Database> generic — avoids @supabase/ssr@0.10.2 type inference bug
// Use explicit type assertions at query sites: data as ProfileRow | null
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
