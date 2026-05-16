import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import StageBar from '@/components/ui/StageBar'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ProfileRow, ClientRow, WeeklyUpdateRow, GoalRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

const STAGE_NAMES: Record<number, string> = {
  0: 'الاستعداد', 1: 'الانطلاق', 2: 'الوضوح', 3: 'التحديد',
  4: 'البناء', 5: 'التعمق', 6: 'التسريع', 7: 'التحدي',
  8: 'التحول', 9: 'الترسيخ', 10: 'التجاوز', 11: 'الإرث', 12: 'الاكتمال',
}

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pd } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = pd as ProfileRow | null

  const { data: cd } = await supabase.from('clients').select('*').eq('profile_id', user!.id).single()
  const client = cd as ClientRow | null

  let updates: WeeklyUpdateRow[] = []
  let goals: GoalRow[] = []
  let weeksSinceStart = 0

  if (client) {
    const [{ data: upd }, { data: gls }] = await Promise.all([
      supabase.from('weekly_updates').select('*').eq('client_id', client.id).order('week_number', { ascending: false }).limit(8),
      supabase.from('goals').select('*').eq('client_id', client.id).eq('status', 'active').order('priority', { ascending: true }).limit(5),
    ])
    updates = (upd ?? []) as WeeklyUpdateRow[]
    goals = (gls ?? []) as GoalRow[]

    if (client.journey_start) {
      weeksSinceStart = Math.floor((Date.now() - new Date(client.journey_start).getTime()) / (7 * 24 * 60 * 60 * 1000))
    }
  }

  const stage = client?.current_stage ?? 0
  const stagePct = Math.round((stage / 12) * 100)
  const latestUpdate = updates[0] ?? null
  const displayName = profile?.full_name ?? profile?.email ?? 'العميل'

  return (
    <div>
      <Header title="رحلتي" profile={profile!} subtitle="اتفاقية الازدهار — خارطة التغيير" />
      <div style={{ padding: 28 }}>

        {/* Welcome + Stage card */}
        <div style={S.welcomeCard}>
          <div style={S.topLine} />
          <div style={S.welcomeRow}>
            <div>
              <div style={S.welcomeGreet}>مرحباً، {displayName.split(' ')[0]}</div>
              <div style={S.welcomeMsg}>
                {client ? `الأسبوع ${weeksSinceStart} من رحلتك — كل خطوة تُحتسب` : 'رحلتك بدأت — خارطة التغيير بانتظارك'}
              </div>
            </div>
            <div style={S.stageBadge}>
              <div style={S.stageNum}>{stage}</div>
              <div style={S.stageLbl}>من 12</div>
            </div>
          </div>

          {/* 12-stage track */}
          <div style={S.stagesRow}>
            {Array.from({ length: 12 }, (_, i) => {
              const n = i + 1
              const isActive = n === stage
              const isDone = n < stage
              return (
                <div key={n} style={{ ...S.stageBox, ...(isActive ? S.stageActive : isDone ? S.stageDone : {}) }}>
                  <div style={S.stageBoxNum}>{n}</div>
                  <div style={S.stageBoxName}>{STAGE_NAMES[n]}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={S.currentStageName}>{STAGE_NAMES[stage]}</div>
            <div style={S.pctBadge}>{stagePct}% مكتمل</div>
          </div>
        </div>

        {/* Latest update status */}
        {latestUpdate && (
          <div style={{ ...S.statusCard, borderColor: latestUpdate.status_color === 'green' ? '#4CAF7D' : latestUpdate.status_color === 'yellow' ? '#F0C040' : '#E05555' }}>
            <div style={S.statusRow}>
              <div>
                <div style={S.statusTitle}>حالة هذا الأسبوع</div>
                <div style={S.statusSub}>الأسبوع {latestUpdate.week_number}</div>
              </div>
              <StatusBadge status={latestUpdate.status_color} />
            </div>
            {latestUpdate.summary && <div style={S.statusSummary}>{latestUpdate.summary}</div>}
            {latestUpdate.pressure_note && <div style={S.pressureAlert}>⚡ نسخة الضغط مفعّلة لهذا الأسبوع</div>}
            {latestUpdate.coach_reply && (
              <div style={S.coachReply}>
                <div style={S.replyLabel}>رد موجّهك</div>
                <div style={S.replyText}>{latestUpdate.coach_reply}</div>
              </div>
            )}
          </div>
        )}

        <div style={S.twoCol}>
          {/* Recent updates */}
          <div style={S.panel}>
            <div style={S.panelTitle}>📋 التحديثات الأخيرة</div>
            {updates.length === 0
              ? <div style={S.empty}>لا توجد تحديثات بعد</div>
              : updates.map(u => (
                <div key={u.id} style={{ ...S.updateRow, borderRightColor: u.status_color === 'green' ? '#4CAF7D' : u.status_color === 'yellow' ? '#F0C040' : '#E05555' }}>
                  <div style={S.updateHead}>
                    <StatusBadge status={u.status_color} />
                    <span style={S.updateWeek}>الأسبوع {u.week_number}</span>
                    {u.pressure_note && <span style={S.pressureTag}>⚡</span>}
                    {u.coach_reply && <span style={S.repliedTag}>تم الرد</span>}
                  </div>
                  {u.achievements && <div style={S.updateBody}>{u.achievements.slice(0, 100)}{u.achievements.length > 100 ? '...' : ''}</div>}
                </div>
              ))
            }
          </div>

          {/* Goals */}
          <div style={S.panel}>
            <div style={S.panelTitle}>🎯 الأهداف النشطة</div>
            {goals.length === 0
              ? <div style={S.empty}>لم تُحدَّد أهداف بعد</div>
              : goals.map(g => (
                <div key={g.id} style={S.goalRow}>
                  <div style={S.goalDiamond}>◇</div>
                  <div style={{ flex: 1 }}>
                    <div style={S.goalTitle}>{g.title}</div>
                    <div style={S.goalMeta}>
                      {g.axis && <span style={S.axisTag}>{g.axis}</span>}
                      {g.target_date && <span style={{ color: 'rgba(237,232,220,0.3)' }}>📅 {new Date(g.target_date).toLocaleDateString('ar-SA')}</span>}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  welcomeCard: { background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' },
  topLine: { position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' },
  welcomeRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  welcomeGreet: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  welcomeMsg: { fontSize: 14, color: 'rgba(237,232,220,0.5)', lineHeight: 1.5 },
  stageBadge: { background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: '12px 18px', textAlign: 'center', flexShrink: 0 },
  stageNum: { fontSize: 36, fontWeight: 900, color: '#C9A84C', lineHeight: 1 },
  stageLbl: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 2 },
  stagesRow: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, marginBottom: 8 },
  stageBox: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 6, padding: '6px 4px', textAlign: 'center', transition: 'all 0.3s' },
  stageDone: { background: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.25)' },
  stageActive: { background: 'rgba(201,168,76,0.2)', borderColor: '#C9A84C', boxShadow: '0 0 10px rgba(201,168,76,0.2)' },
  stageBoxNum: { fontSize: 13, fontWeight: 700, color: '#C9A84C', lineHeight: 1 },
  stageBoxName: { fontSize: 8, color: 'rgba(237,232,220,0.35)', marginTop: 2 },
  currentStageName: { fontSize: 14, color: 'rgba(237,232,220,0.5)', fontStyle: 'italic' },
  pctBadge: { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)', color: '#C9A84C', padding: '3px 12px', borderRadius: 20, fontSize: 12 },
  statusCard: { background: '#111', border: '1px solid', borderRadius: 14, padding: 20, marginBottom: 20 },
  statusRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  statusTitle: { fontSize: 15, fontWeight: 700 },
  statusSub: { fontSize: 12, color: 'rgba(237,232,220,0.4)', marginTop: 2 },
  statusSummary: { fontSize: 13, color: 'rgba(237,232,220,0.65)', lineHeight: 1.6, marginBottom: 8 },
  pressureAlert: { fontSize: 12, color: '#E05555', background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.15)', borderRadius: 8, padding: '6px 10px' },
  coachReply: { marginTop: 12, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: '10px 14px' },
  replyLabel: { fontSize: 10, color: '#C9A84C', fontWeight: 700, marginBottom: 4 },
  replyText: { fontSize: 13, color: 'rgba(237,232,220,0.7)', lineHeight: 1.6 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  panel: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 14, padding: 20 },
  panelTitle: { fontSize: 13, fontWeight: 700, color: 'rgba(237,232,220,0.5)', letterSpacing: 0.3, marginBottom: 14 },
  empty: { textAlign: 'center', padding: '24px 0', color: 'rgba(237,232,220,0.25)', fontSize: 13 },
  updateRow: { borderRight: '3px solid', borderRadius: 8, background: '#1A1A1A', padding: 12, marginBottom: 8 },
  updateHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  updateWeek: { fontSize: 12, color: 'rgba(237,232,220,0.45)' },
  pressureTag: { fontSize: 12, color: '#E05555' },
  repliedTag: { fontSize: 10, color: '#4CAF7D', background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', padding: '1px 6px', borderRadius: 4 },
  updateBody: { fontSize: 12, color: 'rgba(237,232,220,0.55)', lineHeight: 1.5 },
  goalRow: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  goalDiamond: { fontSize: 16, color: '#C9A84C', flexShrink: 0, marginTop: 1 },
  goalTitle: { fontSize: 13, fontWeight: 600, marginBottom: 4 },
  goalMeta: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 },
  axisTag: { color: '#5B8DEF', background: 'rgba(91,141,239,0.1)', border: '1px solid rgba(91,141,239,0.2)', padding: '1px 7px', borderRadius: 4 },
}
