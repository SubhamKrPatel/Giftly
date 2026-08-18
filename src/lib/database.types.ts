// Database types for Giftly Part 4B.
// Extended with gift_media table and media relationship definitions.
// Structure follows the @supabase/supabase-js Database generic contract.

export interface TemplateThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  backgroundGradient?: string
  fontFamily?: string
  tag?: string
  [key: string]: unknown
}

export interface GiftThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  backgroundGradient?: string
  fontFamily?: string
  tag?: string
  [key: string]: unknown
}

export interface CoverSectionContent {
  headline: string
  subheadline?: string
}

export interface MessageSectionContent {
  heading: string
  body: string
}

export interface FinalMessageSectionContent {
  heading: string
  body: string
}

export interface GallerySectionContent {
  layout?: 'grid' | 'masonry'
  caption?: string
  items?: Array<{ id: string; url?: string; caption?: string }>
}

export type SectionType =
  | 'cover'
  | 'message'
  | 'gallery'
  | 'video'
  | 'voice'
  | 'music'
  | 'final_message'

export type SectionContent =
  | CoverSectionContent
  | MessageSectionContent
  | FinalMessageSectionContent
  | GallerySectionContent
  | Record<string, unknown>

export type MediaType = 'image' | 'video' | 'audio' | 'voice' | string

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
          theme_config: GiftThemeConfig
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
          theme_config?: GiftThemeConfig
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
          theme_config?: GiftThemeConfig
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
      gift_sections: {
        Row: {
          id: string
          gift_id: string
          section_type: SectionType | string
          position: number
          content: SectionContent
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          section_type: SectionType | string
          position?: number
          content?: SectionContent
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gift_id?: string
          section_type?: SectionType | string
          position?: number
          content?: SectionContent
          is_visible?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gift_sections_gift_id_fkey'
            columns: ['gift_id']
            isOneToOne: false
            referencedRelation: 'gifts'
            referencedColumns: ['id']
          },
        ]
      }
      gift_media: {
        Row: {
          id: string
          gift_id: string
          section_id: string | null
          media_type: MediaType
          storage_path: string
          file_name: string
          mime_type: string
          file_size: number
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          section_id?: string | null
          media_type?: MediaType
          storage_path: string
          file_name: string
          mime_type: string
          file_size: number
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gift_id?: string
          section_id?: string | null
          media_type?: MediaType
          storage_path?: string
          file_name?: string
          mime_type?: string
          file_size?: number
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gift_media_gift_id_fkey'
            columns: ['gift_id']
            isOneToOne: false
            referencedRelation: 'gifts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gift_media_section_id_fkey'
            columns: ['section_id']
            isOneToOne: false
            referencedRelation: 'gift_sections'
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

export type GiftSection = Database['public']['Tables']['gift_sections']['Row']
export type GiftSectionInsert = Database['public']['Tables']['gift_sections']['Insert']
export type GiftSectionUpdate = Database['public']['Tables']['gift_sections']['Update']

export type GiftMedia = Database['public']['Tables']['gift_media']['Row']
export type GiftMediaInsert = Database['public']['Tables']['gift_media']['Insert']
export type GiftMediaUpdate = Database['public']['Tables']['gift_media']['Update']

// Client-augmented type with resolved signed URL
export type GiftMediaItem = GiftMedia & {
  signedUrl?: string
}

// Convenience joined type
export type GiftWithDetails = Gift & {
  occasion?: Occasion | null
  template?: Template | null
}
