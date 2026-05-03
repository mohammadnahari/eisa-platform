import { createClient } from '@/lib/supabase/server'

export default async function CoachConnectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: connections } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('profile_id', user.id)

  const googleConnected = connections?.find(c => c.provider === 'google')
  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_SUPABASE_URL // placeholder

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>الاتصالات</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>ربط حسابات البريد الإلكتروني لإرسال الرسائل من عنوانك الشخصي</p>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>G</div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Google Workspace</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {googleConnected ? `متصل: ${googleConnected.email}` : 'إرسال الإيميلات من حسابك على Gmail'}
              </p>
            </div>
          </div>
          {googleConnected ? (
            <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--color-status-green-bg)', color: 'var(--color-status-green)', fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>✓ متصل</span>
          ) : (
            <a href={`/api/auth/callback/google?setup=true`}
              style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-btn)', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
              ربط Google
            </a>
          )}
        </div>

        <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text)' }}>خطوات الإعداد:</strong><br/>
          1. تأكد من إعداد Google Client ID في إعدادات المنصة<br/>
          2. أضف Redirect URI في Google Cloud Console:<br/>
          <code style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', background: 'var(--color-surface)', padding: '2px 6px', borderRadius: 4 }}>
            {process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google
          </code>
        </div>
      </div>
    </div>
  )
}
