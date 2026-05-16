import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import type { ProfileRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as ProfileRow | null

  if (!profile || profile.is_active === false) redirect('/login?reason=suspended')
  if (profile.role !== 'client') redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080808' }}>
      <Sidebar profile={profile} />
      <main style={{ flex: 1, marginRight: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
