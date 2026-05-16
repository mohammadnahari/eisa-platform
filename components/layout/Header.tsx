import type { ProfileRow } from '@/lib/types/database.types'

export default function Header({ title, profile, subtitle }: { title: string; profile: ProfileRow; subtitle?: string }) {
  const firstName = (profile.full_name ?? profile.email ?? 'مستخدم').split(' ')[0]
  return (
    <header style={S.header}>
      <div>
        <h1 style={S.title}>{title}</h1>
        {subtitle && <p style={S.subtitle}>{subtitle}</p>}
      </div>
      <div style={S.right}>
        <span style={S.greeting}>مرحباً، {firstName}</span>
        {profile.preferred_lang && (
          <span style={S.lang}>{profile.preferred_lang.toUpperCase()}</span>
        )}
      </div>
    </header>
  )
}

const S: Record<string, React.CSSProperties> = {
  header: { height: 62, background: '#111', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 40 },
  title: { fontSize: 18, fontWeight: 700, color: '#EDE8DC' },
  subtitle: { fontSize: 12, color: 'rgba(237,232,220,0.4)', marginTop: 2 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  greeting: { fontSize: 14, color: 'rgba(237,232,220,0.6)' },
  lang: { fontSize: 10, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: 1 },
}
