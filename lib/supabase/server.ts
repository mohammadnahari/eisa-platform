import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseConfig } from './config'

export async function createClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabaseKey } = getSupabaseConfig()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // This can happen when setting cookies from a Server Component.
          // Safe to ignore if middleware/proxy refreshes the session.
        }
      },
    },
  })
}
