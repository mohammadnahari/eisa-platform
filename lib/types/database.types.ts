export type UserRole = 'admin' | 'coach' | 'client'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          is_active: boolean
          mfa_enabled: boolean | null
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          [key: string]: unknown
        }
        Insert: {
          id: string
          role?: UserRole
          is_active?: boolean
          mfa_enabled?: boolean | null
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          [key: string]: unknown
        }
        Update: {
          id?: string
          role?: UserRole
          is_active?: boolean
          mfa_enabled?: boolean | null
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          [key: string]: unknown
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
  }
}