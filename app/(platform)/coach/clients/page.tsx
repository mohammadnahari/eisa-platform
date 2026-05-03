import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STAGE_NAMES: Record<number, string> = {
  0:'ما قبل الرحلة',1:'الأهداف',2:'التحديات',3:'القيم',4:'الروتين',
  5:'الواجبات',6:'التعمق',7:'الأنماط',8:'المعتقدات',9:'البوصلة',
  10:'الدمج',11:'التثبيت',12:'الاكتمال'
}
const STATUS_LABEL: Record<string, string> = { active:'نشط', paused:'متوقف', completed:'مكتمل', dropped:'منسحب' }
const STATUS_COLOR: Record<string, string> = { active:'var(--color-status-green)', paused:'var(--color-status-yellow)', completed:'var(--color-primary)', dropped:'var(--color-status-red)' }

export default async function CoachClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: assignments } = await supabase
    .from('client_coaches')
    .select('client_id, role, clients(id, current_stage, status, client_type, profiles(full_name, email))')
    .eq('coach_id', user.id)
    .is('ended_at', null)
    .order('assigned_at', { ascending: false })

  const { data: latestUpdates } = await supabase
    .from('weekly_updates')
    .select('client_id, status_color, week_number, coach_reply')
    .in('client_id', (assignments ?? []).map(a => a.client_id))
    .order('submitted_at', { ascending: false })

  // Get latest update per client
  const updateMap: Record<string, { status_color: string; week_number: number; coach_reply: string | null }> = {}
  latestUpdates?.forEach(u => { if (!updateMap[u.client_id]) updateMap[u.client_id] = u })

  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }
  const STATUS_BG: Record<string, string> = { green:'var(--color-status-green-bg)', yellow:'var(--color-status-yellow-bg)', red:'var(--color-status-red-bg)' }
  const COLOR: Record<string, string> = { green:'var(--color-status-green)', yellow:'var(--color-status-yellow)', red:'var(--color-status-red)' }
  const ULABEL: Record<string, string> = { green:'أخضر', yellow:'أصفر', red:'أحمر' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>عملائي</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          {assignments?.length ?? 0} عميل نشط
        </p>
      </div>

      {!assignments?.length ? (
        <div style={{ ...card, padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>لا يوجد عملاء مُسنَدون إليك حتى الآن</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assignments.map(a => {
            const client = a.clients as Record<string, unknown>
            const profile = (client?.profiles as Record<string, unknown>)
            const lastUpdate = updateMap[a.client_id]
            const stage = client?.current_stage as number ?? 0
            const status = client?.status as string ?? 'active'
            return (
              <Link key={a.client_id} href={`/coach/clients/${a.client_id}`}
                style={{ ...card, padding: '1.25rem 1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.15s' }}>
                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 800, flexShrink: 0 }}>
                  {(profile?.full_name as string)?.[0] ?? '؟'}
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 'var(--font-size-base)' }}>
                      {profile?.full_name as string ?? 'بدون اسم'}
                    </p>
                    <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: STATUS_COLOR[status] + '18', color: STATUS_COLOR[status] }}>
                      {STATUS_LABEL[status]}
                    </span>
                    {a.role === 'primary' && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', fontWeight: 600 }}>موجّه رئيسي</span>}
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '0.125rem' }}>
                    المرحلة {stage}: {STAGE_NAMES[stage]}
                  </p>
                </div>
                {/* Stage progress bar */}
                <div style={{ width: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                    <span>التقدم</span><span>{Math.round(stage/12*100)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-bg)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(stage/12*100)}%`, height: '100%', background: 'var(--color-accent)', borderRadius: 3 }} />
                  </div>
                </div>
                {/* Last update status */}
                {lastUpdate ? (
                  <div style={{ textAlign: 'center', minWidth: 72 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 'var(--font-size-xs)', fontWeight: 700, background: STATUS_BG[lastUpdate.status_color], color: COLOR[lastUpdate.status_color], display: 'block' }}>
                      {ULABEL[lastUpdate.status_color]}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                      أسبوع {lastUpdate.week_number}
                      {!lastUpdate.coach_reply && ' •'}
                    </span>
                    {!lastUpdate.coach_reply && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', fontWeight: 600 }}>بانتظار ردك</span>
                    )}
                  </div>
                ) : (
                  <div style={{ minWidth: 72, textAlign: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>لا تحديثات</span>
                  </div>
                )}
                <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-lg)' }}>←</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
