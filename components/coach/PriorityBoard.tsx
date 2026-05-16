'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StageBar from '@/components/ui/StageBar'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ProfileRow, ClientRow, WeeklyUpdateRow, LeadRow, WeeklyStatusColor } from '@/lib/types/database.types'

interface ClientWithData extends ClientRow {
  profiles: ProfileRow | null
  latestUpdate: WeeklyUpdateRow | null
}

interface Props {
  clients: ClientWithData[]
  leads: LeadRow[]
  coachId: string
}

type Tab = 'clients' | 'leads'

const RESPONSE_TYPES = ['تشجيع', 'تساؤل', 'توجيه', 'تحدي'] as const

function classifyClients(clients: ClientWithData[]) {
  const red: ClientWithData[] = [], yellow: ClientWithData[] = [], green: ClientWithData[] = []
  clients.forEach(c => {
    const s = c.latestUpdate?.status_color
    if (s === 'green') green.push(c)
    else if (s === 'yellow') yellow.push(c)
    else red.push(c)
  })
  return { red, yellow, green }
}

export default function PriorityBoard({ clients, leads, coachId }: Props) {
  const [tab, setTab] = useState<Tab>('clients')
  const [selectedClient, setSelectedClient] = useState<ClientWithData | null>(null)
  const [clientUpdates, setClientUpdates] = useState<WeeklyUpdateRow[]>([])
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyType, setReplyType] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [leadFilter, setLeadFilter] = useState('الكل')

  const { red, yellow, green } = classifyClients(clients)

  async function openClient(c: ClientWithData) {
    setSelectedClient(c)
    setDrawerLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('weekly_updates')
      .select('*')
      .eq('client_id', c.id)
      .order('week_number', { ascending: false })
      .limit(10)
    setClientUpdates((data ?? []) as WeeklyUpdateRow[])
    setDrawerLoading(false)
  }

  async function sendReply(updateId: string) {
    const text = replyText[updateId]?.trim()
    if (!text) return
    setSending(prev => ({ ...prev, [updateId]: true }))
    const supabase = createClient()
    await supabase.from('weekly_updates').update({
      coach_reply: text,
      coach_reply_at: new Date().toISOString(),
    }).eq('id', updateId)
    // Refresh
    const { data } = await supabase.from('weekly_updates').select('*').eq('client_id', selectedClient!.id).order('week_number', { ascending: false }).limit(10)
    setClientUpdates((data ?? []) as WeeklyUpdateRow[])
    setReplyText(prev => ({ ...prev, [updateId]: '' }))
    setSending(prev => ({ ...prev, [updateId]: false }))
  }

  async function updateLeadStatus(leadId: string, status: string) {
    const supabase = createClient()
    await supabase.from('leads').update({ status }).eq('id', leadId)
    window.location.reload()
  }

  const filteredLeads = leadFilter === 'الكل' ? leads : leads.filter(l => l.status === leadFilter)
  const newLeadsCount = leads.filter(l => l.status === 'new').length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Action bar */}
      <div style={S.actionBar}>
        <div style={S.tabs}>
          <button style={{ ...S.tab, ...(tab === 'clients' ? S.tabActive : {}) }} onClick={() => setTab('clients')}>
            👥 متابعة العملاء
          </button>
          <button style={{ ...S.tab, ...(tab === 'leads' ? S.tabActive : {}) }} onClick={() => setTab('leads')}>
            📥 الطلبات الواردة
            {newLeadsCount > 0 && <span style={S.badge}>{newLeadsCount}</span>}
          </button>
        </div>
      </div>

      {tab === 'clients' && <>
        {/* Summary bar */}
        <div style={S.summaryBar}>
          {[
            { label: 'إجمالي العملاء', val: clients.length, color: '#C9A84C', icon: '🌐' },
            { label: 'يحتاجون تدخلاً', val: red.length, color: '#E05555', icon: '🔴' },
            { label: 'حالة متوسطة', val: yellow.length, color: '#F0C040', icon: '🟡' },
            { label: 'مستقرون', val: green.length, color: '#4CAF7D', icon: '🟢' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={S.summaryCard}>
              <div style={S.summaryDot}>{icon}</div>
              <div>
                <div style={{ ...S.summaryNum, color }}>{val}</div>
                <div style={S.summaryLabel}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3 columns */}
        <div style={S.columns}>
          {[
            { label: 'يحتاجون تدخلاً', color: '#E05555', dot: 'red' as WeeklyStatusColor, data: red },
            { label: 'حالة متوسطة', color: '#F0C040', dot: 'yellow' as WeeklyStatusColor, data: yellow },
            { label: 'يتقدمون بثبات', color: '#4CAF7D', dot: 'green' as WeeklyStatusColor, data: green },
          ].map(({ label, color, dot, data }) => (
            <div key={label} style={S.column}>
              <div style={S.colHeader}>
                <div style={{ ...S.colDot, background: color }} />
                <h2 style={{ ...S.colTitle, color }}>{label}</h2>
                <div style={S.colCount}>{data.length}</div>
              </div>
              <div style={S.colBody}>
                {data.length === 0
                  ? <div style={S.empty}>لا يوجد عملاء في هذا العمود</div>
                  : data.map(c => <ClientCard key={c.id} client={c} colorClass={dot} onClick={() => openClient(c)} />)
                }
              </div>
            </div>
          ))}
        </div>
      </>}

      {tab === 'leads' && (
        <div style={{ padding: '20px 28px' }}>
          {/* Filters */}
          <div style={S.filterRow}>
            {['الكل', 'new', 'contacted', 'qualified', 'converted', 'dropped'].map(f => (
              <button key={f} style={{ ...S.filterBtn, ...(leadFilter === f ? S.filterBtnActive : {}) }} onClick={() => setLeadFilter(f)}>
                {f === 'الكل' ? 'الكل' : f === 'new' ? '🔔 جديد' : f === 'contacted' ? '📞 تم التواصل' : f === 'qualified' ? '✅ مؤهل' : f === 'converted' ? '🎯 تحوّل لعميل' : '✖ غير مناسب'}
              </button>
            ))}
          </div>
          {/* Leads grid */}
          <div style={S.leadsGrid}>
            {filteredLeads.length === 0
              ? <div style={S.empty}>لا توجد طلبات في هذه الفئة</div>
              : filteredLeads.map(lead => (
                <div key={lead.id} style={{ ...S.leadCard, borderRightColor: lead.status === 'new' ? '#C9A84C' : lead.status === 'converted' ? '#4CAF7D' : lead.status === 'dropped' ? 'rgba(255,255,255,0.1)' : '#F0C040' }}>
                  <div style={S.leadHead}>
                    <div>
                      <div style={S.leadName}>{lead.full_name}</div>
                      <div style={S.leadDate}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('ar-SA') : ''}</div>
                    </div>
                    <select defaultValue={lead.status ?? 'new'} onChange={e => updateLeadStatus(lead.id, e.target.value)} style={S.statusSelect}>
                      <option value="new">جديد</option>
                      <option value="contacted">تم التواصل</option>
                      <option value="qualified">مؤهل</option>
                      <option value="converted">تحوّل لعميل</option>
                      <option value="dropped">غير مناسب</option>
                    </select>
                  </div>
                  <div style={S.leadMeta}>
                    <span style={S.leadTag}>{(lead.discovery_answers as Record<string, string> | null)?.path === 'executive' ? '🏢 تنفيذي' : '🌿 شخصي'}</span>
                    {(lead.discovery_answers as Record<string, string> | null)?.commitment_level && (
                      <span style={S.leadTag}>{(lead.discovery_answers as Record<string, string>).commitment_level}</span>
                    )}
                  </div>
                  {(lead.discovery_answers as Record<string, string> | null)?.current_situation && (
                    <div style={S.leadExcerpt}>"{(lead.discovery_answers as Record<string, string>).current_situation.slice(0, 120)}..."</div>
                  )}
                  <div style={S.leadContact}>
                    {lead.phone && <span>📱 {lead.phone}</span>}
                    {lead.email && <span style={{ direction: 'ltr' }}>✉ {lead.email}</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedClient && (
        <div style={S.drawerOverlay} onClick={e => { if (e.target === e.currentTarget) setSelectedClient(null) }}>
          <div style={S.drawer}>
            <div style={S.drawerHead}>
              <div style={{ flex: 1 }}>
                <div style={S.drawerTitle}>{selectedClient.profiles?.full_name ?? '—'}</div>
                <div style={S.drawerMeta}>
                  {selectedClient.client_type === 'development' ? 'تطوير' : 'تشافي'} · المرحلة {selectedClient.current_stage ?? 0} من 12
                </div>
                <div style={{ marginTop: 10 }}><StageBar stage={selectedClient.current_stage ?? 0} size="sm" /></div>
              </div>
              <button onClick={() => setSelectedClient(null)} style={S.closeBtn}>×</button>
            </div>
            <div style={S.drawerBody}>
              <div style={S.drawerSectionTitle}>التحديثات الأسبوعية</div>
              {drawerLoading ? (
                <div style={S.loading}>جارٍ التحميل...</div>
              ) : clientUpdates.length === 0 ? (
                <div style={S.empty}>لا توجد تحديثات بعد</div>
              ) : clientUpdates.map(u => (
                <div key={u.id} style={{ ...S.updateCard, borderRightColor: u.status_color === 'green' ? '#4CAF7D' : u.status_color === 'yellow' ? '#F0C040' : '#E05555' }}>
                  <div style={S.updateHead}>
                    <StatusBadge status={u.status_color} />
                    <span style={S.updateWeek}>الأسبوع {u.week_number}</span>
                    {u.pressure_note && <span style={S.pressureTag}>⚡ نسخة الضغط</span>}
                  </div>
                  {u.achievements && <div style={S.updateField}><div style={S.fieldLabel}>الإنجاز</div><div style={S.fieldValue}>{u.achievements}</div></div>}
                  {u.challenges && <div style={S.updateField}><div style={S.fieldLabel}>التحدي</div><div style={S.fieldValue}>{u.challenges}</div></div>}
                  {u.next_week_plan && <div style={S.updateField}><div style={S.fieldLabel}>الالتزام</div><div style={S.fieldValue}>{u.next_week_plan}</div></div>}
                  {/* Coach reply */}
                  <div style={S.replyArea}>
                    <div style={S.replyLabel}>رد الموجّه</div>
                    {u.coach_reply ? (
                      <div style={S.existingReply}>
                        <div style={S.replyType}>رد</div>
                        <div>{u.coach_reply}</div>
                      </div>
                    ) : (
                      <>
                        <div style={S.replyTypes}>
                          {RESPONSE_TYPES.map(t => (
                            <button key={t} onClick={() => setReplyType(prev => ({ ...prev, [u.id]: t }))}
                              style={{ ...S.replyTypeBtn, ...(replyType[u.id] === t ? S.replyTypeBtnActive : {}) }}>
                              {t}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={replyText[u.id] ?? ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [u.id]: e.target.value }))}
                          placeholder="اكتب ردّك على هذا التحديث..."
                          style={S.replyInput}
                        />
                        <button disabled={sending[u.id]} onClick={() => sendReply(u.id)} style={S.sendBtn}>
                          {sending[u.id] ? 'جارٍ الإرسال...' : 'إرسال الرد'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientCard({ client, colorClass, onClick }: { client: ClientWithData; colorClass: WeeklyStatusColor; onClick: () => void }) {
  const sideColor = colorClass === 'green' ? '#4CAF7D' : colorClass === 'yellow' ? '#F0C040' : '#E05555'
  const typeLabel = client.client_type === 'development' ? 'تطوير' : client.client_type === 'healing' ? 'تشافي' : 'كلاهما'
  const isPressure = !!client.latestUpdate?.pressure_note

  return (
    <div style={{ ...S.clientCard, borderRightColor: sideColor }} onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.transform = 'none' }}>
      <div style={S.cardName}>{client.profiles?.full_name ?? '—'}</div>
      <div style={S.cardMeta}>
        <span style={S.cardTag}>{typeLabel}</span>
        {client.client_segment && <span style={S.cardTag}>{client.client_segment}</span>}
        {isPressure && <span style={{ ...S.cardTag, color: '#E05555', borderColor: 'rgba(224,85,85,0.3)' }}>⚡ نسخة الضغط</span>}
      </div>
      <div style={{ marginTop: 10 }}><StageBar stage={client.current_stage ?? 0} size="sm" /></div>
      <div style={S.cardWeek}>
        المرحلة <strong style={{ color: '#EDE8DC' }}>{client.current_stage ?? 0}</strong> من 12
        {client.latestUpdate && <span style={{ marginRight: 8 }}>· الأسبوع {client.latestUpdate.week_number}</span>}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  actionBar: { padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(201,168,76,0.08)' },
  tabs: { display: 'flex', alignItems: 'center', gap: 4, background: '#1A1A1A', borderRadius: 10, padding: 4 },
  tab: { padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'rgba(237,232,220,0.45)', background: 'transparent', border: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' },
  tabActive: { background: '#111', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' },
  badge: { background: '#E05555', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 },
  summaryBar: { display: 'flex', gap: 16, padding: '0 28px 20px' },
  summaryCard: { flex: 1, background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 },
  summaryDot: { width: 38, height: 38, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  summaryNum: { fontSize: 26, fontWeight: 900, lineHeight: 1 },
  summaryLabel: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 3 },
  columns: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(201,168,76,0.08)', minHeight: 0 },
  column: { borderLeft: '1px solid rgba(201,168,76,0.08)', display: 'flex', flexDirection: 'column' },
  colHeader: { padding: '14px 18px', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 62, background: '#080808', zIndex: 10 },
  colDot: { width: 10, height: 10, borderRadius: '50%' },
  colTitle: { fontSize: 14, fontWeight: 700, flex: 1 },
  colCount: { background: '#1A1A1A', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: 'rgba(237,232,220,0.45)' },
  colBody: { flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' },
  clientCard: { background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s', borderRight: '3px solid transparent', position: 'relative', overflow: 'hidden' },
  cardName: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  cardTag: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'rgba(237,232,220,0.6)' },
  cardWeek: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 8 },
  empty: { textAlign: 'center', padding: '30px 20px', color: 'rgba(237,232,220,0.25)', fontSize: 13 },
  // Leads
  filterRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(237,232,220,0.45)', padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  filterBtnActive: { background: 'rgba(201,168,76,0.1)', borderColor: '#C9A84C', color: '#C9A84C' },
  leadsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 },
  leadCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: 18, borderRight: '3px solid' },
  leadHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  leadName: { fontSize: 15, fontWeight: 700 },
  leadDate: { fontSize: 11, color: 'rgba(237,232,220,0.35)', marginTop: 3 },
  leadMeta: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  leadTag: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'rgba(237,232,220,0.55)' },
  leadExcerpt: { fontSize: 12, color: 'rgba(237,232,220,0.4)', marginBottom: 10, lineHeight: 1.5, fontStyle: 'italic' },
  leadContact: { fontSize: 11, color: 'rgba(237,232,220,0.35)', display: 'flex', gap: 10, flexWrap: 'wrap', direction: 'ltr', justifyContent: 'flex-end' },
  statusSelect: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(237,232,220,0.6)', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' },
  // Drawer
  drawerOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' },
  drawer: { width: 560, background: '#111', borderRight: '1px solid rgba(201,168,76,0.18)', overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'none' },
  drawerHead: { padding: 24, borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'flex-start', gap: 12, position: 'sticky', top: 0, background: '#111', zIndex: 10 },
  drawerTitle: { fontSize: 20, fontWeight: 700 },
  drawerMeta: { fontSize: 13, color: 'rgba(237,232,220,0.45)', marginTop: 4 },
  closeBtn: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(237,232,220,0.45)', width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  drawerBody: { padding: 24, flex: 1 },
  drawerSectionTitle: { fontSize: 12, fontWeight: 700, color: 'rgba(237,232,220,0.4)', letterSpacing: 1, marginBottom: 16 },
  loading: { textAlign: 'center', padding: 30, color: 'rgba(237,232,220,0.35)', fontSize: 13 },
  updateCard: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 12, padding: 16, marginBottom: 12, borderRight: '3px solid' },
  updateHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  updateWeek: { fontSize: 12, color: 'rgba(237,232,220,0.45)' },
  pressureTag: { fontSize: 11, color: '#E05555', background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', padding: '1px 6px', borderRadius: 4 },
  updateField: { marginBottom: 8 },
  fieldLabel: { fontSize: 10, color: 'rgba(237,232,220,0.4)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 },
  fieldValue: { fontSize: 13, color: 'rgba(237,232,220,0.7)', lineHeight: 1.6 },
  replyArea: { marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' },
  replyLabel: { fontSize: 12, color: '#C9A84C', fontWeight: 600, marginBottom: 8 },
  existingReply: { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: 12, fontSize: 13 },
  replyType: { fontSize: 10, color: '#C9A84C', fontWeight: 700, marginBottom: 5 },
  replyTypes: { display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  replyTypeBtn: { background: '#202020', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(237,232,220,0.45)', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  replyTypeBtnActive: { borderColor: '#C9A84C', color: '#C9A84C', background: 'rgba(201,168,76,0.08)' },
  replyInput: { width: '100%', background: '#202020', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: 10, color: '#EDE8DC', fontSize: 13, resize: 'vertical', minHeight: 80, outline: 'none', fontFamily: 'inherit', direction: 'rtl', lineHeight: 1.6 },
  sendBtn: { width: '100%', background: '#C9A84C', color: '#000', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
}
