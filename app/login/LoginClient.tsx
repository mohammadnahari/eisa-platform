'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ProfileRow } from '@/lib/types/database.types'

const ROLE_HOME: Record<string, string> = { admin: '/admin', coach: '/coach', client: '/client' }

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.07) 0%, transparent 60%), #080808', padding: 24 },
  card: { width: '100%', maxWidth: 420, background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  topLine: { position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' },
  logo: { fontSize: 13, letterSpacing: 3, color: '#C9A84C', fontWeight: 700, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 700, color: '#EDE8DC', marginBottom: 6 },
  sub: { fontSize: 13, color: 'rgba(237,232,220,0.45)', marginBottom: 32, lineHeight: 1.6 },
  field: { marginBottom: 14, textAlign: 'right' },
  label: { display: 'block', fontSize: 12, color: 'rgba(237,232,220,0.45)', marginBottom: 8, fontWeight: 500 },
  input: { width: '100%', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '13px 15px', color: '#EDE8DC', fontSize: 15, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  btn: { width: '100%', background: '#C9A84C', color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit', transition: 'all 0.2s' },
  errBox: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 8, padding: '10px 14px', color: '#E05555', fontSize: 13, marginBottom: 16 },
  warnBox: { background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.25)', borderRadius: 8, padding: '10px 14px', color: '#F0C040', fontSize: 13, marginBottom: 16 },
  back: { display: 'block', marginTop: 20, fontSize: 13, color: 'rgba(237,232,220,0.35)', borderBottom: '1px solid rgba(201,168,76,0.15)', paddingBottom: 2, textAlign: 'center' },
}

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const reason = params.get('reason')
  const reset = params.get('reset')
  const next = params.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (authErr || !data.user) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase.from('profiles').select('role, is_active').eq('id', data.user.id).single()
    const profile = profileData as Pick<ProfileRow, 'role' | 'is_active'> | null

    if (!profile || profile.is_active === false) {
      await supabase.auth.signOut()
      setError('حسابك معلّق. تواصل مع مسؤول المنصة.')
      setLoading(false)
      return
    }

    router.push(next ?? ROLE_HOME[profile.role] ?? '/')
    router.refresh()
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.topLine} />
        <div style={S.logo}>عيسى للتدريب</div>
        <h1 style={S.title}>تسجيل الدخول</h1>
        <p style={S.sub}>سجّل دخولك لمتابعة رحلتك في اتفاقية الازدهار</p>

        {reason === 'suspended' && <div style={S.warnBox}>حسابك موقوف. تواصل مع مسؤول المنصة.</div>}
        {reset === 'success' && <div style={S.warnBox}>تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.</div>}
        {error && <div style={S.errBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={S.field}>
            <label style={S.label}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ ...S.input, direction: 'ltr' }} placeholder="your@email.com" autoComplete="email" />
          </div>
          <div style={S.field}>
            <label style={S.label}>كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={S.input} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading} style={S.btn}>
            {loading ? 'جارٍ التحقق...' : 'دخول'}
          </button>
        </form>

        <Link href="/forgot-password" style={S.back}>نسيت كلمة المرور؟</Link>

        <Link href="/" style={S.back}>← العودة للصفحة الرئيسية</Link>
      </div>
    </div>
  )
}
