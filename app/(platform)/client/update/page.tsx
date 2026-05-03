import { WeeklyUpdateForm } from '@/features/client-portal/components/WeeklyUpdateForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function WeeklyUpdatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, current_stage')
    .eq('profile_id', user.id)
    .single()

  if (!client) redirect('/client')

  // Calculate current week number
  const { data: lastUpdate } = await supabase
    .from('weekly_updates')
    .select('week_number')
    .eq('client_id', client.id)
    .order('week_number', { ascending: false })
    .limit(1)
    .single()

  const currentWeek = (lastUpdate?.week_number ?? 0) + 1

  // Check if already submitted this week
  const { data: thisWeek } = await supabase
    .from('weekly_updates')
    .select('id, status_color, coach_reply, coach_reply_at')
    .eq('client_id', client.id)
    .eq('week_number', currentWeek - 1)
    .single()

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
          التحديث الأسبوعي
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          الأسبوع {currentWeek} من رحلتك
        </p>
      </div>

      {thisWeek && !lastUpdate ? (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-status-green)' }}>
            ✓ تم إرسال تحديثك هذا الأسبوع
          </p>
          {thisWeek.coach_reply && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 8, textAlign: 'right' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>ردّ الموجّه:</p>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.7 }}>{thisWeek.coach_reply}</p>
            </div>
          )}
        </div>
      ) : (
        <WeeklyUpdateForm clientId={client.id} weekNumber={currentWeek} />
      )}
    </div>
  )
}
