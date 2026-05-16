'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ProfileRow, UserRole } from '@/lib/types/database.types'
import LogoutButton from '@/components/auth/LogoutButton'

const NAV: Record<UserRole, { label: string; href: string; icon: string }[]> = {
  admin: [
    { label: 'لوحة الإحصاء', href: '/admin', icon: '📊' },
    { label: 'المستخدمون', href: '/admin/users', icon: '👥' },
    { label: 'العملاء', href: '/admin/clients', icon: '🎯' },
    { label: 'الطلبات الواردة', href: '/admin/leads', icon: '📥' },
    { label: 'الجلسات', href: '/admin/sessions', icon: '📅' },
    { label: 'المنتجات', href: '/admin/products', icon: '📦' },
    { label: 'الإشعارات', href: '/admin/notifications', icon: '🔔' },
    { label: 'الإعدادات', href: '/admin/settings', icon: '⚙️' },
  ],
  coach: [
    { label: 'لوحة المتابعة', href: '/coach', icon: '📊' },
    { label: 'عملائي', href: '/coach/clients', icon: '🎯' },
    { label: 'الجلسات', href: '/coach/sessions', icon: '📅' },
    { label: 'الأهداف', href: '/coach/goals', icon: '🏆' },
    { label: 'التحديثات', href: '/coach/updates', icon: '📝' },
  ],
  client: [
    { label: 'رحلتي', href: '/client', icon: '🗺' },
    { label: 'جلساتي', href: '/client/sessions', icon: '📅' },
    { label: 'أهدافي', href: '/client/goals', icon: '🏆' },
    { label: 'تحديثاتي', href: '/client/updates', icon: '📝' },
  ],
}

const ROLE_LABEL: Record<UserRole, string> = { admin: 'مدير النظام', coach: 'موجّه', client: 'عميل' }
const ROLE_BADGE_COLOR: Record<UserRole, string> = { admin: '#5B8DEF', coach: '#C9A84C', client: '#4CAF7D' }

export default function Sidebar({ profile }: { profile: ProfileRow }) {
  const pathname = usePathname()
  // Safe nullable access
  const displayName = profile.full_name ?? profile.email ?? 'مستخدم'
  const initial = displayName.charAt(0).toUpperCase()
  const navItems = NAV[profile.role] ?? []

  return (
    <aside style={S.sidebar}>
      {/* Brand */}
      <div style={S.brand}>
        <div style={S.brandName}>عيسى للتدريب</div>
        <div style={S.brandSub}>منصة التدريب التنفيذي</div>
        <div style={{ ...S.roleBadge, background: `${ROLE_BADGE_COLOR[profile.role]}18`, border: `1px solid ${ROLE_BADGE_COLOR[profile.role]}40`, color: ROLE_BADGE_COLOR[profile.role] }}>
          {ROLE_LABEL[profile.role]}
        </div>
      </div>

      {/* Navigation */}
      <nav style={S.nav}>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/coach' && item.href !== '/client' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{ ...S.navItem, ...(isActive ? S.navActive : {}) }}>
              <span style={S.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={S.footer}>
        <div style={S.userRow}>
          <div style={S.avatar}>{initial}</div>
          <div style={S.userInfo}>
            <div style={S.userName}>{displayName}</div>
            <div style={S.userRole}>{profile.email}</div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}

const S: Record<string, React.CSSProperties> = {
  sidebar: { width: 240, minHeight: '100vh', background: '#111', borderLeft: '1px solid rgba(201,168,76,0.15)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50 },
  brand: { padding: '24px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)' },
  brandName: { fontSize: 16, fontWeight: 700, color: '#C9A84C' },
  brandSub: { fontSize: 11, color: 'rgba(237,232,220,0.4)', marginTop: 3 },
  roleBadge: { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', borderRadius: 4, marginTop: 8 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, fontSize: 14, color: 'rgba(237,232,220,0.5)', transition: 'all 0.15s', textDecoration: 'none' },
  navActive: { background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
  footer: { padding: '16px 12px', borderTop: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', gap: 10 },
  userRow: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#C9A84C', flexShrink: 0 },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: 13, fontWeight: 600, color: '#EDE8DC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 10, color: 'rgba(237,232,220,0.35)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', direction: 'ltr', textAlign: 'right' },
}
