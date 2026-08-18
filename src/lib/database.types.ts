// Database types for Giftly Part 3.
// Extended with occasions, templates, and gifts tables.
// Structure follows the @supabase/supabase-js Database generic contract.

export interface TemplateThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  backgroundGradient?: string
  fontFamily?: string
  tag?: string
  [key: string]: unknown
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      occasions: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          icon: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          icon: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          icon?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          id: string
          occasion_id: string
          name: string
          slug: string
          description: string
          thumbnail_url: string | null
          theme_config: TemplateThemeConfig
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          occasion_id: string
          name: string
          slug: string
          description: string
          thumbnail_url?: string | null
          theme_config?: TemplateThemeConfig
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          occasion_id?: string
          name?: string
          slug?: string
          description?: string
          thumbnail_url?: string | null
          theme_config?: TemplateThemeConfig
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'templates_occasion_id_fkey'
            columns: ['occasion_id']
            isOneToOne: false
            referencedRelation: 'occasions'
            referencedColumns: ['id']
          },
        ]
      }
      gifts: {
        Row: {
          id: string
          user_id: string
          occasion_id: string
          template_id: string
          title: string | null
          recipient_name: string
          sender_name: string | null
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          occasion_id: string
          template_id: string
          title?: string | null
          recipient_name: string
          sender_name?: string | null
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          occasion_id?: string
          template_id?: string
          title?: string | null
          recipient_name?: string
          sender_name?: string | null
          status?: 'draft' | 'published'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gifts_occasion_id_fkey'
            columns: ['occasion_id']
            isOneToOne: false
            referencedRelation: 'occasions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gifts_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'templates'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Occasion = Database['public']['Tables']['occasions']['Row']
export type OccasionInsert = Database['public']['Tables']['occasions']['Insert']
export type OccasionUpdate = Database['public']['Tables']['occasions']['Update']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type Gift = Database['public']['Tables']['gifts']['Row']
export type GiftInsert = Database['public']['Tables']['gifts']['Insert']
export type GiftUpdate = Database['public']['Tables']['gifts']['Update']

// Convenience joined type
export type GiftWithDetails = Gift & {
  occasion?: Occasion | null
  template?: Template | null
}
