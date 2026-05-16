'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WeeklyStatusColor } from '@/lib/types/database.types'

interface Props {
  clientId: string
  nextWeekNumber: number
  onSubmitted: () => void
}

const STATUS_OPTIONS: { value: WeeklyStatusColor; label: string; icon: string; desc: string }[] = [
  { value: 'green', label: 'أخضر', icon: '🟢', desc: 'أتقدم بثبات' },
  { value: 'yellow', label: 'أصفر', icon: '🟡', desc: 'تحديات موجودة' },
  { value: 'red', label: 'أحمر', icon: '🔴', desc: 'أسبوع صعب' },
]

const STATUS_COLOR: Record<WeeklyStatusColor, { bg: string; border: string; text: string }> = {
  green: { bg: 'rgba(76,175,125,0.1)', border: '#4CAF7D', text: '#4CAF7D' },
  yellow: { bg: 'rgba(240,192,64,0.1)', border: '#F0C040', text: '#F0C040' },
  red: { bg: 'rgba(224,85,85,0.1)', border: '#E05555', text: '#E05555' },
}

export default function WeeklyUpdateForm({ clientId, nextWeekNumber, onSubmitted }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<WeeklyStatusColor | null>(null)
  const [isPressure, setIsPressure] = useState(false)
  const [achievements, setAchievements] = useState('')
  const [challenges, setChallenges] = useState('')
  const [nextPlan, setNextPlan] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!status) { setError('اختر حالة أسبوعك أولاً'); return }
    if (!achievements.trim()) { setError('اذكر شيئاً أنجزته هذا الأسبوع'); return }
    if (!nextPlan.trim()) { setError('حدّد التزامك للأسبوع القادم'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: insertErr } = await supabase.from('weekly_updates').insert({
      client_id: clientId,
      week_number: nextWeekNumber,
      status_color: status,
      achievements,
      challenges: challenges || null,
      next_week_plan: nextPlan,
      summary: summary || null,
      pressure_note: isPressure ? 'تم تفعيل نسخة الضغط' : null,
      submitted_at: new Date().toISOString(),
    })

    setLoading(false)
    if (insertErr) { setError('حدث خطأ في الإرسال'); return }

    // Reset
    setStatus(null); setIsPressure(false); setAchievements(''); setChallenges(''); setNextPlan(''); setSummary('')
    setOpen(false)
    onSubmitted()
  }

  if (!open) return (
    <button style={S.openBtn} onClick={() => setOpen(true)}>
      <span>＋</span> رفع تحديث الأسبوع {nextWeekNumber}
    </button>
  )

  return (
    <div style={S.formWrap}>
      <div style={S.formTitle}>
        تحديث الأسبوع <span style={{ color: '#C9A84C' }}>{nextWeekNumber}</span>
      </div>

      {/* Status picker */}
      <div style={S.sectionLabel}>كيف حال أسبوعك؟</div>
      <div style={S.statusPicker}>
        {STATUS_OPTIONS.map(opt => {
          const isSelected = status === opt.value
          const colors = STATUS_COLOR[opt.value]
          return (
            <div key={opt.value} onClick={() => setStatus(opt.value)}
              style={{ ...S.statusOpt, ...(isSelected ? { background: colors.bg, borderColor: colors.border } : {}) }}>
              <div style={S.optIcon}>{opt.icon}</div>
              <div style={{ ...S.optLabel, ...(isSelected ? { color: colors.text } : {}) }}>{opt.label}</div>
              <div style={S.optDesc}>{opt.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Pressure mode */}
      <div style={{ ...S.pressureToggle, ...(isPressure ? S.pressureActive : {}) }} onClick={() => setIsPressure(p => !p)}>
        <span style={S.pressureIcon}>⚡</span>
        <div style={{ flex: 1 }}>
          <div style={S.pressureTitle}>نسخة الضغط</div>
          <div style={S.pressureSub}>فعّلها إذا كان الأسبوع استثنائياً في صعوبته</div>
        </div>
        <div style={{ ...S.toggleSwitch, ...(isPressure ? S.toggleOn : {}) }}>
          <div style={{ ...S.toggleThumb, ...(isPressure ? S.thumbOn : {}) }} />
        </div>
      </div>

      {/* Fields */}
      <div style={S.field}>
        <label style={S.label}>ما الذي أنجزته هذا الأسبوع؟ <span style={S.req}>*</span></label>
        <textarea value={achievements} onChange={e => setAchievements(e.target.value)} maxLength={500}
          placeholder="حتى لو كان صغيراً... كل خطوة تُحتسب" style={S.textarea} />
      </div>
      <div style={S.field}>
        <label style={S.label}>ما التحدي الذي واجهته؟ <span style={S.opt}>(اختياري)</span></label>
        <textarea value={challenges} onChange={e => setChallenges(e.target.value)} maxLength={500}
          placeholder="كن صريحاً... الصراحة أساس التقدم" style={S.textarea} />
      </div>
      <div style={S.field}>
        <label style={S.label}>ما التزامك للأسبوع القادم؟ <span style={S.req}>*</span></label>
        <textarea value={nextPlan} onChange={e => setNextPlan(e.target.value)} maxLength={300}
          placeholder="التزام واحد محدد وقابل للقياس..." style={S.textarea} />
      </div>

      {error && <div style={S.errBox}>{error}</div>}

      <div style={S.btnRow}>
        <button onClick={() => setOpen(false)} style={S.cancelBtn}>إلغاء</button>
        <button onClick={submit} disabled={loading} style={S.submitBtn}>
          {loading ? 'جارٍ الإرسال...' : 'إرسال التحديث'}
        </button>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  openBtn: { width: '100%', background: 'rgba(201,168,76,0.08)', border: '1px dashed rgba(201,168,76,0.35)', color: '#C9A84C', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.2s' },
  formWrap: { background: '#111', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 14, padding: 24, marginTop: 14 },
  formTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: 'rgba(237,232,220,0.5)', marginBottom: 12, letterSpacing: 0.5 },
  statusPicker: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 },
  statusOpt: { background: '#1A1A1A', border: '2px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  optIcon: { fontSize: 22, marginBottom: 6 },
  optLabel: { fontSize: 14, fontWeight: 700, color: 'rgba(237,232,220,0.6)', marginBottom: 2 },
  optDesc: { fontSize: 11, color: 'rgba(237,232,220,0.35)' },
  pressureToggle: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, marginBottom: 18, cursor: 'pointer', transition: 'all 0.2s' },
  pressureActive: { background: 'rgba(224,85,85,0.08)', borderColor: 'rgba(224,85,85,0.25)' },
  pressureIcon: { fontSize: 18 },
  pressureTitle: { fontSize: 14, fontWeight: 600 },
  pressureSub: { fontSize: 11, color: 'rgba(237,232,220,0.4)', marginTop: 2 },
  toggleSwitch: { width: 40, height: 22, background: '#202020', borderRadius: 11, position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleOn: { background: '#E05555' },
  toggleThumb: { position: 'absolute', width: 16, height: 16, background: 'rgba(237,232,220,0.4)', borderRadius: '50%', top: 3, right: 3, transition: 'all 0.2s' },
  thumbOn: { background: '#fff', right: 'auto', left: 3 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: 'rgba(237,232,220,0.45)', marginBottom: 8, fontWeight: 600, letterSpacing: 0.3 },
  req: { color: '#C9A84C' },
  opt: { color: 'rgba(237,232,220,0.25)', fontWeight: 400 },
  textarea: { width: '100%', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: '12px 14px', color: '#EDE8DC', fontSize: 14, resize: 'vertical', minHeight: 82, outline: 'none', fontFamily: 'inherit', direction: 'rtl', lineHeight: 1.6 },
  errBox: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: 8, padding: '10px 14px', color: '#E05555', fontSize: 13, marginBottom: 14 },
  btnRow: { display: 'flex', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(237,232,220,0.45)', padding: 12, borderRadius: 9, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  submitBtn: { flex: 2, background: '#C9A84C', color: '#000', border: 'none', borderRadius: 9, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
}
