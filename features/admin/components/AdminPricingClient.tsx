'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Tab = 'products' | 'orders'
const ORDER_STATUS: Record<string, string> = { pending:'معلّق', paid:'مدفوع', failed:'فاشل', refunded:'مسترد', cancelled:'ملغى' }
const ORDER_STATUS_COLOR: Record<string, string> = { pending:'var(--color-status-yellow)', paid:'var(--color-status-green)', failed:'var(--color-status-red)', refunded:'var(--color-muted)', cancelled:'var(--color-muted)' }
const PRODUCT_TYPE: Record<string, string> = { program:'برنامج', session_individual:'جلسة فردية', session_group:'جلسة جماعية', package:'باقة' }

export function AdminPricingClient({ products, orders }: { products: Record<string, unknown>[]; orders: Record<string, unknown>[] }) {
  const [tab, setTab] = useState<Tab>('products')
  const [addingPrice, setAddingPrice] = useState<string | null>(null)
  const [priceForm, setPriceForm] = useState({ amount: '', currency: 'SAR', billing_interval: 'one_time', label: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function addPrice(productId: string) {
    setSaving(true)
    await supabase.from('prices').insert({
      product_id: productId,
      amount: parseFloat(priceForm.amount),
      currency: priceForm.currency,
      billing_interval: priceForm.billing_interval,
      label: priceForm.label || null,
    })
    setAddingPrice(null)
    setPriceForm({ amount: '', currency: 'SAR', billing_interval: 'one_time', label: '' })
    setSaving(false)
    router.refresh()
  }

  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow-card)' }
  const tabs = [{ key: 'products', label: 'الباقات والأسعار' }, { key: 'orders', label: `الطلبات (${orders.length})` }] as const

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'transparent', fontFamily: 'var(--font-arabic)', fontSize: 'var(--font-size-sm)', fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)', borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && products.map(product => {
        const prices = (product.prices as Record<string, unknown>[]) ?? []
        const isAdding = addingPrice === product.id
        return (
          <div key={product.id as string} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>{product.name as string}</h3>
                  <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 20, background: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                    {PRODUCT_TYPE[product.type as string] ?? product.type as string}
                  </span>
                </div>
                {product.description && <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '0.25rem' }}>{product.description as string}</p>}
              </div>
              <button onClick={() => setAddingPrice(isAdding ? null : product.id as string)}
                style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-btn)', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                + إضافة سعر
              </button>
            </div>

            {/* Existing prices */}
            {prices.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {prices.map(p => (
                  <div key={p.id as string} style={{ padding: '0.625rem 1rem', background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {new Intl.NumberFormat('ar-SA').format(p.amount as number)} {p.currency as string}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {p.label as string || (p.billing_interval === 'one_time' ? 'دفعة واحدة' : p.billing_interval as string)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add price form */}
            {isAdding && (
              <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>المبلغ *</label>
                    <input type="number" value={priceForm.amount} onChange={e => setPriceForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>العملة</label>
                    <select value={priceForm.currency} onChange={e => setPriceForm(p => ({ ...p, currency: e.target.value }))}>
                      <option value="SAR">SAR</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="KWD">KWD</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>نوع الدفع</label>
                    <select value={priceForm.billing_interval} onChange={e => setPriceForm(p => ({ ...p, billing_interval: e.target.value }))}>
                      <option value="one_time">دفعة واحدة</option>
                      <option value="monthly">شهري</option>
                      <option value="quarterly">ربع سنوي</option>
                      <option value="annually">سنوي</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>التسمية</label>
                    <input type="text" value={priceForm.label} onChange={e => setPriceForm(p => ({ ...p, label: e.target.value }))} placeholder="مثال: دفعتان" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setAddingPrice(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontSize: 'var(--font-size-sm)' }}>إلغاء</button>
                  <button onClick={() => addPrice(product.id as string)} disabled={saving || !priceForm.amount}
                    style={{ padding: '0.5rem 1rem', background: 'var(--color-accent)', color: 'var(--color-primary)', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                    {saving ? 'جارٍ الحفظ...' : 'حفظ السعر'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {tab === 'orders' && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-arabic)' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                {['العميل', 'المنتج', 'المبلغ', 'الحالة', 'طريقة الدفع', 'التاريخ'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const status = order.status as string
                const clientProfile = ((order.clients as Record<string, unknown>)?.profiles as Record<string, unknown>)
                const product = order.products as Record<string, unknown>
                return (
                  <tr key={order.id as string} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{clientProfile?.full_name as string ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{product?.name as string ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                      {order.amount_paid ? `${new Intl.NumberFormat('ar-SA').format(order.amount_paid as number)} ${order.currency}` : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 'var(--font-size-xs)', fontWeight: 700, background: ORDER_STATUS_COLOR[status] + '18', color: ORDER_STATUS_COLOR[status] }}>
                        {ORDER_STATUS[status] ?? status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {order.payment_method === 'stripe' ? 'Stripe' : order.payment_method === 'bank_transfer' ? 'تحويل بنكي' : 'يدوي'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {new Date(order.created_at as string).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                )
              })}
              {!orders.length && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>لا توجد طلبات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
