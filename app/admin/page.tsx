import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = profileData as ProfileRow | null

  const [
    { count: totalClients },
    { count: totalCoaches },
    { count: newLeads },
    { count: totalSessions },
    { data: updates },
    { data: clients },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('weekly_updates').select('status_color, pressure_note').order('created_at', { ascending: false }).limit(100),
    supabase.from('clients').select('client_type, client_segment, current_stage'),
  ])

  const updatesArr = updates ?? []
  const greenCount = updatesArr.filter(u => u.status_color === 'green').length
  const yellowCount = updatesArr.filter(u => u.status_color === 'yellow').length
  const redCount = updatesArr.filter(u => u.status_color === 'red').length
  const pressureCount = updatesArr.filter(u => u.pressure_note).length
  const clientsArr = clients ?? []
  const execCount = clientsArr.filter(c => c.client_type === 'development').length
  const healCount = clientsArr.filter(c => c.client_type === 'healing').length
  const total = greenCount + yellowCount + redCount || 1

  const stats = [
    { label: 'إجمالي العملاء', val: totalClients ?? 0, icon: '👥', color: '#C9A84C', span: 1 },
    { label: 'الموجّهون', val: totalCoaches ?? 0, icon: '🧭', color: '#5B8DEF', span: 1 },
    { label: 'عملاء أخضر', val: greenCount, icon: '🟢', color: '#4CAF7D', span: 1 },
    { label: 'يحتاجون تدخلاً', val: redCount, icon: '🔴', color: '#E05555', span: 1 },
    { label: 'حالة متوسطة', val: yellowCount, icon: '🟡', color: '#F0C040', span: 1 },
    { label: 'نسخة الضغط', val: pressureCount, icon: '⚡', color: '#F0C040', span: 1 },
    { label: 'طلبات جديدة', val: newLeads ?? 0, icon: '📥', color: '#E05555', span: 1 },
    { label: 'إجمالي التحديثات', val: updatesArr.length, icon: '📝', color: '#C9A84C', span: 1 },
  ]

  return (
    <div>
      <Header title="لوحة الإحصاء العامة" profile={profile!} subtitle="نظرة شاملة على حالة المنصة" />
      <div style={{ padding: 28 }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color})` }} />
              <div style={S.statIcon}>{s.icon}</div>
              <div style={{ ...S.statNum, color: s.color }}>{s.val}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Status distribution */}
          <div style={S.chartCard}>
            <div style={S.chartTitle}>توزيع حالة العملاء الأسبوعية</div>
            {[
              { label: '🟢 أخضر', val: greenCount, color: '#4CAF7D' },
              { label: '🟡 أصفر', val: yellowCount, color: '#F0C040' },
              { label: '🔴 أحمر', val: redCount, color: '#E05555' },
            ].map(({ label, val, color }) => (
              <div key={label} style={S.barRow}>
                <div style={S.barLabel}>{label}</div>
                <div style={S.barTrack}>
                  <div style={{ ...S.barFill, width: `${(val / total * 100).toFixed(0)}%`, background: color }} />
                </div>
                <div style={S.barVal}>{val}</div>
              </div>
            ))}
          </div>

          {/* Client types */}
          <div style={S.chartCard}>
            <div style={S.chartTitle}>توزيع نوع العملاء</div>
            {[
              { label: 'تطوير (Development)', val: execCount, color: '#5B8DEF' },
              { label: 'تشافي (Healing)', val: healCount, color: '#F0C040' },
              { label: 'كلاهما (Both)', val: clientsArr.length - execCount - healCount, color: '#C9A84C' },
            ].map(({ label, val, color }) => (
              <div key={label} style={S.legendItem}>
                <div style={{ ...S.legendDot, background: color }} />
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(237,232,220,0.7)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  statCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' },
  statIcon: { fontSize: 22, marginBottom: 10 },
  statNum: { fontSize: 30, fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 4 },
  chartCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: 20 },
  chartTitle: { fontSize: 14, fontWeight: 700, marginBottom: 18, color: 'rgba(237,232,220,0.6)', letterSpacing: 0.3 },
  barRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  barLabel: { fontSize: 12, color: 'rgba(237,232,220,0.6)', width: 80, flexShrink: 0 },
  barTrack: { flex: 1, height: 8, background: '#1A1A1A', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
  barVal: { fontSize: 12, color: 'rgba(237,232,220,0.45)', width: 24, textAlign: 'left' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
}
