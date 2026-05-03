import { AdminSettingsClient } from '@/features/admin/components/AdminSettingsClient'
import { createClient } from '@/lib/supabase/server'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('is_active', true)
    .order('category')

  return <AdminSettingsClient initialSettings={settings ?? []} />
}
