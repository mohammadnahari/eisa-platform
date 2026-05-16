import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow, PlatformSettingRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = profileData as ProfileRow | null

  const { data } = await supabase.from('platform_settings').select('*').eq('is_active', true).order('category').order('key')
  const settings = (data ?? []) as PlatformSettingRow[]

  const grouped: Record<string, PlatformSettingRow[]> = {}
  settings.forEach(s => { if (!grouped[s.category]) grouped[s.category] = []; grouped[s.category].push(s) })

  return (
    <div>
      <Header title="إعدادات المنصة" profile={profile!} subtitle="جميع إعدادات النظام القابلة للتخصيص" />
      <div style={{ padding: 28 }}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={S.section}>
            <div style={S.categoryLabel}>{category}</div>
            <div style={S.settingsGrid}>
              {items.map(s => (
                <div key={s.id} style={S.settingCard}>
                  <div style={S.settingLabel}>{s.label}</div>
                  {s.description && <div style={S.settingDesc}>{s.description}</div>}
                  <div style={S.settingValue}>
                    {s.is_sensitive ? '••••••••' : (s.value ?? <span style={{ color: 'rgba(237,232,220,0.2)' }}>غير محدد</span>)}
                  </div>
                  {s.is_sensitive && <div style={S.sensitiveTag}>🔒 حساس</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {settings.length === 0 && <div style={S.empty}>لا توجد إعدادات</div>}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  section: { marginBottom: 28 },
  categoryLabel: { fontSize: 12, fontWeight: 700, color: '#C9A84C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },
  settingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 },
  settingCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '14px 16px' },
  settingLabel: { fontSize: 13, fontWeight: 600, color: '#EDE8DC', marginBottom: 4 },
  settingDesc: { fontSize: 11, color: 'rgba(237,232,220,0.35)', marginBottom: 8, lineHeight: 1.5 },
  settingValue: { fontSize: 13, color: 'rgba(237,232,220,0.6)', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' },
  sensitiveTag: { fontSize: 10, color: '#F0C040', marginTop: 6 },
  empty: { textAlign: 'center', padding: '40px', color: 'rgba(237,232,220,0.25)', fontSize: 13 },
}
