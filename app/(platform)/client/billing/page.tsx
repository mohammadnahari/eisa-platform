import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>
        المدفوعات
      </h1>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  )
}
