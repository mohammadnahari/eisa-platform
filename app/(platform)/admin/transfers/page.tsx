import { createClient } from '@/lib/supabase/server'
import { AdminTransfersClient } from '@/features/admin/components/AdminTransfersClient'

export default async function AdminTransfersPage() {
  const supabase = await createClient()
  const { data: transfers } = await supabase
    .from('transfer_requests')
    .select('*, clients(profiles(full_name)), from_coach:from_coach_id(full_name), to_coach:to_coach_id(full_name)')
    .order('requested_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>طلبات نقل العملاء</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          {transfers?.filter(t => t.status === 'pending').length ?? 0} طلب معلّق
        </p>
      </div>
      <AdminTransfersClient transfers={transfers ?? []} />
    </div>
  )
}
