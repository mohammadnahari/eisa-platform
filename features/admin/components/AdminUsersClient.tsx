'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'
import { useRouter } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row']

const ROLE_LABELS: Record<string, string> = { admin: 'مدير', coach: 'موجّه', client: 'عميل' }
const ROLE_COLORS: Record<string, string> = { admin: 'var(--color-primary)', coach: 'var(--color-accent)', client: 'var(--color-status-green)' }

export function AdminUsersClient({ profiles }: { profiles: Profile[] }) {
  const [filter, setFilter] = useState<'all' | 'admin' | 'coach' | 'client'>('all')
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = profiles.filter(p => {
    if (filter !== 'all' && p.role !== filter) return false
    if (search && !p.full_name.includes(search) && !p.email.includes(search)) return false
    return true
  })

  async function toggleActive(profile: Profile) {
    setToggling(profile.id)
    await supabase.from('profiles').update({ is_active: !profile.is_active }).eq('id', profile.id)
    setToggling(null)
    router.refresh()
  }

  const counts = { all: profiles.length, admin: profiles.filter(p => p.role === 'admin').length, coach: profiles.filter(p => p.role === 'coach').length, client: profiles.filter(p => p.role === 'client').length }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        {(['all', 'admin', 'coach', 'client'] as const).map(role => (
          <button key={role} onClick={() => setFilter(role)}
            style={{ padding: '0.5rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontSize: 'var(--font-size-sm)', fontWeight: filter === role ? 700 : 400, background: filter === role ? 'var(--color-primary)' : 'var(--color-surface)', color: filter === role ? '#fff' : 'var(--color-text-secondary)', border: `1px solid ${filter === role ? 'transparent' : 'var(--color-border)'}` }}>
            {role === 'all' ? 'الكل' : ROLE_LABELS[role]} ({counts[role]})
          </button>
        ))}
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد..."
          style={{ marginRight: 'auto', width: 240 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-arabic)' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['المستخدم', 'الدور', 'البريد', 'الحالة', 'تاريخ الإنشاء', 'إجراء'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(profile => (
              <tr key={profile.id} style={{ borderBottom: '1px solid var(--color-border)', opacity: profile.is_active ? 1 : 0.55 }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: ROLE_COLORS[profile.role], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 'var(--font-size-sm)', flexShrink: 0 }}>
                      {profile.full_name[0]}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{profile.full_name}</span>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 'var(--font-size-xs)', fontWeight: 700, background: ROLE_COLORS[profile.role] + '18', color: ROLE_COLORS[profile.role] }}>
                    {ROLE_LABELS[profile.role]}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{profile.email}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 'var(--font-size-xs)', fontWeight: 700, background: profile.is_active ? 'var(--color-status-green-bg)' : 'var(--color-status-red-bg)', color: profile.is_active ? 'var(--color-status-green)' : 'var(--color-status-red)' }}>
                    {profile.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => toggleActive(profile)} disabled={toggling === profile.id}
                    style={{ padding: '0.375rem 0.75rem', border: `1px solid ${profile.is_active ? 'var(--color-status-red)' : 'var(--color-status-green)'}`, borderRadius: 6, background: 'transparent', color: profile.is_active ? 'var(--color-status-red)' : 'var(--color-status-green)', fontSize: 'var(--font-size-xs)', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontWeight: 600 }}>
                    {toggling === profile.id ? '...' : profile.is_active ? 'إيقاف' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            لا يوجد مستخدمون يطابقون البحث
          </div>
        )}
      </div>
    </div>
  )
}
