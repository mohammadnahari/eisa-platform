'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  input: { width: '100%', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '13px 15px', color: '#EDE8DC', fontSize: 15, outline: 'none', fontFamily: 'inherit' },
  btn: { width: '100%', background: '#C9A84C', color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
  errBox: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 8, padding: '10px 14px', color: '#E05555', fontSize: 13, marginBottom: 16, lineHeight: 1.7 },
  successBox: { background: 'rgba(80,180,120,0.08)', border: '1px solid rgba(80,180,120,0.25)', borderRadius: 8, padding: '10px 14px', color: '#72D28A', fontSize: 13, marginBottom: 16, lineHeight: 1.7 },
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
  const supabase = createClient()

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      setReady(true)
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setReady(true)
      }
    })

    setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setReady(true)
        } else {
          setError('رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة تسجيل الدخول.')
        }
      })
    }, 1200)

    return () => subscription.unsubscribe()
  }

  checkSession()
}, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل.')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError('تعذر تحديث كلمة المرور. يرجى طلب رابط جديد والمحاولة مرة أخرى.')
      return
    }

    setSuccess(true)
    await supabase.auth.signOut()

    setTimeout(() => {
      router.push('/login?reset=success')
    }, 1200)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.topLine} />
        <div style={S.logo}>عيسى للتدريب</div>
        <h1 style={S.title}>تعيين كلمة مرور جديدة</h1>
        <p style={S.sub}>اختر كلمة مرور جديدة لحسابك.</p>

        {success && <div style={S.successBox}>تم تحديث كلمة المرور بنجاح. سيتم تحويلك لتسجيل الدخول.</div>}
        {error && <div style={S.errBox}>{error}</div>}

        {ready && !success && (
          <form onSubmit={handleSubmit}>
            <div style={S.field}>
              <label style={S.label}>كلمة المرور الجديدة</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={S.input} autoComplete="new-password" />
            </div>

            <div style={S.field}>
              <label style={S.label}>تأكيد كلمة المرور</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={S.input} autoComplete="new-password" />
            </div>

            <button type="submit" disabled={loading} style={S.btn}>
              {loading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
