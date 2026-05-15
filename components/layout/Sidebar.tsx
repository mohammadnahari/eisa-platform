'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserRole = 'admin' | 'coach' | 'client'

type NavItem = {
  href: string
  label: string
  icon: string
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'لوحة المدير',
  coach: 'لوحة الموجّه',
  client: 'بوابة العميل',
}

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'لوحة التحكم', icon: '⊞' },
  { href: '/admin/users', label: 'المستخدمون', icon: '👥' },
  { href: '/admin/transfers', label: 'طلبات النقل', icon: '↔️' },
  { href: '/admin/pricing', label: 'الأسعار', icon: '💰' },
  { href: '/admin/communications', label: 'الاتصالات', icon: '📨' },
  { href: '/admin/security', label: 'الأمان', icon: '🔒' },
  { href: '/admin/audit-log', label: 'سجل الأحداث', icon: '📋' },
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
]

const COACH_NAV: NavItem[] = [
  { href: '/coach', label: 'لوحتي', icon: '⊞' },
  { href: '/coach/clients', label: 'عملائي', icon: '👤' },
  { href: '/coach/leads', label: 'المرشحون', icon: '🌱' },
  { href: '/coach/sessions', label: 'الجلسات', icon: '📅' },
  { href: '/coach/reports', label: 'التقارير', icon: '📊' },
  { href: '/coach/engagement', label: 'الانخراط', icon: '🔥' },
  { href: '/coach/practice', label: 'ممارستي', icon: '📈' },
  { href: '/coach/settings/connections', label: 'الإعدادات', icon: '⚙️' },
]

const CLIENT_NAV: NavItem[] = [
  { href: '/client', label: 'رحلتي', icon: '🗺️' },
  { href: '/client/update', label: 'التحديث الأسبوعي', icon: '✍️' },
  { href: '/client/sessions', label: 'جلساتي', icon: '📅' },
  { href: '/client/stages', label: 'المراحل', icon: '🏆' },
  { href: '/client/billing', label: 'المدفوعات', icon: '💳' },
]

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  coach: COACH_NAV,
  client: CLIENT_NAV,
}

function normalizeRole(role: Profile['role']): UserRole {
  if (role === 'admin' || role === 'coach' || role === 'client') {
    return role
  }

  return 'client'
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const role = normalizeRole(profile.role)
  const nav = NAV_BY_ROLE[role]

  const displayName = profile.full_name?.trim() || profile.email?.trim() || 'User'
  const displayEmail = profile.email?.trim() || ''
  const avatarInitial = displayName.charAt(0).toUpperCase()

  async function handleSignOut() {
    if (isSigningOut) return

    setIsSigningOut(true)

    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      window.location.href = '/login'
    }
  }

  return (
    <aside
      style={{
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
      }}
    >
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>
          عيسى للتدريب
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--font-size-xs)', marginTop: '0.25rem' }}>
          {ROLE_LABEL[role]}
        </p>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }} aria-label="Main navigation">
        {nav.map((item) => {
          const isActive = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
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
              <span style={{ fontSize: '1rem' }} aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              fontWeight: 800,
              fontSize: 'var(--font-size-sm)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {avatarInitial}
          </div>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: '#fff',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayName}
            >
              {displayName}
            </p>

            {displayEmail && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 'var(--font-size-xs)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={displayEmail}
              >
                {displayEmail}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'var(--font-size-xs)',
            cursor: isSigningOut ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-arabic)',
            opacity: isSigningOut ? 0.7 : 1,
          }}
        >
          {isSigningOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
        </button>
      </div>
    </aside>
  )
}