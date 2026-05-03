'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const ADMIN_NAV = [
  { href: '/admin', label: 'لوحة التحكم', icon: '⊞' },
  { href: '/admin/users', label: 'المستخدمون', icon: '👥' },
  { href: '/admin/transfers', label: 'طلبات النقل', icon: '↔️' },
  { href: '/admin/pricing', label: 'الأسعار', icon: '💰' },
  { href: '/admin/communications', label: 'الاتصالات', icon: '📨' },
  { href: '/admin/security', label: 'الأمان', icon: '🔒' },
  { href: '/admin/audit-log', label: 'سجل الأحداث', icon: '📋' },
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
]

const COACH_NAV = [
  { href: '/coach', label: 'لوحتي', icon: '⊞' },
  { href: '/coach/clients', label: 'عملائي', icon: '👤' },
  { href: '/coach/leads', label: 'المرشحون', icon: '🌱' },
  { href: '/coach/sessions', label: 'الجلسات', icon: '📅' },
  { href: '/coach/reports', label: 'التقارير', icon: '📊' },
  { href: '/coach/engagement', label: 'الانخراط', icon: '🔥' },
  { href: '/coach/practice', label: 'ممارستي', icon: '📈' },
  { href: '/coach/settings/connections', label: 'الإعدادات', icon: '⚙️' },
]

const CLIENT_NAV = [
  { href: '/client', label: 'رحلتي', icon: '🗺️' },
  { href: '/client/update', label: 'التحديث الأسبوعي', icon: '✍️' },
  { href: '/client/sessions', label: 'جلساتي', icon: '📅' },
  { href: '/client/stages', label: 'المراحل', icon: '🏆' },
  { href: '/client/billing', label: 'المدفوعات', icon: '💳' },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const supabase = createClient()
  const nav = profile.role === 'admin' ? ADMIN_NAV : profile.role === 'coach' ? COACH_NAV : CLIENT_NAV

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--color-primary)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      borderLeft: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>
          عيسى للتدريب
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--font-size-xs)', marginTop: '0.25rem' }}>
          {profile.role === 'admin' ? 'لوحة المدير' : profile.role === 'coach' ? 'لوحة الموجّه' : 'بوابة العميل'}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        {nav.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/coach' && item.href !== '/client' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                marginBottom: '0.25rem',
                color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(200,169,110,0.12)' : 'transparent',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)', fontWeight: 800, fontSize: 'var(--font-size-sm)',
          }}>
            {profile.full_name[0]}
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{profile.full_name}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'var(--font-size-xs)' }}>{profile.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
            color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-xs)',
            cursor: 'pointer', fontFamily: 'var(--font-arabic)',
          }}
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
