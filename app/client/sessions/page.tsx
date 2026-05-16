import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, SessionRow, ClientRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function ClientSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: pd } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = pd as ProfileRow | null

  const { data: cd } = await supabase.from('clients').select('id').eq('profile_id', user!.id).single()
  const client = cd as Pick<ClientRow, 'id'> | null

  const sessions: (SessionRow & { coach: { full_name: string } | null })[] = []

  if (client) {
    const { data } = await supabase
      .from('sessions')
      .select('*, coach:profiles!sessions_coach_id_fkey(full_name)')
      .eq('client_id', client.id)
      .order('scheduled_at', { ascending: false })
    sessions.push(...((data ?? []) as typeof sessions))
  }

  const upcoming = sessions.filter(s => s.status === 'scheduled')
  const past = sessions.filter(s => s.status !== 'scheduled')

  return (
    <div>
      <Header title="جلساتي" profile={profile!} subtitle={`${sessions.length} جلسة في رحلتك`} />
      <div style={{ padding: 28 }}>
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={S.sectionTitle}>📅 الجلسات القادمة</div>
            {upcoming.map(s => <SessionCard key={s.id} session={s} upcoming />)}
          </div>
        )}
        {past.length > 0 && (
          <>
            <div style={S.sectionTitle}>الجلسات السابقة</div>
            {past.map(s => <SessionCard key={s.id} session={s} />)}
          </>
        )}
        {sessions.length === 0 && <div style={S.empty}>لا توجد جلسات بعد</div>}
      </div>
    </div>
  )
}

function SessionCard({ session: s, upcoming = false }: { session: SessionRow & { coach: { full_name: string } | null }; upcoming?: boolean }) {
  return (
    <div style={{ ...S.card, ...(upcoming ? S.upcomingCard : {}) }}>
      <div style={S.cardTop}>
        <div>
          <div style={S.sessionTitle}>{s.title ?? `جلسة #${s.session_number ?? '—'}`}</div>
          <div style={S.coachName}>مع {s.coach?.full_name ?? 'الموجّه'}</div>
        </div>
        <div style={{ textAlign: 'left' }}>
          {s.scheduled_at && (
            <div style={{ ...S.date, ...(upcoming ? { color: '#C9A84C' } : {}) }}>
              {new Date(s.scheduled_at).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          )}
          {upcoming && s.meeting_link && (
            <a href={s.meeting_link} target="_blank" rel="noreferrer" style={S.joinBtn}>رابط الدخول ↗</a>
          )}
        </div>
      </div>
      <div style={S.metaRow}>
        <span style={S.metaTag}>{s.session_type === 'individual' ? 'فردية' : 'جماعية'}</span>
        <span style={S.metaTag}>{s.format === 'online' ? '🌐 أونلاين' : '🤝 حضوري'}</span>
        {s.status === 'completed' && <span style={{ ...S.metaTag, color: '#4CAF7D', borderColor: 'rgba(76,175,125,0.3)' }}>✅ منعقدة</span>}
      </div>
      {s.action_items && (
        <div style={S.actionItems}>
          <div style={S.aiLabel}>نقاط العمل</div>
          <div style={S.aiContent}>{s.action_items}</div>
        </div>
      )}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'rgba(237,232,220,0.5)', letterSpacing: 0.5, marginBottom: 12 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '16px 20px', marginBottom: 10 },
  upcomingCard: { borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.04)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  sessionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  coachName: { fontSize: 12, color: 'rgba(237,232,220,0.45)' },
  date: { fontSize: 13, color: 'rgba(237,232,220,0.6)', textAlign: 'right', marginBottom: 6 },
  joinBtn: { display: 'inline-block', background: '#C9A84C', color: '#000', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' },
  metaRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaTag: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'rgba(237,232,220,0.55)' },
  actionItems: { marginTop: 12, background: '#1A1A1A', borderRadius: 8, padding: '10px 12px' },
  aiLabel: { fontSize: 10, color: '#C9A84C', fontWeight: 700, marginBottom: 4 },
  aiContent: { fontSize: 13, color: 'rgba(237,232,220,0.6)', lineHeight: 1.6 },
  empty: { textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.25)', fontSize: 14 },
}
