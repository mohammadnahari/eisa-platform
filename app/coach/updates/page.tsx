import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ProfileRow, WeeklyUpdateRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function CoachUpdatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: pd } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = pd as ProfileRow | null

  const { data: assignments } = await supabase.from('client_coaches').select('client_id').eq('coach_id', user!.id).is('ended_at', null)
  const clientIds = (assignments ?? []).map(a => a.client_id).filter(Boolean) as string[]

  const updates: (WeeklyUpdateRow & { clients: { profiles: { full_name: string } | null } | null })[] = []

  if (clientIds.length > 0) {
    const { data } = await supabase
      .from('weekly_updates')
      .select('*, clients!inner(profiles!inner(full_name))')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(50)
    updates.push(...((data ?? []) as typeof updates))
  }

  const pending = updates.filter(u => !u.coach_reply)
  const replied = updates.filter(u => u.coach_reply)

  return (
    <div>
      <Header title="التحديثات الأسبوعية" profile={profile!} subtitle={`${pending.length} تحديث في انتظار الرد`} />
      <div style={{ padding: 28 }}>
        {pending.length > 0 && (
          <>
            <div style={S.sectionTitle}>⏳ في انتظار الرد ({pending.length})</div>
            <div style={S.updatesList}>
              {pending.map(u => <UpdateCard key={u.id} update={u} />)}
            </div>
          </>
        )}
        {replied.length > 0 && (
          <>
            <div style={{ ...S.sectionTitle, marginTop: 28 }}>✅ تم الرد ({replied.length})</div>
            <div style={S.updatesList}>
              {replied.map(u => <UpdateCard key={u.id} update={u} />)}
            </div>
          </>
        )}
        {updates.length === 0 && <div style={S.empty}>لا توجد تحديثات بعد</div>}
      </div>
    </div>
  )
}

function UpdateCard({ update: u }: { update: WeeklyUpdateRow & { clients: { profiles: { full_name: string } | null } | null } }) {
  return (
    <div style={{ ...S.card, borderRightColor: u.status_color === 'green' ? '#4CAF7D' : u.status_color === 'yellow' ? '#F0C040' : '#E05555' }}>
      <div style={S.cardHead}>
        <StatusBadge status={u.status_color} />
        <span style={S.clientName}>{u.clients?.profiles?.full_name ?? '—'}</span>
        <span style={S.weekLabel}>الأسبوع {u.week_number}</span>
        {u.pressure_note && <span style={S.pressureTag}>⚡ نسخة الضغط</span>}
        <span style={{ marginRight: 'auto', fontSize: 11, color: 'rgba(237,232,220,0.3)' }}>
          {u.submitted_at ? new Date(u.submitted_at).toLocaleDateString('ar-SA') : ''}
        </span>
      </div>
      {u.achievements && <div style={S.field}><span style={S.fieldKey}>الإنجاز</span> {u.achievements}</div>}
      {u.challenges && <div style={S.field}><span style={S.fieldKey}>التحدي</span> {u.challenges}</div>}
      {u.next_week_plan && <div style={S.field}><span style={S.fieldKey}>الالتزام</span> {u.next_week_plan}</div>}
      {u.coach_reply && (
        <div style={S.replyBox}>
          <div style={S.replyLabel}>ردّك</div>
          <div>{u.coach_reply}</div>
        </div>
      )}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  sectionTitle: { fontSize: 14, fontWeight: 700, color: 'rgba(237,232,220,0.5)', letterSpacing: 0.5, marginBottom: 14 },
  updatesList: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: 18, borderRight: '3px solid' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  clientName: { fontSize: 14, fontWeight: 700 },
  weekLabel: { fontSize: 12, color: 'rgba(237,232,220,0.4)' },
  pressureTag: { fontSize: 11, color: '#E05555', background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', padding: '1px 6px', borderRadius: 4 },
  field: { fontSize: 13, color: 'rgba(237,232,220,0.65)', marginBottom: 6, lineHeight: 1.6 },
  fieldKey: { fontWeight: 700, color: 'rgba(237,232,220,0.35)', fontSize: 11, marginLeft: 6, letterSpacing: 0.3 },
  replyBox: { marginTop: 10, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 13 },
  replyLabel: { fontSize: 10, color: '#C9A84C', fontWeight: 700, marginBottom: 4 },
  empty: { textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.25)', fontSize: 14 },
}
