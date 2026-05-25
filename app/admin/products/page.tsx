import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import type { ProfileRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

type PriceRow = {
  id: string
  currency: string | null
  amount: number | string | null
  billing_interval: string | null
  label: string | null
  is_active: boolean | null
}

type SessionTemplateRow = {
  id: string
  sequence_number: number | null
  title: string | null
  format: string | null
  is_billable: boolean | null
}

type ProductRow = {
  id: string
  name: string
  name_en: string | null
  description: string | null
  description_en: string | null
  type: string | null
  session_count: number | null
  is_active: boolean | null
  sort_order: number | null
  created_at: string | null
  prices?: PriceRow[]
  session_templates?: SessionTemplateRow[]
}

const TYPE_LABELS: Record<string, string> = {
  program: 'برنامج',
  session_individual: 'جلسة فردية',
  session_group: 'جلسة جماعية',
  package: 'باقة',
}

const INTERVAL_LABELS: Record<string, string> = {
  one_time: 'مرة واحدة',
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
  annually: 'سنوي',
}

function formatPrice(price: PriceRow) {
  const amount = price.amount == null ? '—' : Number(price.amount).toLocaleString('ar-SA')
  const currency = price.currency ?? 'SAR'
  const interval = price.billing_interval ? ` / ${INTERVAL_LABELS[price.billing_interval] ?? price.billing_interval}` : ''
  return `${amount} ${currency}${interval}`
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const profile = profileData as ProfileRow | null

  const { data: productsData } = await supabase
    .from('products')
    .select('*, prices(id,currency,amount,billing_interval,label,is_active), session_templates(id,sequence_number,title,format,is_billable)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const products = (productsData ?? []) as ProductRow[]
  const activeCount = products.filter(p => p.is_active !== false).length
  const inactiveCount = products.length - activeCount
  const totalTemplates = products.reduce((sum, p) => sum + (p.session_templates?.length ?? 0), 0)
  const totalPrices = products.reduce((sum, p) => sum + (p.prices?.length ?? 0), 0)

  return (
    <div>
      <Header title="البرامج والباقات" profile={profile!} subtitle="إدارة عروض التدريب والبرامج المرتبطة بالمنصة" />
      <div style={{ padding: 28 }}>
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={{ ...S.statNum, color: '#C9A84C' }}>{products.length}</div>
            <div style={S.statLabel}>إجمالي البرامج</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statNum, color: '#4CAF7D' }}>{activeCount}</div>
            <div style={S.statLabel}>مفعّل</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statNum, color: '#E05555' }}>{inactiveCount}</div>
            <div style={S.statLabel}>غير مفعّل</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statNum, color: '#5B8DEF' }}>{totalTemplates}</div>
            <div style={S.statLabel}>قوالب الجلسات</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statNum, color: '#F0C040' }}>{totalPrices}</div>
            <div style={S.statLabel}>خيارات التسعير</div>
          </div>
        </div>

        <div style={S.notice}>
          <div style={S.noticeTitle}>مرحلة الإدارة الحالية</div>
          <div style={S.noticeText}>
            هذه الصفحة تعرض البرامج والباقات الموجودة في قاعدة البيانات. إجراءات الإنشاء والتعديل والتسعير ستضاف في المرحلة التالية من لوحة الإدارة.
          </div>
        </div>

        <div style={S.grid}>
          {products.map(product => {
            const prices = product.prices ?? []
            const templates = product.session_templates ?? []
            const primaryPrice = prices.find(p => p.is_active !== false) ?? prices[0]

            return (
              <div key={product.id} style={S.card}>
                <div style={S.topLine} />
                <div style={S.cardHeader}>
                  <div>
                    <div style={S.productType}>{TYPE_LABELS[product.type ?? ''] ?? product.type ?? 'غير مصنف'}</div>
                    <div style={S.productName}>{product.name}</div>
                    {product.name_en && <div style={S.productNameEn}>{product.name_en}</div>}
                  </div>
                  <span style={{ ...S.statusBadge, ...(product.is_active === false ? S.statusInactive : S.statusActive) }}>
                    {product.is_active === false ? 'غير مفعّل' : 'مفعّل'}
                  </span>
                </div>

                {product.description && <div style={S.description}>{product.description}</div>}

                <div style={S.metaGrid}>
                  <div style={S.metaBox}>
                    <div style={S.metaLabel}>عدد الجلسات</div>
                    <div style={S.metaValue}>{product.session_count ?? templates.length ?? '—'}</div>
                  </div>
                  <div style={S.metaBox}>
                    <div style={S.metaLabel}>الترتيب</div>
                    <div style={S.metaValue}>{product.sort_order ?? 0}</div>
                  </div>
                  <div style={S.metaBox}>
                    <div style={S.metaLabel}>التسعير</div>
                    <div style={S.metaValue}>{primaryPrice ? formatPrice(primaryPrice) : 'غير محدد'}</div>
                  </div>
                </div>

                <div style={S.sectionTitle}>قوالب الجلسات</div>
                {templates.length === 0 ? (
                  <div style={S.empty}>لا توجد قوالب جلسات مرتبطة</div>
                ) : (
                  <div style={S.templateList}>
                    {templates
                      .sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0))
                      .slice(0, 5)
                      .map(template => (
                        <div key={template.id} style={S.templateRow}>
                          <span style={S.templateSeq}>{template.sequence_number ?? '—'}</span>
                          <span style={S.templateTitle}>{template.title}</span>
                          {template.format && <span style={S.templateFormat}>{template.format}</span>}
                        </div>
                      ))}
                    {templates.length > 5 && <div style={S.more}>+ {templates.length - 5} قوالب إضافية</div>}
                  </div>
                )}

                <div style={S.actionsRow}>
                  <button type="button" style={S.secondaryBtn} disabled>تعديل</button>
                  <button type="button" style={S.secondaryBtn} disabled>إدارة السعر</button>
                  <button type="button" style={S.secondaryBtn} disabled>القوالب</button>
                </div>
              </div>
            )
          })}
        </div>

        {products.length === 0 && <div style={S.pageEmpty}>لا توجد برامج أو باقات بعد</div>}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 },
  statCard: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '16px 18px', textAlign: 'center' },
  statNum: { fontSize: 28, fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'rgba(237,232,220,0.45)', marginTop: 6 },
  notice: { background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.16)', borderRadius: 12, padding: '14px 18px', marginBottom: 18 },
  noticeTitle: { fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 4 },
  noticeText: { fontSize: 12, color: 'rgba(237,232,220,0.55)', lineHeight: 1.7 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 },
  card: { background: '#111', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' },
  topLine: { position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  productType: { fontSize: 11, color: '#C9A84C', marginBottom: 5, fontWeight: 700 },
  productName: { fontSize: 17, fontWeight: 800, color: '#EDE8DC', lineHeight: 1.4 },
  productNameEn: { fontSize: 11, color: 'rgba(237,232,220,0.35)', marginTop: 3, direction: 'ltr', textAlign: 'right' },
  statusBadge: { fontSize: 11, border: '1px solid', borderRadius: 20, padding: '4px 10px', flexShrink: 0, fontWeight: 700 },
  statusActive: { color: '#4CAF7D', borderColor: 'rgba(76,175,125,0.35)', background: 'rgba(76,175,125,0.1)' },
  statusInactive: { color: 'rgba(237,232,220,0.35)', borderColor: 'rgba(237,232,220,0.15)', background: 'rgba(237,232,220,0.04)' },
  description: { fontSize: 13, color: 'rgba(237,232,220,0.55)', lineHeight: 1.7, minHeight: 42, marginBottom: 14 },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 },
  metaBox: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.08)', borderRadius: 9, padding: '10px 12px' },
  metaLabel: { fontSize: 10, color: 'rgba(237,232,220,0.35)', marginBottom: 4 },
  metaValue: { fontSize: 12, color: '#EDE8DC', fontWeight: 700, lineHeight: 1.5 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'rgba(237,232,220,0.55)', marginBottom: 8 },
  templateList: { display: 'flex', flexDirection: 'column', gap: 6, minHeight: 120 },
  templateRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.06)', borderRadius: 8, padding: '7px 9px' },
  templateSeq: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  templateTitle: { flex: 1, fontSize: 12, color: 'rgba(237,232,220,0.65)' },
  templateFormat: { fontSize: 10, color: 'rgba(237,232,220,0.35)', direction: 'ltr' },
  more: { fontSize: 11, color: '#C9A84C', padding: '6px 2px' },
  empty: { background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.06)', borderRadius: 8, padding: 14, color: 'rgba(237,232,220,0.28)', fontSize: 12, textAlign: 'center', minHeight: 80 },
  actionsRow: { display: 'flex', gap: 8, marginTop: 16 },
  secondaryBtn: { flex: 1, background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.12)', color: 'rgba(237,232,220,0.35)', borderRadius: 8, padding: '9px 10px', fontSize: 12, cursor: 'not-allowed' },
  pageEmpty: { textAlign: 'center', padding: '40px', color: 'rgba(237,232,220,0.25)', fontSize: 13 },
}
