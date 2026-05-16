import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, GoalRow, ClientRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

const AXIS_LABEL: Record<string, string> = {
  professional: '💼 مهني', personal: '🌿 شخصي', health: '💪 صحة',
  relationships: '🤝 علاقات', financial: '💰 مالي', spiritual: '✨ روحي',
}

export default async function ClientGoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: pd } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = pd as ProfileRow | null

  const { data: cd } = await supabase.from('clients').select('id').eq('profile_id', user!.id).single()
  const client = cd as Pick<ClientRow, 'id'> | null

  let goals: GoalRow[] = []
  if (client) {
    const { data } = await supabase.from('goals').select('*').eq('client_id', client.id).order('priority', { ascending: true })
    goals = (data ?? []) as GoalRow[]
  }

  const active = goals.filter(g => g.status === 'active')
  const achieved = goals.filter(g => g.status === 'achieved')

  return (
    <div>
      <Header title="أهدافي" profile={profile!} subtitle={`${active.length} هدف نشط · ${achieved.length} هدف محقق`} />
      <div style={{ padding: 28 }}>
        {active.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={S.sectionTitle}>🎯 الأهداف النشطة</div>
            <div style={S.list}>
              {active.map(g => <GoalCard key={g.id} goal={g} />)}
            </div>
          </div>
        )}
        {achieved.length > 0 && (
          <>
            <div style={S.sectionTitle}>🏆 الأهداف المحققة</div>
            <div style={S.list}>
              {achieved.map(g => <GoalCard key={g.id} goal={g} achieved />)}
            </div>
          </>
        )}
        {goals.length === 0 && <div style={S.empty}>لم تُحدَّد أهداف بعد</div>}
      </div>
    </div>
  )
}

function GoalCard({ goal: g, achieved = false }: { goal: GoalRow; achieved?: boolean }) {
  return (
    <div style={{ ...S.card, ...(achieved ? S.achievedCard : {}) }}>
      <div style={S.cardHead}>
        <div style={S.diamond}>{achieved ? '♦' : '◇'}</div>
        <div style={{ flex: 1 }}>
          <div style={S.goalTitle}>{g.title}</div>
          {g.description && <div style={S.desc}>{g.description}</div>}
        </div>
        {achieved && <div style={S.achievedBadge}>✓ محقق</div>}
      </div>
      <div style={S.metaRow}>
        {g.axis && <span style={S.axisTag}>{AXIS_LABEL[g.axis] ?? g.axis}</span>}
        {g.target_date && <span style={S.metaTag}>📅 {new Date(g.target_date).toLocaleDateString('ar-SA')}</span>}
        {g.priority !== null && g.priority !== undefined && <span style={S.metaTag}>أولوية {g.priority}</span>}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'rgba(237,232,220,0.5)', letterSpacing: 0.5, marginBottom: 12 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, padding: '16px 20px' },
  achievedCard: { borderColor: 'rgba(76,175,125,0.2)', background: 'rgba(76,175,125,0.03)' },
  cardHead: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  diamond: { fontSize: 18, color: '#C9A84C', flexShrink: 0, marginTop: 1 },
  goalTitle: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  desc: { fontSize: 13, color: 'rgba(237,232,220,0.5)', lineHeight: 1.5 },
  achievedBadge: { color: '#4CAF7D', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 },
  metaRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  axisTag: { background: 'rgba(91,141,239,0.1)', border: '1px solid rgba(91,141,239,0.2)', color: '#5B8DEF', padding: '2px 8px', borderRadius: 6, fontSize: 11 },
  metaTag: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.12)', color: 'rgba(237,232,220,0.5)', padding: '2px 8px', borderRadius: 6, fontSize: 11 },
  empty: { textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.25)', fontSize: 14 },
}
