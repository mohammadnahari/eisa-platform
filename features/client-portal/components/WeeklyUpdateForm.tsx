'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type StatusColor = 'green' | 'yellow' | 'red'

const STATUS_CONFIG = {
  green: {
    label: 'أخضر — أسبوع جيد',
    description: 'الأمور تسير بشكل إيجابي وأنا على المسار الصحيح',
    bg: 'var(--color-status-green-bg)',
    border: 'var(--color-status-green)',
    color: 'var(--color-status-green)',
    emoji: '🟢',
  },
  yellow: {
    label: 'أصفر — أسبوع مقبول',
    description: 'مررت ببعض التحديات لكنني ما زلت أتقدم',
    bg: 'var(--color-status-yellow-bg)',
    border: 'var(--color-status-yellow)',
    color: 'var(--color-status-yellow)',
    emoji: '🟡',
  },
  red: {
    label: 'أحمر — أسبوع صعب',
    description: 'واجهت صعوبات حقيقية تستحق التوقف والمعالجة',
    bg: 'var(--color-status-red-bg)',
    border: 'var(--color-status-red)',
    color: 'var(--color-status-red)',
    emoji: '🔴',
  },
}

export function WeeklyUpdateForm({ clientId, weekNumber }: { clientId: string; weekNumber: number }) {
  const [step, setStep] = useState<'color' | 'details' | 'pressure' | 'done'>('color')
  const [statusColor, setStatusColor] = useState<StatusColor | null>(null)
  const [form, setForm] = useState({ summary: '', achievements: '', challenges: '', next_week_plan: '', pressure_note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function selectColor(color: StatusColor) {
    setStatusColor(color)
    setStep('details')
  }

  function handleField(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function proceedFromDetails() {
    if (!form.summary.trim()) { setError('يرجى كتابة ملخص للأسبوع'); return }
    setError('')
    if (statusColor === 'red') setStep('pressure')
    else handleSubmit()
  }

  async function handleSubmit() {
    if (statusColor === 'red' && !form.pressure_note.trim()) {
      setError('يرجى وصف ما تشعر به في وضع الضغط')
      return
    }
    setSubmitting(true)
    setError('')

    const { error: err } = await supabase.from('weekly_updates').insert({
      client_id: clientId,
      week_number: weekNumber,
      status_color: statusColor!,
      summary: form.summary,
      achievements: form.achievements || null,
      challenges: form.challenges || null,
      next_week_plan: form.next_week_plan || null,
      pressure_note: form.pressure_note || null,
    })

    if (err) { setError('تعذّر حفظ التحديث. يرجى المحاولة مجدداً'); setSubmitting(false); return }
    setStep('done')
  }

  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-card)' }
  const btnPrimary = { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-btn)', padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-base)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-arabic)' }
  const btnSecondary = { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-btn)', padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'var(--font-arabic)' }
  const fieldStyle = { marginBottom: '1.25rem' }
  const labelStyle = { display: 'block', fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', marginBottom: '0.375rem' }

  // STEP 1: Color selection
  if (step === 'color') {
    return (
      <div style={card}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          كيف كان أسبوعك؟
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: 'var(--font-size-sm)' }}>
          اختر اللون الذي يعكس حالتك هذا الأسبوع
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(Object.entries(STATUS_CONFIG) as [StatusColor, typeof STATUS_CONFIG.green][]).map(([color, config]) => (
            <button key={color} onClick={() => selectColor(color)}
              style={{
                padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-card)',
                border: `2px solid ${config.border}`, background: config.bg,
                cursor: 'pointer', textAlign: 'right', fontFamily: 'var(--font-arabic)',
                transition: 'transform 0.1s, box-shadow 0.1s',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              <span style={{ fontSize: '2rem' }}>{config.emoji}</span>
              <div>
                <p style={{ fontWeight: 700, color: config.color, fontSize: 'var(--font-size-base)' }}>{config.label}</p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '0.25rem' }}>{config.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // STEP 2: Details
  if (step === 'details') {
    const cfg = STATUS_CONFIG[statusColor!]
    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: cfg.bg, borderRadius: 8, border: `1px solid ${cfg.border}` }}>
          <span style={{ fontSize: '1.5rem' }}>{cfg.emoji}</span>
          <span style={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          <button onClick={() => setStep('color')} style={{ ...btnSecondary, marginRight: 'auto', padding: '0.25rem 0.75rem', fontSize: 'var(--font-size-xs)', border: 'none', color: cfg.color }}>
            تغيير
          </button>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>ملخص الأسبوع *</label>
          <textarea value={form.summary} onChange={e => handleField('summary', e.target.value)}
            placeholder="كيف كان أسبوعك بشكل عام؟ ما الذي حدث؟"
            rows={4} maxLength={2000} style={{ resize: 'vertical' }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>إنجازات هذا الأسبوع</label>
          <textarea value={form.achievements} onChange={e => handleField('achievements', e.target.value)}
            placeholder="ما الذي أنجزته أو تقدّمت فيه؟"
            rows={3} maxLength={1000} style={{ resize: 'vertical' }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>تحديات واجهتها</label>
          <textarea value={form.challenges} onChange={e => handleField('challenges', e.target.value)}
            placeholder="ما العقبات أو الصعوبات التي مررت بها؟"
            rows={3} maxLength={1000} style={{ resize: 'vertical' }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>خطتي للأسبوع القادم</label>
          <textarea value={form.next_week_plan} onChange={e => handleField('next_week_plan', e.target.value)}
            placeholder="ما الذي ستركز عليه الأسبوع القادم؟"
            rows={3} maxLength={1000} style={{ resize: 'vertical' }} />
        </div>

        {error && <p style={{ color: 'var(--color-status-red)', fontSize: 'var(--font-size-sm)', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'var(--color-status-red-bg)', borderRadius: 6 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setStep('color')} style={btnSecondary}>رجوع</button>
          <button onClick={proceedFromDetails} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
            {statusColor === 'red' ? 'التالي ←' : (submitting ? 'جارٍ الحفظ...' : 'إرسال التحديث')}
          </button>
        </div>
      </div>
    )
  }

  // STEP 3: Pressure mode (red only)
  if (step === 'pressure') {
    return (
      <div style={card}>
        <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
          <span style={{ fontSize: '3rem' }}>🔴</span>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-status-red)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            وضع الضغط
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            لاحظت أن هذا الأسبوع كان صعباً. هذا المكان آمن لك.
            أخبرني بما تشعر به حقاً — لن يطّلع على هذا إلا موجّهك.
          </p>
        </div>

        <div style={{ background: 'var(--color-status-red-bg)', border: '1px solid var(--color-status-red)', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, color: 'var(--color-status-red)', marginBottom: '0.75rem', fontSize: 'var(--font-size-sm)' }}>
            أسئلة تساعدك على التعبير:
          </p>
          <ul style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 2, listStyle: 'none', padding: 0 }}>
            <li>• ما الذي أرهقك أكثر هذا الأسبوع؟</li>
            <li>• هل هناك شيء تجنّبته أو أرجأته؟</li>
            <li>• كيف حالك على المستوى الداخلي؟</li>
            <li>• ما الذي تحتاجه الآن؟</li>
          </ul>
        </div>

        <textarea value={form.pressure_note} onChange={e => handleField('pressure_note', e.target.value)}
          placeholder="اكتب ما تشعر به بحرية تامة..."
          rows={6} maxLength={3000} style={{ resize: 'vertical', borderColor: 'var(--color-status-red)', marginBottom: '1rem' }} />

        {error && <p style={{ color: 'var(--color-status-red)', fontSize: 'var(--font-size-sm)', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'var(--color-status-red-bg)', borderRadius: 6 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setStep('details')} style={btnSecondary}>رجوع</button>
          <button onClick={handleSubmit} disabled={submitting || !form.pressure_note.trim()}
            style={{ ...btnPrimary, background: 'var(--color-status-red)', opacity: (submitting || !form.pressure_note.trim()) ? 0.5 : 1 }}>
            {submitting ? 'جارٍ الحفظ...' : 'إرسال التحديث'}
          </button>
        </div>
      </div>
    )
  }

  // STEP 4: Done
  return (
    <div style={{ ...card, textAlign: 'center', padding: '3rem 2rem' }}>
      <span style={{ fontSize: '4rem' }}>✅</span>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-status-green)', margin: '1rem 0 0.5rem' }}>
        تم إرسال تحديثك!
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        سيطّلع موجّهك على تحديثك ويردّ عليه قريباً
      </p>
      <button onClick={() => router.push('/client')} style={btnPrimary}>
        العودة إلى لوحتي
      </button>
    </div>
  )
}
