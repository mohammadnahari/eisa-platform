'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'password') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('البريد الإلكتروني أو كلمة المرور غير صحيحة'); setLoading(false); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      const home = profile?.role === 'admin' ? '/admin' : profile?.role === 'coach' ? '/coach' : '/client'
      router.push(home)
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify` }
      })
      if (error) { setError('تعذّر إرسال الرابط السحري'); setLoading(false); return }
      setMagicSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
            عيسى للتدريب
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            تسجيل الدخول إلى منصة التوجيه
          </p>
        </div>

        {magicSent ? (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p style={{ color: 'var(--color-text)' }}>تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني</p>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
              تحقق من بريدك وانقر على الرابط للدخول
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '0.375rem' }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                maxLength={255}
              />
            </div>

            {mode === 'password' && (
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '0.375rem' }}>
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  maxLength={128}
                />
              </div>
            )}

            {error && (
              <p style={{ color: 'var(--color-status-red)', fontSize: 'var(--font-size-sm)', background: 'var(--color-status-red-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-input)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'var(--color-muted)' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '0.75rem',
                fontSize: 'var(--font-size-base)',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-arabic)',
                width: '100%',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'جارٍ تسجيل الدخول...' : 'دخول'}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                padding: '0.625rem',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-arabic)',
                width: '100%',
              }}
            >
              {mode === 'password' ? 'الدخول برابط سحري بدلاً من كلمة المرور' : 'الدخول بكلمة المرور'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
