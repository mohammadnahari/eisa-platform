import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CoachReplyForm } from '@/features/coach-dashboard/components/CoachReplyForm'

const STAGE_NAMES: Record<number, string> = {0:'ما قبل الرحلة',1:'الأهداف',2:'التحديات',3:'القيم',4:'الروتين',5:'الواجبات',6:'التعمق',7:'الأنماط',8:'المعتقدات',9:'البوصلة',10:'الدمج',11:'التثبيت',12:'الاكتمال'}
const STATUS_BG: Record<string, string> = { green:'var(--color-status-green-bg)', yellow:'var(--color-status-yellow-bg)', red:'var(--color-status-red-bg)' }
const STATUS_COLOR: Record<string, string> = { green:'var(--color-status-green)', yellow:'var(--color-status-yellow)', red:'var(--color-status-red)' }
const STATUS_LABEL: Record<string, string> = { green:'أخضر', yellow:'أصفر', red:'أحمر' }

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Verify coach has access to this client
  const { data: assignment } = await supabase
    .from('client_coaches')
    .select('role')
    .eq('client_id', id)
    .eq('coach_id', user.id)
    .is('ended_at', null)
    .single()
  if (!assignment) notFound()

  const [
    { data: client },
    { data: updates },
    { data: goals },
    { data: sessions },
    { data: stageApprovals },
  ] = await Promise.all([
    supabase.from('clients').select('*, profiles(full_name, email, phone)').eq('id', id).single(),
    supabase.from('weekly_updates').select('*').eq('client_id', id).order('submitted_at', { ascending: false }).limit(20),
    supabase.from('goals').select('*').eq('client_id', id).order('priority'),
    supabase.from('sessions').select('*').or(`client_id.eq.${id},id.in.(select session_id from session_enrollments where client_id=${id})`).order('scheduled_at', { ascending: false }).limit(10),
    supabase.from('stage_approvals').select('*').eq('client_id', id).order('stage_number'),
  ])

  if (!client) notFound()
  const profile = client.profiles as Record<string, unknown>
  const stage = client.current_stage
  const card = { background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>
            {(profile?.full_name as string)?.[0] ?? '؟'}
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
              {profile?.full_name as string}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {profile?.email as string} • المرحلة {stage}: {STAGE_NAMES[stage]}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {stage < 12 && (
            <a href={`/coach/clients/${id}/stage`} style={{ padding: '0.625rem 1.25rem', background: 'var(--color-accent)', color: 'var(--color-primary)', borderRadius: 'var(--radius-btn)', textDecoration: 'none', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
              اعتماد المرحلة
            </a>
          )}
        </div>
      </div>

      {/* Color history */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          مسار التحديثات الأسبوعية
        </h2>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {updates?.map(u => (
            <div key={u.id} title={`أسبوع ${u.week_number}: ${STATUS_LABEL[u.status_color]}`}
              style={{ width: 32, height: 32, borderRadius: 6, background: STATUS_BG[u.status_color], border: `2px solid ${STATUS_COLOR[u.status_color]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: STATUS_COLOR[u.status_color] }}>
              {u.week_number}
            </div>
          ))}
          {!updates?.length && <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لا يوجد تحديثات بعد</p>}
        </div>
      </div>

      {/* Latest update requiring reply */}
      {updates?.[0] && !updates[0].coach_reply && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: 'var(--color-accent)', borderWidth: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
              التحديث الأسبوع {updates[0].week_number} — بانتظار ردك
            </h2>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 'var(--font-size-xs)', background: STATUS_BG[updates[0].status_color], color: STATUS_COLOR[updates[0].status_color] }}>
              {STATUS_LABEL[updates[0].status_color]}
            </span>
          </div>
          {updates[0].summary && <p style={{ marginBottom: '0.75rem', lineHeight: 1.7 }}>{updates[0].summary}</p>}
          {updates[0].pressure_note && (
            <div style={{ padding: '1rem', background: 'var(--color-status-red-bg)', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--color-status-red)' }}>
              <p style={{ fontWeight: 700, color: 'var(--color-status-red)', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)' }}>🔴 ملاحظة وضع الضغط</p>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.7 }}>{updates[0].pressure_note}</p>
            </div>
          )}
          <CoachReplyForm updateId={updates[0].id} clientId={id} />
        </div>
      )}

      {/* Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', marginBottom: '1rem' }}>الأهداف</h2>
          {!goals?.length ? <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لم يتم تحديد أهداف</p> :
            goals.map(g => (
              <div key={g.id} style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 8, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{g.title}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: g.status === 'achieved' ? 'var(--color-status-green)' : 'var(--color-muted)', fontWeight: g.status === 'achieved' ? 700 : 400 }}>
                  {g.status === 'achieved' ? '✓ مكتمل' : 'جارٍ'}
                </span>
              </div>
            ))
          }
        </div>

        <div style={card}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', marginBottom: '1rem' }}>اعتمادات المراحل</h2>
          {!stageApprovals?.length ? <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>لا توجد اعتمادات</p> :
            stageApprovals.map(sa => (
              <div key={sa.id} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '0.375rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: sa.status === 'approved' ? 'var(--color-status-green-bg)' : 'var(--color-bg)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>المرحلة {sa.stage_number}: {STAGE_NAMES[sa.stage_number]}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: sa.status === 'approved' ? 'var(--color-status-green)' : 'var(--color-muted)', fontWeight: 700 }}>
                  {sa.status === 'approved' ? '✓ معتمدة' : 'معلّقة'}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
