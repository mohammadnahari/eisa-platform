// lib/types/database.types.ts
// Generated from live Supabase schema — project: rgejagiyxllrpdbpehxa
// IMPORTANT: Do NOT pass Database as generic to createBrowserClient/createServerClient
// Use explicit type assertions (as ProfileRow | null) at each query site.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'coach' | 'client'
export type PreferredLang = 'ar' | 'en'
export type ClientType = 'development' | 'healing' | 'both'
export type ClientStatus = 'active' | 'paused' | 'completed' | 'dropped'
export type WeeklyStatusColor = 'green' | 'yellow' | 'red'
export type SessionType = 'individual' | 'group'
export type SessionFormat = 'online' | 'written_review' | 'quarterly_review' | 'book' | 'assessment' | 'physical'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'
export type GoalStatus = 'active' | 'achieved' | 'paused' | 'dropped'
export type GoalAxis = 'professional' | 'personal' | 'health' | 'relationships' | 'financial' | 'spiritual'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'dropped'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'stripe' | 'bank_transfer' | 'manual'
export type ProductType = 'program' | 'session_individual' | 'session_group' | 'package'
export type BillingInterval = 'one_time' | 'monthly' | 'quarterly' | 'annually'
export type StageApprovalStatus = 'pending' | 'approved' | 'rejected'
export type CoachRole = 'primary' | 'specialist' | 'observer'
export type TransferStatus = 'pending' | 'approved_pending_handover' | 'completed' | 'rejected'
export type NotificationChannel = 'email' | 'in_app' | 'both'
export type NotificationCategory = 'onboarding' | 'session' | 'weekly_update' | 'stage' | 'transfer' | 'payment' | 'system' | 'custom'
export type QueueStatus = 'pending' | 'sent' | 'failed' | 'cancelled'
export type DiscountType = 'percentage' | 'fixed'
export type InputType = 'text' | 'password' | 'boolean' | 'select' | 'number' | 'color' | 'url' | 'email' | 'textarea'

export interface ProfileRow {
  id: string
  full_name: string
  full_name_en: string | null
  email: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  is_active: boolean | null
  preferred_lang: PreferredLang | null
  mfa_enabled: boolean | null
  dashboard_quota_override: number | null
  created_at: string | null
  updated_at: string | null
}

export interface ClientRow {
  id: string
  profile_id: string | null
  client_type: ClientType | null
  client_segment: string | null
  current_stage: number | null
  status: ClientStatus | null
  journey_start: string | null
  journey_end: string | null
  mission_statement: string | null
  lead_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface WeeklyUpdateRow {
  id: string
  client_id: string | null
  week_number: number
  status_color: WeeklyStatusColor
  summary: string | null
  achievements: string | null
  challenges: string | null
  next_week_plan: string | null
  pressure_note: string | null
  coach_reply: string | null
  coach_reply_at: string | null
  shared_on_transfer: boolean | null
  submitted_at: string | null
  created_at: string | null
}

export interface SessionRow {
  id: string
  coach_id: string | null
  client_id: string | null
  session_type: SessionType | null
  session_number: number | null
  title: string | null
  title_en: string | null
  description: string | null
  format: SessionFormat | null
  max_capacity: number | null
  scheduled_at: string | null
  meeting_link: string | null
  status: SessionStatus | null
  action_items: string | null
  coach_notes: string | null
  shared_on_transfer: boolean | null
  coach_notes_visible: boolean | null
  created_at: string | null
}

export interface GoalRow {
  id: string
  client_id: string | null
  coach_id: string | null
  title: string
  title_en: string | null
  description: string | null
  category: string | null
  axis: GoalAxis | null
  priority: number | null
  target_date: string | null
  baseline: string | null
  metrics: Json | null
  status: GoalStatus | null
  achieved_at: string | null
  created_at: string | null
}

export interface LeadRow {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  source: string | null
  discovery_answers: Json | null
  status: LeadStatus | null
  assigned_to: string | null
  notes: string | null
  converted_at: string | null
  client_id: string | null
  created_at: string | null
}

export interface OrderRow {
  id: string
  client_id: string | null
  product_id: string | null
  price_id: string | null
  discount_code_id: string | null
  amount_paid: number | null
  currency: string | null
  status: OrderStatus | null
  payment_method: PaymentMethod | null
  stripe_session_id: string | null
  stripe_payment_id: string | null
  invoice_url: string | null
  bank_transfer_ref: string | null
  paid_at: string | null
  created_at: string | null
}

export interface ProductRow {
  id: string
  name: string
  name_en: string | null
  description: string | null
  description_en: string | null
  type: ProductType | null
  session_count: number | null
  is_active: boolean | null
  sort_order: number | null
  created_at: string | null
}

export interface PriceRow {
  id: string
  product_id: string | null
  currency: string | null
  amount: number
  billing_interval: BillingInterval | null
  stripe_price_id: string | null
  label: string | null
  label_en: string | null
  is_active: boolean | null
  created_at: string | null
}

export interface PlatformSettingRow {
  id: string
  category: string
  key: string
  value: string | null
  is_sensitive: boolean | null
  label: string
  label_en: string | null
  description: string | null
  description_en: string | null
  input_type: InputType | null
  options: Json | null
  placeholder: string | null
  is_required: boolean | null
  is_active: boolean | null
  validation: Json | null
  updated_by: string | null
  updated_at: string | null
}

export interface StageApprovalRow {
  id: string
  client_id: string | null
  coach_id: string | null
  stage_number: number
  status: StageApprovalStatus | null
  coach_summary: string | null
  admin_note: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string | null
}

export interface ClientCoachRow {
  id: string
  client_id: string | null
  coach_id: string | null
  role: CoachRole | null
  assigned_at: string | null
  ended_at: string | null
  assigned_by: string | null
}

export interface InAppNotificationRow {
  id: string
  profile_id: string | null
  title: string
  title_en: string | null
  body: string | null
  body_en: string | null
  action_url: string | null
  is_read: boolean | null
  created_at: string | null
}

export interface NotificationTemplateRow {
  id: string
  name: string
  name_en: string | null
  description: string | null
  category: NotificationCategory | null
  channel: NotificationChannel | null
  subject: string | null
  body_html: string | null
  body_text: string | null
  body_inapp: string | null
  is_active: boolean | null
  is_system: boolean | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TransferRequestRow {
  id: string
  client_id: string | null
  from_coach_id: string | null
  to_coach_id: string | null
  requested_by: string | null
  reason: string | null
  status: TransferStatus | null
  admin_note: string | null
  reviewed_by: string | null
  requested_at: string | null
  reviewed_at: string | null
  handover_deadline: string | null
}

// Client with profile joined
export interface ClientWithProfile extends ClientRow {
  profiles: ProfileRow | null
}

// Weekly update with client
export interface UpdateWithClient extends WeeklyUpdateRow {
  clients: ClientRow | null
}
