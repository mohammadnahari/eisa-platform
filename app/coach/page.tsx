import { createClient } from '@/lib/supabase/server'
import PriorityBoard from '@/components/coach/PriorityBoard'
import type { ProfileRow, ClientRow, WeeklyUpdateRow, LeadRow } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

interface ClientWithData extends ClientRow {
  profiles: ProfileRow | null
  latestUpdate: WeeklyUpdateRow | null
}

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get coach assignments
  const { data: assignments } = await supabase
    .from('client_coaches')
    .select('client_id')
    .eq('coach_id', user!.id)
    .is('ended_at', null)

  const clientIds = (assignments ?? []).map(a => a.client_id).filter(Boolean) as string[]

  // Get clients with profiles
  const clients: ClientWithData[] = []

  if (clientIds.length > 0) {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*, profiles!inner(*)')
      .in('id', clientIds)

    const rawClients = (clientsData ?? []) as unknown as (ClientRow & { profiles: ProfileRow })[]

    // Get latest weekly update for each client
    for (const c of rawClients) {
      const { data: updateData } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('client_id', c.id)
        .order('week_number', { ascending: false })
        .limit(1)
        .single()

      clients.push({
        ...c,
        latestUpdate: updateData ? updateData as WeeklyUpdateRow : null,
      })
    }
  }

  // Get leads assigned to this coach
  const { data: leadsData } = await supabase
    .from('leads')
    .select('*')
    .eq('assigned_to', user!.id)
    .order('created_at', { ascending: false })

  const leads = (leadsData ?? []) as LeadRow[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={S.topbar}>
        <div>
          <div style={S.topTitle}>متابعة العملاء</div>
          <div style={S.topSub}>{clients.length} عميل نشط</div>
        </div>
      </div>

      <PriorityBoard clients={clients} leads={leads} coachId={user!.id} />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  topbar: { height: 62, background: '#111', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', padding: '0 28px', position: 'sticky', top: 0, zIndex: 40 },
  topTitle: { fontSize: 18, fontWeight: 700, color: '#EDE8DC' },
  topSub: { fontSize: 12, color: 'rgba(237,232,220,0.4)', marginTop: 2 },
}
