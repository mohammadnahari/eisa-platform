import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, LeadRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  new: '🔔 جديد', contacted: '📞 تم التواصل', qualified: '✅ مؤهل',
  converted: '🎯 تحوّل لعميل', dropped: '✖ غير مناسب',
}

const STATUS_COLOR: Record<string, string> = {
  new: '#C9A84C', contacted: '#F0C040', qualified: '#4CAF7D', converted: '#4CAF7D', dropped: 'rgba(237,232,220,0.3)',
}

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = profileData as ProfileRow | null

  const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  const leads = (leadsData ?? []) as LeadRow[]

  const counts: Record<string, number> = {}
  leads.forEach(l => { counts[l.status ?? 'new'] = (counts[l.status ?? 'new'] ?? 0) + 1 })

  return (
    <div>
      <Header title="الطلبات الواردة" profile={profile!} subtitle="طلبات الاستكشاف من الموقع الخارجي" />
      <div style={{ padding: 28 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <div key={k} style={S.statCard}>
              <div style={{ ...S.statNum, color: STATUS_COLOR[k] }}>{counts[k] ?? 0}</div>
              <div style={S.statLabel}>{v}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          <div style={S.tableHead}>
            <div style={S.tableTitle}>سجل الطلبات <span style={{ color: 'rgba(237,232,220,0.35)', fontSize: 12 }}>({leads.length} طلب)</span></div>
          </div>
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                {['الاسم', 'التواصل', 'المسار', 'الالتزام', 'الحالة', 'التاريخ'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const answers = (lead.discovery_answers as Record<string, string> | null) ?? {}
                return (
                  <tr key={lead.id} style={S.tr}>
                    <td style={S.td}><div style={{ fontWeight: 600 }}>{lead.full_name}</div></td>
                    <td style={{ ...S.td, fontSize: 12, color: 'rgba(237,232,220,0.45)' }}>
                      <div style={{ direction: 'ltr' }}>{lead.email ?? '—'}</div>
                      <div>{lead.phone ?? '—'}</div>
                    </td>
                    <td style={S.td}>{answers.path === 'executive' ? '🏢 تنفيذي' : '🌿 شخصي'}</td>
                    <td style={{ ...S.td, color: answers.commitment_level === 'عالٍ جداً' ? '#4CAF7D' : 'rgba(237,232,220,0.6)' }}>{answers.commitment_level ?? '—'}</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, color: STATUS_COLOR[lead.status ?? 'new'], borderColor: `${STATUS_COLOR[lead.status ?? 'new']}40`, background: `${STATUS_COLOR[lead.status ?? 'new']}15` }}>
                        {STATUS_LABELS[lead.status ?? 'new']}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: 11, color: 'rgba(237,232,220,0.35)' }}>
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('ar-SA') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {leads.length === 0 && <div style={S.empty}>لا توجد طلبات بعد</div>}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  statCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' },
  statNum: { fontSize: 26, fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: 11, color: 'rgba(237,232,220,0.4)', marginTop: 4 },
  tableWrap: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, overflow: 'hidden' },
  tableHead: { padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.08)' },
  tableTitle: { fontSize: 15, fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#1A1A1A', borderBottom: '1px solid rgba(201,168,76,0.08)' },
  th: { padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'rgba(237,232,220,0.45)', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid rgba(201,168,76,0.05)', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 14, verticalAlign: 'top' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1px solid' },
  empty: { textAlign: 'center', padding: '40px', color: 'rgba(237,232,220,0.25)', fontSize: 13 },
}
