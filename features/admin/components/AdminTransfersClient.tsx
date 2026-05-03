'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = { pending: 'معلّق', approved_pending_handover: 'بانتظار التسليم', completed: 'مكتمل', rejected: 'مرفوض' }
const STATUS_COLORS: Record<string, string> = { pending: 'var(--color-status-yellow)', approved_pending_handover: 'var(--color-accent)', completed: 'var(--color-status-green)', rejected: 'var(--color-status-red)' }

export function AdminTransfersClient({ transfers }: { transfers: Record<string, unknown>[] }) {
  const [actionId, setActionId] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function approveTransfer(transferId: string) {
    setProcessing(transferId)
    const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    await supabase.from('transfer_requests').update({
      status: 'approved_pending_handover',
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
      handover_deadline: deadline,
    }).eq('id', transferId)
    setActionId(null)
    setAdminNote('')
    setProcessing(null)
    router.refresh()
  }

  async function rejectTransfer(transferId: string) {
    setProcessing(transferId)
    await supabase.from('transfer_requests').update({
      status: 'rejected',
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
    }).eq('id', transferId)
    setActionId(null)
    setAdminNote('')
    setProcessing(null)
    router.refresh()
  }

  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow-card)' }

  return (
    <div>
      {!transfers.length && (
        <div style={{ ...card, textAlign: 'center', color: 'var(--color-text-secondary)' }}>لا توجد طلبات نقل</div>
      )}
      {transfers.map(t => {
        const status = t.status as string
        const isExpanded = actionId === t.id
        const clientProfile = ((t.clients as Record<string, unknown>)?.profiles as Record<string, unknown>)
        return (
          <div key={t.id as string} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>
                    {clientProfile?.full_name as string ?? 'عميل'}
                  </span>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 'var(--font-size-xs)', fontWeight: 700, background: STATUS_COLORS[status] + '18', color: STATUS_COLORS[status] }}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  من: {(t.from_coach as Record<string, unknown>)?.full_name as string ?? '—'} → إلى: {(t.to_coach as Record<string, unknown>)?.full_name as string ?? '—'}
                </p>
                {t.reason && <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.5rem', color: 'var(--color-text)' }}>السبب: {t.reason as string}</p>}
                {t.limited_note && (
                  <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                    ملاحظة محدودة: {t.limited_note as string}
                  </p>
                )}
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                  {new Date(t.requested_at as string).toLocaleDateString('ar-SA')}
                </p>
              </div>

              {status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setActionId(isExpanded ? null : t.id as string)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-btn)', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    مراجعة
                  </button>
                </div>
              )}
            </div>

            {isExpanded && status === 'pending' && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '0.375rem' }}>
                  ملاحظة للموجّهَين (اختياري)
                </label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  placeholder="ملاحظات الإدارة على هذا الطلب..."
                  rows={2} maxLength={500} style={{ marginBottom: '0.75rem', resize: 'none' }} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => approveTransfer(t.id as string)} disabled={processing === t.id}
                    style={{ flex: 1, padding: '0.625rem', background: 'var(--color-status-green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-btn)', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontWeight: 700 }}>
                    {processing === t.id ? '...' : '✓ موافقة'}
                  </button>
                  <button onClick={() => rejectTransfer(t.id as string)} disabled={processing === t.id}
                    style={{ flex: 1, padding: '0.625rem', background: 'var(--color-status-red)', color: '#fff', border: 'none', borderRadius: 'var(--radius-btn)', cursor: 'pointer', fontFamily: 'var(--font-arabic)', fontWeight: 700 }}>
                    {processing === t.id ? '...' : '✗ رفض'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
