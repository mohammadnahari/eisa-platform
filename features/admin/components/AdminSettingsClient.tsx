'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

type Setting = Database['public']['Tables']['platform_settings']['Row']

const CATEGORY_LABELS: Record<string, string> = {
  platform: 'المنصة',
  email: 'البريد الإلكتروني',
  payments: 'المدفوعات',
  google_oauth: 'Google OAuth',
  microsoft_oauth: 'Microsoft OAuth',
  sms: 'الرسائل النصية',
  security: 'الأمان',
  notifications: 'الإشعارات',
  transfers: 'نقل العملاء',
  dashboards: 'لوحات التحكم',
}

export function AdminSettingsClient({ initialSettings }: { initialSettings: Setting[] }) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings)
  const [activeCategory, setActiveCategory] = useState('platform')
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const supabase = createClient()

  const categories = [...new Set(settings.map(s => s.category))]
  const categorized = settings.filter(s => s.category === activeCategory)

  async function saveSetting(setting: Setting, newValue: string) {
    setSaving(setting.key)
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: newValue, updated_at: new Date().toISOString() })
      .eq('id', setting.id)

    if (!error) {
      setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: newValue } : s))
      setSaved(setting.key)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  function renderInput(setting: Setting) {
    const current = setting.value ?? ''
    const isSaving = saving === setting.key
    const isSaved = saved === setting.key

    if (setting.is_sensitive) {
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="password"
            placeholder={current ? '••••••••••••' : 'غير محدد'}
            onBlur={e => { if (e.target.value) saveSetting(setting, e.target.value) }}
            disabled={isSaving}
            style={{ flex: 1 }}
          />
          {current && <span style={{ color: 'var(--color-status-green)', fontSize: 'var(--font-size-xs)' }}>✓ محدّد</span>}
        </div>
      )
    }

    if (setting.input_type === 'boolean') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => saveSetting(setting, current === 'true' ? 'false' : 'true')}
            style={{
              width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: current === 'true' ? 'var(--color-status-green)' : 'var(--color-border)',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              right: current === 'true' ? 24 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'right 0.2s', display: 'block',
            }} />
          </button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {current === 'true' ? 'مفعّل' : 'معطّل'}
          </span>
        </div>
      )
    }

    if (setting.input_type === 'color') {
      return (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="color"
            defaultValue={current || '#000000'}
            onChange={e => saveSetting(setting, e.target.value)}
            style={{ width: 48, height: 36, padding: 2, border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer' }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {current}
          </span>
        </div>
      )
    }

    if (setting.input_type === 'textarea') {
      return (
        <div>
          <textarea
            defaultValue={current}
            rows={3}
            onBlur={e => saveSetting(setting, e.target.value)}
            disabled={isSaving}
            style={{ resize: 'vertical' }}
          />
          {isSaved && <span style={{ color: 'var(--color-status-green)', fontSize: 'var(--font-size-xs)' }}>✓ تم الحفظ</span>}
        </div>
      )
    }

    return (
      <div>
        <input
          type={setting.input_type === 'password' ? 'password' : setting.input_type === 'number' ? 'number' : setting.input_type === 'email' ? 'email' : setting.input_type === 'url' ? 'url' : 'text'}
          defaultValue={current}
          onBlur={e => { if (e.target.value !== current) saveSetting(setting, e.target.value) }}
          disabled={isSaving}
          placeholder={setting.placeholder ?? ''}
        />
        {isSaved && <span style={{ color: 'var(--color-status-green)', fontSize: 'var(--font-size-xs)', marginTop: '0.25rem', display: 'block' }}>✓ تم الحفظ</span>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
          إعدادات المنصة
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          جميع إعدادات المنصة تُحفظ تلقائياً عند التغيير
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Category tabs */}
        <div style={{
          width: 200, flexShrink: 0,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          padding: '0.75rem',
          height: 'fit-content',
          position: 'sticky', top: '1rem',
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'block', width: '100%', textAlign: 'right',
                padding: '0.625rem 0.875rem', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                background: activeCategory === cat ? 'rgba(26,26,46,0.08)' : 'transparent',
                color: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-arabic)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeCategory === cat ? 700 : 400,
                marginBottom: '0.125rem',
              }}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Settings form */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                {CATEGORY_LABELS[activeCategory] ?? activeCategory}
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {categorized.map(setting => (
                <div key={setting.key} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {setting.label}
                    </label>
                    {setting.description && (
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {setting.description}
                      </p>
                    )}
                    {setting.is_required && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-status-red)' }}>* مطلوب</span>
                    )}
                  </div>
                  <div>{renderInput(setting)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
