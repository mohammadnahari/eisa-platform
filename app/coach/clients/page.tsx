import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import StageBar from '@/components/ui/StageBar'
import type { ProfileRow, ClientRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function CoachClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: pd } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = pd as ProfileRow | null

  const { data: assignments } = await supabase.from('client_coaches').select('client_id, role').eq('coach_id', user!.id).is('ended_at', null)
  const clientIds = (assignments ?? []).map(a => a.client_id).filter(Boolean) as string[]

  const clients: (ClientRow & { profiles: ProfileRow | null })[] = []
  if (clientIds.length > 0) {
    const { data } = await supabase.from('clients').select('*, profiles!inner(*)').in('id', clientIds)
    clients.push(...((data ?? []) as unknown as (ClientRow & { profiles: ProfileRow | null })[]))
  }

  return (
    <div>
      <Header title="عملائي" profile={profile!} subtitle={`${clients.length} عميل مُسند`} />
      <div style={{ padding: 28 }}>
        <div style={S.grid}>
          {clients.length === 0
            ? <div style={S.empty}>لا يوجد عملاء مُسندون إليك بعد</div>
            : clients.map(c => {
                const stage = c.current_stage ?? 0
                const pct = Math.round((stage / 12) * 100)
                return (
                  <div key={c.id} style={S.card}>
                    <div style={S.cardHead}>
                      <div style={S.avatar}>{(c.profiles?.full_name ?? 'E').charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={S.name}>{c.profiles?.full_name ?? '—'}</div>
                        <div style={S.email}>{c.profiles?.email ?? '—'}</div>
                      </div>
                    </div>
                    <div style={S.tags}>
                      <span style={S.tag}>{c.client_type === 'development' ? '🔵 تطوير' : c.client_type === 'healing' ? '🟡 تشافي' : '🟣 كلاهما'}</span>
                      {c.client_segment && <span style={S.tag}>{c.client_segment}</span>}
                      <span style={{ ...S.tag, color: c.status === 'active' ? '#4CAF7D' : '#F0C040' }}>
                        ● {c.status === 'active' ? 'نشط' : c.status === 'paused' ? 'موقوف' : c.status ?? '—'}
                      </span>
                    </div>
                    <div style={{ margin: '12px 0 6px' }}><StageBar stage={stage} size="sm" /></div>
                    <div style={S.stageInfo}>
                      <span>المرحلة <strong style={{ color: '#C9A84C' }}>{stage}</strong> / 12</span>
                      <span style={S.pctBadge}>{pct}%</span>
                    </div>
                    {c.mission_statement && <div style={S.mission}>&ldquo;{c.mission_statement}&rdquo;</div>}
                  </div>
                )
              })}
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 14, padding: 20 },
  cardHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#C9A84C', flexShrink: 0 },
  name: { fontSize: 15, fontWeight: 700 },
  email: { fontSize: 11, color: 'rgba(237,232,220,0.35)', direction: 'ltr', marginTop: 2 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'rgba(237,232,220,0.6)' },
  stageInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(237,232,220,0.5)' },
  pctBadge: { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)', color: '#C9A84C', padding: '2px 8px', borderRadius: 20, fontSize: 11 },
  mission: { marginTop: 10, fontSize: 12, color: 'rgba(237,232,220,0.4)', fontStyle: 'italic', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.25)', fontSize: 14 },
}
