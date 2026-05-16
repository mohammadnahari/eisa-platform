'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={logout} style={S.btn}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#E05555'; e.currentTarget.style.color = '#E05555' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.color = 'rgba(237,232,220,0.45)' }}>
      تسجيل الخروج
    </button>
  )
}

const S: Record<string, React.CSSProperties> = {
  btn: { width: '100%', background: 'transparent', border: '1px solid rgba(201,168,76,0.18)', color: 'rgba(237,232,220,0.45)', padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
}
