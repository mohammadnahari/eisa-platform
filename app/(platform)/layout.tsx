import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as ProfileRow | null
  if (!profile) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar profile={profile} />
      <main style={{
        flex: 1,
        marginRight: 'var(--sidebar-width)',
        minHeight: '100vh',
        padding: '2rem',
        maxWidth: 'calc(100vw - var(--sidebar-width))',
      }}>
        {children}
      </main>
    </div>
  )
}
