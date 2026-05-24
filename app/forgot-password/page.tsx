'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.07) 0%, transparent 60%), #080808', padding: 24 },
  card: { width: '100%', maxWidth: 420, background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  topLine: { position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' },
  logo: { fontSize: 13, letterSpacing: 3, color: '#C9A84C', fontWeight: 700, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 700, color: '#EDE8DC', marginBottom: 6 },
  sub: { fontSize: 13, color: 'rgba(237,232,220,0.45)', marginBottom: 28, lineHeight: 1.7 },
  field: { marginBottom: 14, textAlign: 'right' },
  label: { display: 'block', fontSize: 12, color: 'rgba(237,232,220,0.45)', marginBottom: 8, fontWeight: 500 },
  input: { width: '100%', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '13px 15px', color: '#EDE8DC', fontSize: 15, outline: 'none', fontFamily: 'inherit', direction: 'ltr' },
  btn: { width: '100%', background: '#C9A84C', color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
  errBox: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 8, padding: '10px 14px', color: '#E05555', fontSize: 13, marginBottom: 16 },
  successBox: { background: 'rgba(80,180,120,0.08)', border: '1px solid rgba(80,180,120,0.25)', borderRadius: 8, padding: '10px 14px', color: '#72D28A', fontSize: 13, marginBottom: 16, lineHeight: 1.7 },
  back: { display: 'block', marginTop: 20, fontSize: 13, color: 'rgba(237,232,220,0.45)', textAlign: 'center', textDecoration: 'none' },
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    setLoading(false)

    if (error) {
      setError('تعذر إرسال رابط إعادة التعيين. تحقق من البريد الإلكتروني وحاول مرة أخرى.')
      return
    }

    setSent(true)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.topLine} />
        <div style={S.logo}>عيسى للتدريب</div>
        <h1 style={S.title}>استعادة كلمة المرور</h1>
        <p style={S.sub}>أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لتعيين كلمة مرور جديدة.</p>

        {sent && <div style={S.successBox}>تم إرسال رابط إعادة تعيين كلمة المرور إذا كان البريد مسجلًا لدينا. يرجى التحقق من بريدك.</div>}
        {error && <div style={S.errBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={S.field}>
            <label style={S.label}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={S.input} placeholder="your@email.com" autoComplete="email" />
          </div>

          <button type="submit" disabled={loading} style={S.btn}>
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
          </button>
        </form>

        <Link href="/login" style={S.back}>العودة لتسجيل الدخول</Link>
      </div>
    </div>
  )
}
