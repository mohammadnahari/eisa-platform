import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-primary)', fontFamily: 'var(--font-arabic)' }}>
      {/* Hero */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          عيسى <span style={{ color: 'var(--color-accent)' }}>للتدريب</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-xl)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 3rem', lineHeight: 1.8 }}>
          منصة التوجيه الاحترافي المبنية على منهجية خارطة التغيير — رحلة 12 مرحلة نحو الازدهار الحقيقي
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login"
            style={{ padding: '0.875rem 2.5rem', background: 'var(--color-accent)', color: 'var(--color-primary)', borderRadius: 'var(--radius-btn)', textDecoration: 'none', fontWeight: 800, fontSize: 'var(--font-size-lg)', display: 'inline-block' }}>
            تسجيل الدخول
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { title: 'خارطة التغيير', desc: '12 مرحلة منهجية تأخذك من الأهداف حتى التثبيت', icon: '🗺️' },
            { title: 'نظام المتابعة', desc: 'تحديثات أسبوعية بنظام الألوان الثلاثة مع ردود الموجّه الفورية', icon: '📊' },
            { title: 'بوصلة القرار', desc: 'تمييز دقيق بين احتياجات التطوير والتشافي', icon: '🧭' },
          ].map(f => (
            <div key={f.title} style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: 'var(--font-size-lg)', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: 'var(--font-size-sm)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontSize: 'var(--font-size-sm)' }}>
        © {new Date().getFullYear()} عيسى للتدريب — coach.eisaprod.com
      </div>
    </main>
  )
}
