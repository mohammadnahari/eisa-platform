import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()
  const [
    { count: totalClients },
    { count: activeCoaches },
    { count: pendingTransfers },
    { count: unreadUpdates },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach').eq('is_active', true),
    supabase.from('transfer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('weekly_updates').select('*', { count: 'exact', head: true }).is('coach_reply', null),
    supabase.from('leads').select('id, full_name, status, created_at').eq('status', 'new').order('created_at', { ascending: false }).limit(5),
  ])
  return { totalClients, activeCoaches, pendingTransfers, unreadUpdates, recentLeads }
}

const cardStyle = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-card)',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const metricCards = [
    { label: 'العملاء النشطون', value: stats.totalClients ?? 0, icon: '👤', color: 'var(--color-status-green)' },
    { label: 'الموجّهون النشطون', value: stats.activeCoaches ?? 0, icon: '🎓', color: 'var(--color-primary)' },
    { label: 'طلبات النقل المعلقة', value: stats.pendingTransfers ?? 0, icon: '↔️', color: 'var(--color-status-yellow)' },
    { label: 'تحديثات بدون رد', value: stats.unreadUpdates ?? 0, icon: '✉️', color: 'var(--color-status-red)' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
          لوحة التحكم
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          نظرة عامة على المنصة
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {metricCards.map(card => (
          <div key={card.label} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {card.value}
                </p>
              </div>
              <span style={{ fontSize: '1.75rem' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
            آخر المرشحين الجدد
          </h2>
          {!stats.recentLeads?.length ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لا يوجد مرشحون جدد</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentLeads.map(lead => (
                <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{lead.full_name}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {new Date(lead.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
            الإجراءات السريعة
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { href: '/admin/users', label: 'إدارة المستخدمين' },
              { href: '/admin/transfers', label: 'مراجعة طلبات النقل' },
              { href: '/admin/settings', label: 'إعدادات المنصة' },
              { href: '/admin/pricing', label: 'إدارة الأسعار' },
            ].map(action => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: 'block', padding: '0.75rem 1rem',
                  background: 'var(--color-bg)', borderRadius: '8px',
                  textDecoration: 'none', color: 'var(--color-text)',
                  fontWeight: 500, fontSize: 'var(--font-size-sm)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color 0.15s',
                }}
              >
                {action.label} ←
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
