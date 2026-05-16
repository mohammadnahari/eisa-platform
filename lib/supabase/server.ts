import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// No <Database> generic — avoids @supabase/ssr@0.10.2 type inference bug
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — safe to ignore
          }
        },
      },
    }
  )
}
