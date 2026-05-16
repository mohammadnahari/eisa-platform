'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('success')
        setTimeout(() => router.push('/'), 1500)
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.icon}>{status === 'checking' ? '⏳' : status === 'success' ? '✅' : '❌'}</div>
        <h1 style={S.title}>{status === 'checking' ? 'جارٍ التحقق...' : status === 'success' ? 'تم التحقق بنجاح!' : 'حدث خطأ'}</h1>
        <p style={S.sub}>{status === 'checking' ? 'يرجى الانتظار' : status === 'success' ? 'سيتم تحويلك الآن...' : 'يرجى المحاولة مرة أخرى'}</p>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%), #080808', padding: 24 },
  card: { textAlign: 'center', background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '48px 40px', maxWidth: 380, width: '100%' },
  icon: { fontSize: 48, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  sub: { fontSize: 14, color: 'rgba(237,232,220,0.45)' },
}
