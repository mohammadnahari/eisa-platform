import { createClient } from '@/lib/supabase/server'

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const coachId = user.id

  const [
    { count: activeClients },
    { count: unreadUpdates },
    { count: pendingSessions },
    { count: pendingApprovals },
    { data: redClients },
    { data: recentUpdates },
  ] = await Promise.all([
    supabase.from('client_coaches').select('*', { count: 'exact', head: true }).eq('coach_id', coachId).is('ended_at', null),
    supabase.from('weekly_updates').select('*', { count: 'exact', head: true })
      .is('coach_reply', null)
      .in('client_id', supabase.from('client_coaches').select('client_id').eq('coach_id', coachId).is('ended_at', null) as unknown as string[]),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('coach_id', coachId).eq('status', 'scheduled'),
    supabase.from('stage_approvals').select('*', { count: 'exact', head: true }).eq('coach_id', coachId).eq('status', 'pending'),
    supabase.from('weekly_updates')
      .select('id, client_id, week_number, status_color, submitted_at, clients(profiles(full_name))')
      .eq('status_color', 'red')
      .order('submitted_at', { ascending: false })
      .limit(5),
    supabase.from('weekly_updates')
      .select('id, client_id, week_number, status_color, summary, submitted_at, coach_reply, clients(profiles(full_name))')
      .order('submitted_at', { ascending: false })
      .limit(8),
  ])

  const cardStyle = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-card)',
    border: '1px solid var(--color-border)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-card)',
  }

  const STATUS_BG: Record<string, string> = {
    green: 'var(--color-status-green-bg)',
    yellow: 'var(--color-status-yellow-bg)',
    red: 'var(--color-status-red-bg)',
  }
  const STATUS_COLOR: Record<string, string> = {
    green: 'var(--color-status-green)',
    yellow: 'var(--color-status-yellow)',
    red: 'var(--color-status-red)',
  }
  const STATUS_LABEL: Record<string, string> = { green: 'أخضر', yellow: 'أصفر', red: 'أحمر' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>لوحتي</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>نظرة عامة على عملائك وأعمالك</p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'العملاء النشطون', value: activeClients ?? 0, color: 'var(--color-status-green)' },
          { label: 'تحديثات بدون رد', value: unreadUpdates ?? 0, color: 'var(--color-status-yellow)' },
          { label: 'الجلسات القادمة', value: pendingSessions ?? 0, color: 'var(--color-primary)' },
          { label: 'اعتمادات معلقة', value: pendingApprovals ?? 0, color: 'var(--color-accent)' },
        ].map(m => (
          <div key={m.label} style={cardStyle}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{m.label}</p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Red clients */}
        <div style={cardStyle}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', marginBottom: '1rem', color: 'var(--color-status-red)' }}>
            🔴 العملاء في الوضع الأحمر
          </h2>
          {!redClients?.length ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لا يوجد عملاء في الوضع الأحمر</p>
          ) : redClients.map((u: Record<string, unknown>) => (
            <div key={u.id as string} style={{ padding: '0.75rem', background: 'var(--color-status-red-bg)', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-status-red)' }}>
                {((u.clients as Record<string, unknown>)?.profiles as Record<string, unknown>)?.full_name as string ?? 'عميل'}
              </span>
              <span style={{ float: 'left', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                الأسبوع {u.week_number as number}
              </span>
            </div>
          ))}
        </div>

        {/* Recent updates inbox */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>صندوق التحديثات</h2>
            <a href="/coach/clients" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', textDecoration: 'none' }}>عرض الكل</a>
          </div>
          {!recentUpdates?.length ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لا يوجد تحديثات</p>
          ) : recentUpdates.map((u: Record<string, unknown>) => (
            <div key={u.id as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem', borderRadius: '8px', marginBottom: '0.375rem', background: u.coach_reply ? 'transparent' : 'rgba(200,169,110,0.06)', border: `1px solid ${u.coach_reply ? 'var(--color-border)' : 'rgba(200,169,110,0.2)'}` }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  {((u.clients as Record<string, unknown>)?.profiles as Record<string, unknown>)?.full_name as string ?? 'عميل'}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>
                  الأسبوع {u.week_number as number}
                </span>
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: 20, fontSize: 'var(--font-size-xs)', fontWeight: 600,
                background: STATUS_BG[u.status_color as string] ?? '',
                color: STATUS_COLOR[u.status_color as string] ?? '',
              }}>
                {STATUS_LABEL[u.status_color as string] ?? u.status_color as string}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
