'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function CoachReplyForm({ updateId, clientId }: { updateId: string; clientId: string }) {
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleReply() {
    if (!reply.trim()) return
    setSubmitting(true)
    await supabase.from('weekly_updates').update({
      coach_reply: reply,
      coach_reply_at: new Date().toISOString(),
    }).eq('id', updateId)
    setDone(true)
    setSubmitting(false)
    router.refresh()
  }

  if (done) return (
    <div style={{ padding: '0.75rem', background: 'var(--color-status-green-bg)', borderRadius: 8, color: 'var(--color-status-green)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
      ✓ تم إرسال ردك بنجاح
    </div>
  )

  return (
    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
        ردّك على هذا التحديث
      </label>
      <textarea
        value={reply}
        onChange={e => setReply(e.target.value)}
        placeholder="اكتب ردك على عميلك هنا..."
        rows={4}
        maxLength={3000}
        style={{ marginBottom: '0.75rem', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReply}
          disabled={submitting || !reply.trim()}
          style={{
            background: reply.trim() ? 'var(--color-primary)' : 'var(--color-muted)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-btn)',
            padding: '0.625rem 1.5rem', fontSize: 'var(--font-size-sm)',
            fontWeight: 700, cursor: reply.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-arabic)',
          }}
        >
          {submitting ? 'جارٍ الإرسال...' : 'إرسال الرد'}
        </button>
      </div>
    </div>
  )
}
