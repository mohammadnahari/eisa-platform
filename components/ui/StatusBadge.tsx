import type { WeeklyStatusColor } from '@/lib/types/database.types'

const CONFIG: Record<WeeklyStatusColor, { label: string; bg: string; color: string; border: string }> = {
  green: { label: 'أخضر', bg: 'rgba(76,175,125,0.12)', color: '#4CAF7D', border: 'rgba(76,175,125,0.3)' },
  yellow: { label: 'أصفر', bg: 'rgba(240,192,64,0.12)', color: '#F0C040', border: 'rgba(240,192,64,0.3)' },
  red: { label: 'أحمر', bg: 'rgba(224,85,85,0.12)', color: '#E05555', border: 'rgba(224,85,85,0.3)' },
}

export default function StatusBadge({ status }: { status: WeeklyStatusColor }) {
  const c = CONFIG[status]
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴'} {c.label}
    </span>
  )
}
