'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Screen = 'hero' | 'path' | 'form' | 'success'
type PathType = 'executive' | 'personal'
type FormStep = 1 | 2 | 3

interface FormData {
  full_name: string
  phone: string
  email: string
  current_situation: string
  desired_outcome: string
  biggest_obstacle: string
  previous_coaching: string
  commitment_level: string
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#080808', color: '#EDE8DC', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', top: -200, right: -200, filter: 'blur(80px)', pointerEvents: 'none' },
  orb2: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,158,138,0.06) 0%, transparent 70%)', bottom: -100, left: -100, filter: 'blur(80px)', pointerEvents: 'none' },
  grid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' },
  inner: { position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '60px 24px' },
  eyebrow: { fontSize: 12, letterSpacing: 4, color: '#C9A84C', fontWeight: 500, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 },
  h1: { fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 600, lineHeight: 1.15, marginBottom: 10 },
  em: { fontStyle: 'italic', color: '#C9A84C' },
  sub: { fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(237,232,220,0.7)', lineHeight: 1.8, marginBottom: 48, fontWeight: 300 },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 12, background: '#C9A84C', color: '#000', border: 'none', borderRadius: 100, padding: '18px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' },
  statsRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: 56, paddingTop: 40, borderTop: '1px solid rgba(201,168,76,0.18)', flexWrap: 'wrap' },
  statVal: { fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 600, color: '#C9A84C', lineHeight: 1 },
  statLbl: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 4 },
  div: { width: 1, height: 40, background: 'rgba(201,168,76,0.18)' },
  // Path screen
  pathWrap: { width: '100%', maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  pathCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  pathCard: { background: '#111', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 20, padding: '36px 32px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'right' },
  pathIcon: { fontSize: 36, marginBottom: 18, display: 'block' },
  pathTitle: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  pathDesc: { fontSize: 14, color: 'rgba(237,232,220,0.7)', lineHeight: 1.7, marginBottom: 20 },
  pathTags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 },
  pathTag: { padding: '4px 12px', borderRadius: 20, fontSize: 12 },
  pathCta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 },
  // Form
  formWrap: { width: '100%', maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' },
  progressRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 8 },
  stepDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, border: '2px solid rgba(201,168,76,0.2)', background: '#1A1A1A', color: 'rgba(237,232,220,0.45)', transition: 'all 0.3s' },
  stepLine: { width: 60, height: 2, background: 'rgba(201,168,76,0.2)', transition: 'background 0.3s' },
  formCard: { background: '#111', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 20, padding: '36px', position: 'relative', overflow: 'hidden' },
  fTitle: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
  fSub: { fontSize: 13, color: 'rgba(237,232,220,0.45)', marginBottom: 28, lineHeight: 1.6 },
  fRow: { marginBottom: 16 },
  fLabel: { display: 'block', fontSize: 12, color: 'rgba(237,232,220,0.45)', marginBottom: 8, fontWeight: 600 },
  fInput: { width: '100%', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '13px 15px', color: '#EDE8DC', fontSize: 14, outline: 'none' },
  fTextarea: { width: '100%', background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: '13px 15px', color: '#EDE8DC', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 90, lineHeight: 1.6 },
  statusPicker: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  ynOpt: { background: '#1A1A1A', border: '2px solid rgba(201,168,76,0.18)', borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'rgba(237,232,220,0.5)', transition: 'all 0.2s' },
  commitOpts: { display: 'flex', flexDirection: 'column', gap: 10 },
  commitOpt: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#1A1A1A', border: '2px solid rgba(201,168,76,0.18)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' },
  commitRadio: { width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.3)', flexShrink: 0, transition: 'all 0.2s' },
  commitLabel: { fontSize: 14, fontWeight: 600 },
  commitDesc: { fontSize: 12, color: 'rgba(237,232,220,0.4)', marginTop: 2 },
  navRow: { display: 'flex', gap: 12, marginTop: 28 },
  nextBtn: { flex: 1, background: '#C9A84C', color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  prevBtn: { width: 48, background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.18)', color: 'rgba(237,232,220,0.5)', borderRadius: 10, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  screenHeader: { textAlign: 'center', marginBottom: 48 },
  screenTitle: { fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 600, marginBottom: 12 },
  screenSub: { fontSize: 15, color: 'rgba(237,232,220,0.45)' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(201,168,76,0.18)', color: 'rgba(237,232,220,0.5)', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: 32, transition: 'all 0.2s' },
  // Success
  successWrap: { maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '40px 24px', position: 'relative', zIndex: 10 },
  pulseRing: { width: 120, height: 120, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 48 },
  successTitle: { fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 600, color: '#C9A84C', marginBottom: 12 },
  successSub: { fontSize: 15, color: 'rgba(237,232,220,0.7)', lineHeight: 1.8, marginBottom: 32 },
  msgList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36, textAlign: 'right' },
  msgItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, fontSize: 13, color: 'rgba(237,232,220,0.6)' },
  enterBtn: { width: '100%', background: '#C9A84C', color: '#000', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
}

export default function LandingPage() {
  const [screen, setScreen] = useState<Screen>('hero')
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null)
  const [step, setStep] = useState<FormStep>(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    full_name: '', phone: '', email: '',
    current_situation: '', desired_outcome: '', biggest_obstacle: '',
    previous_coaching: '', commitment_level: '',
  })

  function update(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function selectPath(p: PathType) {
    setSelectedPath(p)
    setScreen('form')
    setStep(1)
  }

  async function submit() {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('leads').insert({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        source: 'website',
        discovery_answers: {
          path: selectedPath,
          current_situation: formData.current_situation,
          desired_outcome: formData.desired_outcome,
          biggest_obstacle: formData.biggest_obstacle,
          previous_coaching: formData.previous_coaching,
          commitment_level: formData.commitment_level,
        },
        status: 'new',
      })
      setScreen('success')
    } finally {
      setLoading(false)
    }
  }

  function StepDot({ n }: { n: number }) {
    const isActive = step === n, isDone = step > n
    return (
      <div style={{
        ...S.stepDot,
        ...(isActive ? { background: '#C9A84C', borderColor: '#C9A84C', color: '#000', boxShadow: '0 0 16px rgba(201,168,76,0.4)' } : {}),
        ...(isDone ? { background: 'rgba(76,175,125,0.2)', borderColor: '#4CAF7D', color: '#4CAF7D' } : {}),
      }}>
        {isDone ? '✓' : n}
      </div>
    )
  }

  if (screen === 'hero') return (
    <div style={S.page}>
      <div style={S.orb1} /><div style={S.orb2} /><div style={S.grid} />
      <div style={S.inner}>
        <div style={S.eyebrow}>
          <span style={{ display: 'inline-block', width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
          عيسى للتدريب
          <span style={{ display: 'inline-block', width: 40, height: 1, background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
        </div>
        <h1 style={S.h1}>رحلتك إلى<br /><em style={S.em}>أفضل نسخة منك</em></h1>
        <p style={S.sub}>منهجية مُثبتة. موجّه متخصص. نتائج قابلة للقياس.<br />اثنا عشر شهراً تُغيّر مسارك — للأبد.</p>
        <button style={S.ctaBtn} onClick={() => setScreen('path')}>
          <span>←</span> ابدأ رحلتك الآن
        </button>
        <div style={S.statsRow}>
          {[['500+','ساعة تدريب'],['25','سنة خبرة'],['12','مرحلة تحول']].map(([v, l], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              {i > 0 && <div style={S.div} />}
              <div style={{ textAlign: 'center' }}>
                <div style={S.statVal}>{v}</div>
                <div style={S.statLbl}>{l}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <Link href="/login" style={{ fontSize: 13, color: 'rgba(237,232,220,0.35)', borderBottom: '1px solid rgba(201,168,76,0.2)', paddingBottom: 2 }}>
            تسجيل دخول الأعضاء
          </Link>
        </div>
      </div>
    </div>
  )

  if (screen === 'path') return (
    <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      <div style={S.orb1} /><div style={S.grid} />
      <div style={S.pathWrap}>
        <div style={S.screenHeader}>
          <button style={S.backBtn} onClick={() => setScreen('hero')}>→ رجوع</button>
          <h2 style={S.screenTitle}>ما الذي يصفك أكثر؟</h2>
          <p style={S.screenSub}>اختر المسار الأقرب لواقعك — سنصمم رحلتك على أساسه</p>
        </div>
        <div style={S.pathCards}>
          {/* Executive */}
          <div style={S.pathCard} onClick={() => selectPath('executive')}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.transform = 'translateY(-6px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.transform = 'none' }}>
            <span style={S.pathIcon}>🏢</span>
            <h3 style={{ ...S.pathTitle, color: '#C9A84C' }}>القيادي والتنفيذي</h3>
            <p style={S.pathDesc}>أنت في موقع قيادي وتريد الارتقاء بأدائك، اتخاذ قرارات أكثر وضوحاً، وبناء تأثير يدوم.</p>
            <div style={S.pathTags}>
              {['القرارات الكبرى','بناء الفريق','الإرث القيادي','التوازن'].map(t => (
                <span key={t} style={{ ...S.pathTag, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>{t}</span>
              ))}
            </div>
            <div style={{ ...S.pathCta, color: '#C9A84C' }}><span>هذا مساري</span><span>←</span></div>
          </div>
          {/* Personal */}
          <div style={{ ...S.pathCard }} onClick={() => selectPath('personal')}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#7A9E8A', e.currentTarget.style.transform = 'translateY(-6px)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)', e.currentTarget.style.transform = 'none')}>
            <span style={S.pathIcon}>🌿</span>
            <h3 style={{ ...S.pathTitle, color: '#7A9E8A' }}>التغيير الشخصي والمهني</h3>
            <p style={S.pathDesc}>تشعر بالتوقف أو الضياع وتريد استعادة زمام حياتك، كسر الروتين المُقيّد، والتقدم الذي طال انتظاره.</p>
            <div style={S.pathTags}>
              {['استعادة الزخم','كسر الركود','الوضوح','الثبات'].map(t => (
                <span key={t} style={{ ...S.pathTag, background: 'rgba(122,158,138,0.1)', color: '#7A9E8A', border: '1px solid rgba(122,158,138,0.2)' }}>{t}</span>
              ))}
            </div>
            <div style={{ ...S.pathCta, color: '#7A9E8A' }}><span>هذا مساري</span><span>←</span></div>
          </div>
        </div>
      </div>
    </div>
  )

  if (screen === 'form') return (
    <div style={{ ...S.page, display: 'flex', justifyContent: 'center' }}>
      <div style={S.formWrap}>
        {/* Progress */}
        <div style={{ marginBottom: 36 }}>
          <div style={S.progressRow}>
            <StepDot n={1} />
            <div style={{ ...S.stepLine, ...(step > 1 ? { background: '#4CAF7D' } : {}) }} />
            <StepDot n={2} />
            <div style={{ ...S.stepLine, ...(step > 2 ? { background: '#4CAF7D' } : {}) }} />
            <StepDot n={3} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(237,232,220,0.4)', marginTop: 8 }}>
            {step === 1 && 'الخطوة 1 من 3 — بياناتك الأساسية'}
            {step === 2 && 'الخطوة 2 من 3 — وضعك الحالي'}
            {step === 3 && 'الخطوة 3 من 3 — مدى استعدادك'}
          </div>
        </div>

        <div style={S.formCard}>
          <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', opacity: 0.6 }} />

          {step === 1 && <>
            <div style={S.fTitle}>أولاً — تعرّف علينا</div>
            <div style={S.fSub}>هذه المعلومات تساعد موجّهك على التحضير لك قبل الجلسة الأولى.</div>
            <div style={S.grid2}>
              <div style={S.fRow}>
                <label style={S.fLabel}>الاسم الكامل *</label>
                <input style={S.fInput} value={formData.full_name} onChange={e => update('full_name', e.target.value)} placeholder="اسمك الكامل" />
              </div>
              <div style={S.fRow}>
                <label style={S.fLabel}>رقم الجوال *</label>
                <input style={S.fInput} value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="+966XXXXXXXXX" dir="ltr" />
              </div>
            </div>
            <div style={S.fRow}>
              <label style={S.fLabel}>البريد الإلكتروني</label>
              <input style={{ ...S.fInput, direction: 'ltr' }} value={formData.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" type="email" />
            </div>
          </>}

          {step === 2 && <>
            <div style={S.fTitle}>ثانياً — وضعك الحالي</div>
            <div style={S.fSub}>كلما كنت صريحاً أكثر، كلما كانت رحلتك أعمق وأكثر نفعاً.</div>
            <div style={S.fRow}>
              <label style={S.fLabel}>صِف وضعك الحالي في جملة أو اثنتين *</label>
              <textarea style={S.fTextarea} value={formData.current_situation} onChange={e => update('current_situation', e.target.value)} placeholder="ما الذي يجري في حياتك أو مسيرتك الآن؟" />
            </div>
            <div style={S.fRow}>
              <label style={S.fLabel}>ما الذي تريد تحقيقه في نهاية هذه الرحلة؟ *</label>
              <textarea style={S.fTextarea} value={formData.desired_outcome} onChange={e => update('desired_outcome', e.target.value)} placeholder="الهدف الذي لو تحقق سيغيّر كل شيء..." />
            </div>
            <div style={S.fRow}>
              <label style={S.fLabel}>ما أكبر عائق يمنعك؟ <span style={{ color: 'rgba(237,232,220,0.25)', fontWeight: 400 }}>(اختياري)</span></label>
              <textarea style={S.fTextarea} value={formData.biggest_obstacle} onChange={e => update('biggest_obstacle', e.target.value)} placeholder="كن صريحاً — لا يوجد إجابة خاطئة" />
            </div>
          </>}

          {step === 3 && <>
            <div style={S.fTitle}>ثالثاً — مدى استعدادك</div>
            <div style={S.fSub}>هذه الأسئلة تساعدنا في تصميم رحلة تناسب واقعك تماماً.</div>
            <div style={S.fRow}>
              <label style={S.fLabel}>هل خضت تجربة تدريب شخصي من قبل؟</label>
              <div style={S.statusPicker}>
                {[['نعم','نعم'],['لا','لا، هذه أولى تجاربي']].map(([val, lbl]) => (
                  <div key={val} onClick={() => update('previous_coaching', val)}
                    style={{ ...S.ynOpt, ...(formData.previous_coaching === val ? { borderColor: '#C9A84C', color: '#C9A84C', background: 'rgba(201,168,76,0.1)' } : {}) }}>
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
            <div style={S.fRow}>
              <label style={S.fLabel}>ما مستوى التزامك بهذه الرحلة؟</label>
              <div style={S.commitOpts}>
                {[
                  { val: 'عالٍ جداً', lbl: 'عالٍ جداً 🔥', desc: 'مستعد للتغيير الجذري والاستثمار الكامل' },
                  { val: 'عالٍ', lbl: 'عالٍ ✦', desc: 'جاد في التغيير مع بعض القيود العملية' },
                  { val: 'متوسط', lbl: 'أريد الاستكشاف أولاً', desc: 'أحتاج لمعرفة المزيد قبل أي التزام' },
                ].map(({ val, lbl, desc }) => (
                  <div key={val} onClick={() => update('commitment_level', val)}
                    style={{ ...S.commitOpt, ...(formData.commitment_level === val ? { borderColor: '#C9A84C', background: 'rgba(201,168,76,0.08)' } : {}) }}>
                    <div style={{ ...S.commitRadio, ...(formData.commitment_level === val ? { background: '#C9A84C', borderColor: '#C9A84C' } : {}) }}>
                      {formData.commitment_level === val && <span style={{ fontSize: 10, color: '#000', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div>
                      <div style={S.commitLabel}>{lbl}</div>
                      <div style={S.commitDesc}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>}

          <div style={S.navRow}>
            {step > 1 && <button style={S.prevBtn} onClick={() => setStep((step - 1) as FormStep)}>→</button>}
            {step < 3
              ? <button style={S.nextBtn} onClick={() => {
                if (step === 1 && !formData.full_name.trim()) return alert('يرجى إدخال الاسم')
                if (step === 2 && (!formData.current_situation.trim() || !formData.desired_outcome.trim())) return alert('يرجى الإجابة على السؤالين المطلوبين')
                setStep((step + 1) as FormStep)
              }}>التالي ←</button>
              : <button style={S.nextBtn} disabled={loading} onClick={submit}>
                {loading ? 'جارٍ الإرسال...' : 'إرسال ملف الاستكشاف ✦'}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  )

  // Success
  return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={S.orb1} /><div style={S.grid} />
      <div style={S.successWrap}>
        <div style={S.pulseRing}>🧭</div>
        <h2 style={S.successTitle}>وصل ملفك</h2>
        <p style={S.successSub}>نحن نراجع ملف الاستكشاف الخاص بك.<br />ستتلقى تواصلاً خلال 24 ساعة.</p>
        <div style={S.msgList}>
          {['✅ تم استلام ملف الاستكشاف بنجاح', '🔍 جارٍ مراجعة طلبك من قِبل الموجّه', '📅 سيتم التواصل لتحديد جلسة الاستكشاف'].map((msg, i) => (
            <div key={i} style={S.msgItem}>{msg}</div>
          ))}
        </div>
        <Link href="/login">
          <button style={S.enterBtn}>دخول بوابة العملاء ←</button>
        </Link>
      </div>
    </div>
  )
}
