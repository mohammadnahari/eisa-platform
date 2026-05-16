import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, ClientRow } from '@/lib/types/database.types'
import StageBar from '@/components/ui/StageBar'

export const dynamic = 'force-dynamic'

interface ClientWithProfile extends ClientRow { profiles: ProfileRow | null }

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = profileData as ProfileRow | null

  const { data } = await supabase
    .from('clients')
    .select('*, profiles!inner(full_name, email, avatar_url)')
    .order('created_at', { ascending: false })

  const clients = (data ?? []) as ClientWithProfile[]

  const status = { active: 0, paused: 0, completed: 0, dropped: 0 }
  clients.forEach(c => { if (c.status && c.status in status) status[c.status as keyof typeof status]++ })

  return (
    <div>
      <Header title="العملاء" profile={profile!} subtitle="إدارة ملفات العملاء ومتابعة رحلاتهم" />
      <div style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[['active','نشط','#4CAF7D'],['paused','موقوف','#F0C040'],['completed','مكتمل','#5B8DEF'],['dropped','منسحب','#E05555']].map(([k,l,c]) => (
            <div key={k} style={S.statCard}>
              <div style={{ ...S.statNum, color: c as string }}>{status[k as keyof typeof status]}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>

        <div style={S.tableWrap}>
          <div style={S.tableHead}><div style={S.tableTitle}>قائمة العملاء <span style={{ color: 'rgba(237,232,220,0.35)', fontSize: 12 }}>({clients.length})</span></div></div>
          <table style={S.table}>
            <thead><tr style={S.thead}>
              {['العميل', 'النوع', 'الشريحة', 'المرحلة', 'الحالة', 'بداية الرحلة'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {clients.map(c => {
                const stage = c.current_stage ?? 0
                return (
                  <tr key={c.id} style={S.tr}>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600 }}>{c.profiles?.full_name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(237,232,220,0.35)', direction: 'ltr', marginTop: 2 }}>{c.profiles?.email}</div>
                    </td>
                    <td style={S.td}>{c.client_type === 'development' ? '🔵 تطوير' : c.client_type === 'healing' ? '🟡 تشافي' : '🟣 كلاهما'}</td>
                    <td style={{ ...S.td, color: 'rgba(237,232,220,0.6)' }}>{c.client_segment ?? '—'}</td>
                    <td style={{ ...S.td, minWidth: 140 }}>
                      <div style={{ fontSize: 12, marginBottom: 6 }}>المرحلة {stage} / 12</div>
                      <StageBar stage={stage} size="sm" />
                    </td>
                    <td style={S.td}>
                      <span style={{ color: c.status === 'active' ? '#4CAF7D' : c.status === 'completed' ? '#5B8DEF' : '#F0C040', fontSize: 12 }}>
                        {c.status === 'active' ? '● نشط' : c.status === 'paused' ? '● موقوف' : c.status === 'completed' ? '● مكتمل' : '● منسحب'}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: 11, color: 'rgba(237,232,220,0.35)' }}>
                      {c.journey_start ? new Date(c.journey_start).toLocaleDateString('ar-SA') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {clients.length === 0 && <div style={S.empty}>لا يوجد عملاء بعد</div>}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  statCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '16px 20px', textAlign: 'center' },
  statNum: { fontSize: 28, fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 4 },
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
