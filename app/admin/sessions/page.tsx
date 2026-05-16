import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, SessionRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

interface SessionWithJoins extends SessionRow {
  coach: ProfileRow | null
  client_profiles: ProfileRow | null
}

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = profileData as ProfileRow | null

  const { data } = await supabase
    .from('sessions')
    .select('*, coach:profiles!sessions_coach_id_fkey(full_name), clients!inner(profiles!inner(full_name))')
    .order('scheduled_at', { ascending: false })
    .limit(50)

  const sessions = (data ?? []) as unknown as (SessionRow & {
    coach: { full_name: string } | null
    clients: { profiles: { full_name: string } | null } | null
  })[]

  const statusCount = { scheduled: 0, completed: 0, cancelled: 0 }
  sessions.forEach(s => { if (s.status && s.status in statusCount) statusCount[s.status as keyof typeof statusCount]++ })

  return (
    <div>
      <Header title="الجلسات" profile={profile!} subtitle="سجل جميع الجلسات المجدولة والمنعقدة" />
      <div style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[['scheduled','مجدولة','#F0C040'],['completed','منعقدة','#4CAF7D'],['cancelled','ملغاة','#E05555']].map(([k,l,c]) => (
            <div key={k} style={S.statCard}>
              <div style={{ fontSize: 28, fontWeight: 900, color: c as string }}>{statusCount[k as keyof typeof statusCount]}</div>
              <div style={{ fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={S.tableWrap}>
          <div style={S.tableHead}><div style={S.tableTitle}>قائمة الجلسات <span style={{ color: 'rgba(237,232,220,0.35)', fontSize: 12 }}>({sessions.length})</span></div></div>
          <table style={S.table}>
            <thead><tr style={S.thead}>
              {['العميل', 'الموجّه', 'النوع', 'الحالة', 'التاريخ'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={S.tr}>
                  <td style={S.td}>{s.clients?.profiles?.full_name ?? '—'}</td>
                  <td style={S.td}>{s.coach?.full_name ?? '—'}</td>
                  <td style={S.td}>{s.session_type === 'individual' ? 'فردية' : 'جماعية'}</td>
                  <td style={S.td}>
                    <span style={{ color: s.status === 'completed' ? '#4CAF7D' : s.status === 'cancelled' ? '#E05555' : '#F0C040', fontSize: 12 }}>
                      ● {s.status === 'scheduled' ? 'مجدولة' : s.status === 'completed' ? 'منعقدة' : 'ملغاة'}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize: 11, color: 'rgba(237,232,220,0.4)' }}>
                    {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && <div style={S.empty}>لا توجد جلسات بعد</div>}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  statCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '18px 20px', textAlign: 'center' },
  tableWrap: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, overflow: 'hidden' },
  tableHead: { padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.08)' },
  tableTitle: { fontSize: 15, fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#1A1A1A', borderBottom: '1px solid rgba(201,168,76,0.08)' },
  th: { padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'rgba(237,232,220,0.45)', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid rgba(201,168,76,0.05)' },
  td: { padding: '14px 16px', fontSize: 14 },
  empty: { textAlign: 'center', padding: '40px', color: 'rgba(237,232,220,0.25)', fontSize: 13 },
}
