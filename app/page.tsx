import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/lib/types/database.types'
import LandingPage from '@/components/landing/LandingPage'

export const dynamic = 'force-dynamic'

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  coach: '/coach',
  client: '/client',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    const profile = data as Pick<ProfileRow, 'role' | 'is_active'> | null

    if (profile?.is_active) {
      redirect(ROLE_HOME[profile.role] ?? '/login')
    }
  }

  return <LandingPage />
}
