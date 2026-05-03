// Auto-generated from Supabase schema — do not hand-edit
// Re-generate with: npx supabase gen types typescript --project-id rgejagiyxllrpdbpehxa

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'coach' | 'client'
export type StatusColor = 'green' | 'yellow' | 'red'
export type ClientStatus = 'active' | 'paused' | 'completed' | 'dropped'
export type ClientType = 'development' | 'healing' | 'both'
export type SessionType = 'individual' | 'group'
export type SessionFormat = 'online' | 'written_review' | 'quarterly_review' | 'book' | 'assessment' | 'physical'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'
export type CoachRole = 'primary' | 'specialist' | 'observer'
export type TransferStatus = 'pending' | 'approved_pending_handover' | 'completed' | 'rejected'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'stripe' | 'bank_transfer' | 'manual'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          full_name_en: string | null
          email: string
          role: UserRole
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          preferred_lang: 'ar' | 'en'
          mfa_enabled: boolean
          dashboard_quota_override: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      clients: {
        Row: {
          id: string
          profile_id: string
          client_type: ClientType | null
          client_segment: string | null
          current_stage: number
          status: ClientStatus
          journey_start: string | null
          journey_end: string | null
          mission_statement: string | null
          lead_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      client_coaches: {
        Row: {
          id: string
          client_id: string
          coach_id: string
          role: CoachRole
          assigned_at: string
          ended_at: string | null
          assigned_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['client_coaches']['Row'], 'id' | 'assigned_at'>
        Update: Partial<Database['public']['Tables']['client_coaches']['Insert']>
      }
      leads: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          source: string | null
          discovery_answers: Json | null
          status: string
          assigned_to: string | null
          notes: string | null
          converted_at: string | null
          client_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      weekly_updates: {
        Row: {
          id: string
          client_id: string
          week_number: number
          status_color: StatusColor
          summary: string | null
          achievements: string | null
          challenges: string | null
          next_week_plan: string | null
          pressure_note: string | null
          coach_reply: string | null
          coach_reply_at: string | null
          shared_on_transfer: boolean
          submitted_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['weekly_updates']['Row'], 'id' | 'submitted_at' | 'created_at'>
        Update: Partial<Database['public']['Tables']['weekly_updates']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          coach_id: string | null
          client_id: string | null
          session_type: SessionType
          session_number: number | null
          title: string | null
          title_en: string | null
          description: string | null
          format: SessionFormat | null
          max_capacity: number | null
          scheduled_at: string | null
          meeting_link: string | null
          status: SessionStatus
          action_items: string | null
          coach_notes: string | null
          shared_on_transfer: boolean
          coach_notes_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      goals: {
        Row: {
          id: string
          client_id: string
          coach_id: string | null
          title: string
          title_en: string | null
          description: string | null
          category: string | null
          axis: string | null
          priority: number | null
          target_date: string | null
          baseline: string | null
          metrics: Json | null
          status: string
          achieved_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
      stage_approvals: {
        Row: {
          id: string
          client_id: string
          coach_id: string | null
          stage_number: number
          status: string
          coach_summary: string | null
          admin_note: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stage_approvals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stage_approvals']['Insert']>
      }
      transfer_requests: {
        Row: {
          id: string
          client_id: string
          from_coach_id: string | null
          to_coach_id: string | null
          requested_by: string | null
          reason: string | null
          limited_note: string | null
          status: TransferStatus
          admin_note: string | null
          reviewed_by: string | null
          requested_at: string
          reviewed_at: string | null
          handover_deadline: string | null
          handover_completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['transfer_requests']['Row'], 'id' | 'requested_at'>
        Update: Partial<Database['public']['Tables']['transfer_requests']['Insert']>
      }
      products: {
        Row: {
          id: string
          name: string
          name_en: string | null
          description: string | null
          description_en: string | null
          type: string | null
          session_count: number | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      prices: {
        Row: {
          id: string
          product_id: string
          currency: string
          amount: number
          billing_interval: string | null
          stripe_price_id: string | null
          label: string | null
          label_en: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['prices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['prices']['Insert']>
      }
      orders: {
        Row: {
          id: string
          client_id: string | null
          product_id: string | null
          price_id: string | null
          discount_code_id: string | null
          amount_paid: number | null
          currency: string
          status: OrderStatus | null
          payment_method: PaymentMethod | null
          stripe_session_id: string | null
          stripe_payment_id: string | null
          invoice_url: string | null
          bank_transfer_ref: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      platform_settings: {
        Row: {
          id: string
          category: string
          key: string
          value: string | null
          is_sensitive: boolean
          label: string
          label_en: string | null
          input_type: string | null
          is_required: boolean
          is_active: boolean
          updated_by: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['platform_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['platform_settings']['Insert']>
      }
      in_app_notifications: {
        Row: {
          id: string
          profile_id: string
          title: string
          title_en: string | null
          body: string | null
          body_en: string | null
          action_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['in_app_notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['in_app_notifications']['Insert']>
      }
      dashboard_layouts: {
        Row: {
          id: string
          profile_id: string
          dashboard_id: string
          layout: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dashboard_layouts']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['dashboard_layouts']['Insert']>
      }
    }
    Views: {
      vw_update_color_dist: { Row: { client_id: string | null; coach_id: string | null; status_color: string | null; cnt: number | null; week: string | null } }
      vw_client_stage_dist: { Row: { coach_id: string | null; stages_1_3: number | null; stages_4_8: number | null; stages_9_12: number | null; total: number | null } }
      vw_coach_reply_times: { Row: { coach_id: string | null; avg_reply_hours: number | null; total_replied: number | null } }
      vw_engagement_heatmap: { Row: { coach_id: string | null; client_id: string | null; submission_day: string | null; day_of_week: number | null; week_start: string | null; submissions: number | null } }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
