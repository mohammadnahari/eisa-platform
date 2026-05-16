import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, UserRole } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

const ROLE_COLOR: Record<UserRole, { color: string; bg: string; label: string }> = {
  admin: { color: '#5B8DEF', bg: 'rgba(91,141,239,0.1)', label: 'مدير' },
  coach: { color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', label: 'موجّه' },
  client: { color: '#4CAF7D', bg: 'rgba(76,175,125,0.1)', label: 'عميل' },
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = profileData as ProfileRow | null

  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  const profiles = (data ?? []) as ProfileRow[]

  const byRole = { admin: 0, coach: 0, client: 0 }
  profiles.forEach(p => { if (p.role in byRole) byRole[p.role]++ })

  return (
    <div>
      <Header title="المستخدمون" profile={profile!} subtitle="إدارة جميع مستخدمي المنصة" />
      <div style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {(['admin', 'coach', 'client'] as UserRole[]).map(r => {
            const c = ROLE_COLOR[r]
            return (
              <div key={r} style={{ ...S.statCard, borderColor: `${c.color}25` }}>
                <div style={{ ...S.statNum, color: c.color }}>{byRole[r]}</div>
                <div style={S.statLabel}>{c.label}</div>
              </div>
            )
          })}
        </div>

        <div style={S.tableWrap}>
          <div style={S.tableHead}><div style={S.tableTitle}>قائمة المستخدمين <span style={{ color: 'rgba(237,232,220,0.35)', fontSize: 12 }}>({profiles.length})</span></div></div>
          <table style={S.table}>
            <thead><tr style={S.thead}>
              {['الاسم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'الجوال', 'تاريخ الإضافة'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {profiles.map(p => {
                const rc = ROLE_COLOR[p.role]
                return (
                  <tr key={p.id} style={S.tr}>
                    <td style={S.td}><div style={{ fontWeight: 600 }}>{p.full_name}</div></td>
                    <td style={{ ...S.td, direction: 'ltr', textAlign: 'right', fontSize: 13, color: 'rgba(237,232,220,0.6)' }}>{p.email}</td>
                    <td style={S.td}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: rc.color, background: rc.bg, border: `1px solid ${rc.color}30` }}>
                        {rc.label}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: p.is_active ? '#4CAF7D' : '#E05555', fontSize: 12 }}>
                        {p.is_active ? '● نشط' : '● موقوف'}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: 13, color: 'rgba(237,232,220,0.5)' }}>{p.phone ?? '—'}</td>
                    <td style={{ ...S.td, fontSize: 11, color: 'rgba(237,232,220,0.35)' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('ar-SA') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {profiles.length === 0 && <div style={S.empty}>لا يوجد مستخدمون</div>}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  statCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '18px 20px', textAlign: 'center' },
  statNum: { fontSize: 30, fontWeight: 900, lineHeight: 1 },
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
