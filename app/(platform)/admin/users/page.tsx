import { createClient } from '@/lib/supabase/server'
import { AdminUsersClient } from '@/features/admin/components/AdminUsersClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>المستخدمون</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>إدارة الموجّهين والعملاء</p>
      </div>
      <AdminUsersClient profiles={profiles ?? []} />
    </div>
  )
}
