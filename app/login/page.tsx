import { Suspense } from 'react'
import LoginClient from './LoginClient'

function LoginFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-arabic)',
      }}
    >
      <p style={{ color: 'var(--color-text-secondary)' }}>
        جارٍ تحميل صفحة تسجيل الدخول...
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  )
}
