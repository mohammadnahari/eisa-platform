import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, SessionRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function CoachSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: pd } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = pd as ProfileRow | null

  const { data } = await supabase
    .from('sessions')
    .select('*, clients!inner(profiles!inner(full_name))')
    .eq('coach_id', user!.id)
    .order('scheduled_at', { ascending: false })

  const sessions = (data ?? []) as unknown as (SessionRow & { clients: { profiles: { full_name: string } | null } | null })[]

  return (
    <div>
      <Header title="الجلسات" profile={profile!} subtitle="جميع جلساتك مع العملاء" />
      <div style={{ padding: 28 }}>
        <div style={S.list}>
          {sessions.length === 0
            ? <div style={S.empty}>لا توجد جلسات بعد</div>
            : sessions.map(s => (
              <div key={s.id} style={S.card}>
                <div style={S.cardLeft}>
                  <div style={S.sessionNum}>جلسة #{s.session_number ?? '—'}</div>
                  <div style={S.clientName}>{s.clients?.profiles?.full_name ?? '—'}</div>
                  {s.title && <div style={S.title}>{s.title}</div>}
                </div>
                <div style={S.cardRight}>
                  <div style={{ color: s.status === 'completed' ? '#4CAF7D' : s.status === 'cancelled' ? '#E05555' : '#F0C040', fontSize: 12, marginBottom: 6 }}>
                    ● {s.status === 'scheduled' ? 'مجدولة' : s.status === 'completed' ? 'منعقدة' : 'ملغاة'}
                  </div>
                  {s.scheduled_at && (
                    <div style={S.date}>{new Date(s.scheduled_at).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  )}
                  <div style={S.format}>{s.format === 'online' ? '🌐 أونلاين' : s.format === 'physical' ? '🤝 حضوري' : s.format ?? '—'}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: {},
  cardRight: { textAlign: 'left' },
  sessionNum: { fontSize: 11, color: '#C9A84C', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 },
  clientName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 13, color: 'rgba(237,232,220,0.5)' },
  date: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginBottom: 4 },
  format: { fontSize: 12, color: 'rgba(237,232,220,0.35)' },
  empty: { textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.25)', fontSize: 14 },
}
