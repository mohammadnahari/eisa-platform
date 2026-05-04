'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types/database.types'

type ProfileRole = { role: UserRole }

export default function VerifyPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        const profile = profileData as ProfileRole | null
        const home = profile?.role === 'admin' ? '/admin' : profile?.role === 'coach' ? '/coach' : '/client'
        router.push(home)
      }
    })
  }, [supabase, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: 'var(--font-arabic)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: 'var(--color-text-secondary)' }}>جارٍ التحقق من هويتك...</p>
      </div>
    </div>
  )
}
