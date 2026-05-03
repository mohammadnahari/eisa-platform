import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const STAGE_NAMES: Record<number, string> = {
  0: 'ما قبل الرحلة', 1: 'الأهداف', 2: 'التحديات', 3: 'القيم',
  4: 'الروتين', 5: 'مراجعة الواجبات', 6: 'التعمق', 7: 'تحديد الأنماط',
  8: 'المعتقدات', 9: 'بوصلة القرار', 10: 'الدمج', 11: 'التثبيت', 12: 'الاكتمال',
}

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*, profiles!clients_profile_id_fkey(full_name)')
    .eq('profile_id', user.id)
    .single()

  const { data: recentUpdates } = await supabase
    .from('weekly_updates')
    .select('*')
    .eq('client_id', client?.id ?? '')
    .order('submitted_at', { ascending: false })
    .limit(12)

  const { data: activeGoals } = await supabase
    .from('goals')
    .select('*')
    .eq('client_id', client?.id ?? '')
    .eq('status', 'active')
    .limit(5)

  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', client?.id ?? '')
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(3)

  const stage = client?.current_stage ?? 0
  const progress = Math.round((stage / 12) * 100)

  const STATUS_BG: Record<string, string> = { green: 'var(--color-status-green-bg)', yellow: 'var(--color-status-yellow-bg)', red: 'var(--color-status-red-bg)' }
  const STATUS_COLOR: Record<string, string> = { green: 'var(--color-status-green)', yellow: 'var(--color-status-yellow)', red: 'var(--color-status-red)' }
  const STATUS_LABEL: Record<string, string> = { green: 'أخضر', yellow: 'أصفر', red: 'أحمر' }

  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>رحلتي</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>مرحباً بك في منصة عيسى للتدريب</p>
      </div>

      {/* Stage progress */}
      <div style={{ ...card, marginBottom: '1.5rem', background: 'var(--color-primary)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>المرحلة الحالية</p>
            <h2 style={{ color: '#fff', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              {STAGE_NAMES[stage]} <span style={{ opacity: 0.5, fontSize: 'var(--font-size-base)' }}>({stage} / 12)</span>
            </h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-accent)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{progress}%</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--font-size-xs)' }}>مكتمل</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-accent)', borderRadius: 8, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'var(--font-size-xs)' }}>البداية</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'var(--font-size-xs)' }}>الاكتمال</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Weekly color history */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>مسار الحالة الأسبوعية</h2>
            <a href="/client/update" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
              + تحديث هذا الأسبوع
            </a>
          </div>
          {!recentUpdates?.length ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لم يتم إرسال أي تحديث بعد</p>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {recentUpdates.map(u => (
                <div key={u.id} title={`الأسبوع ${u.week_number} — ${STATUS_LABEL[u.status_color]}`}
                  style={{ width: 36, height: 36, borderRadius: 8, background: STATUS_BG[u.status_color], border: `2px solid ${STATUS_COLOR[u.status_color]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: STATUS_COLOR[u.status_color] }}>
                  {u.week_number}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming session */}
        <div style={card}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', marginBottom: '1rem' }}>الجلسة القادمة</h2>
          {!upcomingSessions?.length ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لا توجد جلسات مجدولة</p>
          ) : (
            <div>
              <p style={{ fontWeight: 600 }}>{upcomingSessions[0].title ?? 'جلسة تدريب'}</p>
              {upcomingSessions[0].scheduled_at && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                  {new Date(upcomingSessions[0].scheduled_at).toLocaleString('ar-SA')}
                </p>
              )}
              {upcomingSessions[0].meeting_link && (
                <a href={upcomingSessions[0].meeting_link} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-btn)', textDecoration: 'none', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  انضمام للجلسة
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active goals */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>أهدافي النشطة</h2>
          <a href="/client/stages" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)', textDecoration: 'none' }}>عرض الكل</a>
        </div>
        {!activeGoals?.length ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لم يتم تحديد أهداف بعد</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {activeGoals.map(goal => (
              <div key={goal.id} style={{ padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>{goal.title}</p>
                {goal.target_date && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    الهدف: {new Date(goal.target_date).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
