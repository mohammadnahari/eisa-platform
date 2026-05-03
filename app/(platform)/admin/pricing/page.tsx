import { createClient } from '@/lib/supabase/server'
import { AdminPricingClient } from '@/features/admin/components/AdminPricingClient'

export default async function AdminPricingPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*, prices(*), session_templates(*)').order('sort_order')
  const { data: orders } = await supabase.from('orders').select('*, products(name), clients(profiles(full_name))').order('created_at', { ascending: false }).limit(50)
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>الأسعار والباقات</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>إدارة الباقات والأسعار وسجل الطلبات</p>
      </div>
      <AdminPricingClient products={products ?? []} orders={orders ?? []} />
    </div>
  )
}
