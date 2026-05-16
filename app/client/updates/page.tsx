'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatusBadge from '@/components/ui/StatusBadge'
import WeeklyUpdateForm from '@/components/client/WeeklyUpdateForm'
import type { WeeklyUpdateRow, ClientRow } from '@/lib/types/database.types'

export default function ClientUpdatesPage() {
  const [updates, setUpdates] = useState<WeeklyUpdateRow[]>([])
  const [client, setClient] = useState<ClientRow | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: clientData } = await supabase.from('clients').select('*').eq('profile_id', user.id).single()
    const clientRecord = clientData as ClientRow | null
    setClient(clientRecord)

    if (clientRecord) {
      const { data } = await supabase.from('weekly_updates').select('*').eq('client_id', clientRecord.id).order('week_number', { ascending: false })
      setUpdates((data ?? []) as WeeklyUpdateRow[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const nextWeek = updates.length > 0 ? (updates[0].week_number + 1) : 1
  const hasPendingWeek = updates.some(u => u.week_number === nextWeek - 1) || updates.length === 0

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>تحديثاتي الأسبوعية</h1>
        <p style={S.sub}>{updates.length} تحديث مُسجَّل في رحلتك</p>
      </div>
      <div style={{ padding: '0 28px 60px' }}>
        {client && (
          <div style={{ marginBottom: 24 }}>
            <WeeklyUpdateForm clientId={client.id} nextWeekNumber={nextWeek} onSubmitted={fetchData} />
          </div>
        )}

        {loading ? (
          <div style={S.loading}>جارٍ التحميل...</div>
        ) : updates.length === 0 ? (
          <div style={S.empty}>لم ترفع أي تحديث بعد — ابدأ الآن!</div>
        ) : (
          <div style={S.list}>
            {updates.map(u => (
              <div key={u.id} style={{ ...S.card, borderRightColor: u.status_color === 'green' ? '#4CAF7D' : u.status_color === 'yellow' ? '#F0C040' : '#E05555' }}>
                <div style={S.cardHead}>
                  <StatusBadge status={u.status_color} />
                  <span style={S.weekNum}>الأسبوع {u.week_number}</span>
                  {u.pressure_note && <span style={S.pressureTag}>⚡ نسخة الضغط</span>}
                  {u.coach_reply && <span style={S.repliedTag}>✅ رد الموجّه</span>}
                  <span style={{ marginRight: 'auto', fontSize: 11, color: 'rgba(237,232,220,0.3)' }}>
                    {u.submitted_at ? new Date(u.submitted_at).toLocaleDateString('ar-SA') : ''}
                  </span>
                </div>

                {u.achievements && (
                  <div style={S.field}>
                    <div style={S.fieldKey}>الإنجاز</div>
                    <div style={S.fieldVal}>{u.achievements}</div>
                  </div>
                )}
                {u.challenges && (
                  <div style={S.field}>
                    <div style={S.fieldKey}>التحدي</div>
                    <div style={S.fieldVal}>{u.challenges}</div>
                  </div>
                )}
                {u.next_week_plan && (
                  <div style={S.field}>
                    <div style={S.fieldKey}>التزامي</div>
                    <div style={S.fieldVal}>{u.next_week_plan}</div>
                  </div>
                )}

                {u.coach_reply && (
                  <div style={S.replyBox}>
                    <div style={S.replyLabel}>ردّ موجّهك</div>
                    <div style={S.replyContent}>{u.coach_reply}</div>
                    {u.coach_reply_at && (
                      <div style={S.replyDate}>{new Date(u.coach_reply_at).toLocaleDateString('ar-SA')}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  header: { background: '#111', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '20px 28px', position: 'sticky', top: 0, zIndex: 40 },
  title: { fontSize: 18, fontWeight: 700 },
  sub: { fontSize: 12, color: 'rgba(237,232,220,0.4)', marginTop: 2 },
  loading: { textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.35)', fontSize: 14 },
  empty: { textAlign: 'center', padding: '60px', color: 'rgba(237,232,220,0.25)', fontSize: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: 20, borderRight: '3px solid' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  weekNum: { fontSize: 14, fontWeight: 700 },
  pressureTag: { fontSize: 11, color: '#E05555', background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', padding: '2px 8px', borderRadius: 4 },
  repliedTag: { fontSize: 11, color: '#4CAF7D', background: 'rgba(76,175,125,0.08)', border: '1px solid rgba(76,175,125,0.2)', padding: '2px 8px', borderRadius: 4 },
  field: { marginBottom: 10 },
  fieldKey: { fontSize: 10, color: 'rgba(237,232,220,0.4)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 },
  fieldVal: { fontSize: 13, color: 'rgba(237,232,220,0.7)', lineHeight: 1.6 },
  replyBox: { marginTop: 14, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '12px 16px' },
  replyLabel: { fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 },
  replyContent: { fontSize: 13, color: 'rgba(237,232,220,0.75)', lineHeight: 1.7 },
  replyDate: { fontSize: 10, color: 'rgba(237,232,220,0.3)', marginTop: 6 },
}
