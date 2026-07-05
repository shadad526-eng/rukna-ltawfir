export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          alt_text_ar: string | null
          alt_text_en: string | null
          channel: Database["public"]["Enums"]["asset_channel"]
          created_at: string
          face_present: boolean
          file_size_bytes: number | null
          height: number | null
          id: string
          is_official: boolean
          mime_type: string | null
          original_filename: string | null
          storage_bucket: string
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          channel: Database["public"]["Enums"]["asset_channel"]
          created_at?: string
          face_present?: boolean
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_official?: boolean
          mime_type?: string | null
          original_filename?: string | null
          storage_bucket: string
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          channel?: Database["public"]["Enums"]["asset_channel"]
          created_at?: string
          face_present?: boolean
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_official?: boolean
          mime_type?: string | null
          original_filename?: string | null
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
        }
        Relationships: []
      }
      b2b_partner_applications: {
        Row: {
          attachments: string[] | null
          brands_of_interest: string[] | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          country: string
          created_at: string
          id: string
          markets_served: string[] | null
          message: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          status: Database["public"]["Enums"]["inquiry_status"]
          website: string | null
          years_in_market: number | null
        }
        Insert: {
          attachments?: string[] | null
          brands_of_interest?: string[] | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          country: string
          created_at?: string
          id?: string
          markets_served?: string[] | null
          message?: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          status?: Database["public"]["Enums"]["inquiry_status"]
          website?: string | null
          years_in_market?: number | null
        }
        Update: {
          attachments?: string[] | null
          brands_of_interest?: string[] | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          country?: string
          created_at?: string
          id?: string
          markets_served?: string[] | null
          message?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          status?: Database["public"]["Enums"]["inquiry_status"]
          website?: string | null
          years_in_market?: number | null
        }
        Relationships: []
      }
      brand_certifications: {
        Row: {
          brand_id: string
          certification_id: string
          id: string
          valid_until: string | null
        }
        Insert: {
          brand_id: string
          certification_id: string
          id?: string
          valid_until?: string | null
        }
        Update: {
          brand_id?: string
          certification_id?: string
          id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_certifications_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_tokens: Json
          created_at: string
          description_ar: string | null
          description_en: string | null
          hero_asset_id: string | null
          id: string
          is_partner: boolean
          is_umbrella: boolean
          logo_asset_id: string | null
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["brand_status"]
          tagline_ar: string | null
          tagline_en: string | null
          updated_at: string
        }
        Insert: {
          brand_tokens?: Json
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          hero_asset_id?: string | null
          id?: string
          is_partner?: boolean
          is_umbrella?: boolean
          logo_asset_id?: string | null
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["brand_status"]
          tagline_ar?: string | null
          tagline_en?: string | null
          updated_at?: string
        }
        Update: {
          brand_tokens?: Json
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          hero_asset_id?: string | null
          id?: string
          is_partner?: boolean
          is_umbrella?: boolean
          logo_asset_id?: string | null
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["brand_status"]
          tagline_ar?: string | null
          tagline_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_hero_asset_id_fkey"
            columns: ["hero_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_logo_asset_id_fkey"
            columns: ["logo_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_requests: {
        Row: {
          catalog_id: string
          company: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          handled_by: string | null
          id: string
          ip_hash: string | null
          phone: string | null
          purpose: string | null
          source_url: string | null
          staff_notes: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          catalog_id: string
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          handled_by?: string | null
          id?: string
          ip_hash?: string | null
          phone?: string | null
          purpose?: string | null
          source_url?: string | null
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          catalog_id?: string
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          handled_by?: string | null
          id?: string
          ip_hash?: string | null
          phone?: string | null
          purpose?: string | null
          source_url?: string | null
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      catalogs: {
        Row: {
          brand_id: string | null
          cover_asset_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          is_published: boolean
          languages: Database["public"]["Enums"]["language_code"][]
          pdf_asset_id: string | null
          slug: string
          sort_order: number
          title_ar: string
          title_en: string
          updated_at: string
          visibility: Database["public"]["Enums"]["catalog_visibility"]
          year: number | null
        }
        Insert: {
          brand_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          languages?: Database["public"]["Enums"]["language_code"][]
          pdf_asset_id?: string | null
          slug: string
          sort_order?: number
          title_ar: string
          title_en: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["catalog_visibility"]
          year?: number | null
        }
        Update: {
          brand_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          languages?: Database["public"]["Enums"]["language_code"][]
          pdf_asset_id?: string | null
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["catalog_visibility"]
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogs_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogs_pdf_asset_id_fkey"
            columns: ["pdf_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          id: string
          logo_asset_id: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_asset_id?: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_asset_id?: string | null
          name_ar?: string
          name_en?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_logo_asset_id_fkey"
            columns: ["logo_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_identity: {
        Row: {
          address_ar: string | null
          address_en: string | null
          email: string | null
          hero_headline_ar: string
          hero_headline_en: string | null
          hero_sub_ar: string
          hero_sub_en: string | null
          id: number
          legal_name_ar: string
          legal_name_en: string
          logo_asset_id: string | null
          parent_group_ar: string | null
          parent_group_en: string | null
          strategic_positioning: string | null
          tagline: string | null
          updated_at: string
          updated_by: string | null
          whatsapp_number: string
        }
        Insert: {
          address_ar?: string | null
          address_en?: string | null
          email?: string | null
          hero_headline_ar: string
          hero_headline_en?: string | null
          hero_sub_ar: string
          hero_sub_en?: string | null
          id?: number
          legal_name_ar: string
          legal_name_en: string
          logo_asset_id?: string | null
          parent_group_ar?: string | null
          parent_group_en?: string | null
          strategic_positioning?: string | null
          tagline?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string
        }
        Update: {
          address_ar?: string | null
          address_en?: string | null
          email?: string | null
          hero_headline_ar?: string
          hero_headline_en?: string | null
          hero_sub_ar?: string
          hero_sub_en?: string | null
          id?: number
          legal_name_ar?: string
          legal_name_en?: string
          logo_asset_id?: string | null
          parent_group_ar?: string | null
          parent_group_en?: string | null
          strategic_positioning?: string | null
          tagline?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_identity_logo_asset_id_fkey"
            columns: ["logo_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          body_ar: string | null
          body_en: string | null
          created_at: string
          cta_label_ar: string | null
          cta_url: string | null
          extra: Json
          id: string
          is_enabled: boolean
          media_asset_id: string | null
          section_key: string
          sort_order: number
          subtitle_ar: string | null
          subtitle_en: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          cta_label_ar?: string | null
          cta_url?: string | null
          extra?: Json
          id?: string
          is_enabled?: boolean
          media_asset_id?: string | null
          section_key: string
          sort_order?: number
          subtitle_ar?: string | null
          subtitle_en?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          cta_label_ar?: string | null
          cta_url?: string | null
          extra?: Json
          id?: string
          is_enabled?: boolean
          media_asset_id?: string | null
          section_key?: string
          sort_order?: number
          subtitle_ar?: string | null
          subtitle_en?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_sections_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          assigned_to: string | null
          brand_id: string | null
          catalog_id: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          ip_hash: string | null
          kind: Database["public"]["Enums"]["inquiry_kind"]
          locale: Database["public"]["Enums"]["language_code"]
          message: string | null
          name: string | null
          notes: string | null
          partner_type: Database["public"]["Enums"]["partner_type"] | null
          phone: string | null
          product_id: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          user_agent: string | null
          variant_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          brand_id?: string | null
          catalog_id?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          kind: Database["public"]["Enums"]["inquiry_kind"]
          locale?: Database["public"]["Enums"]["language_code"]
          message?: string | null
          name?: string | null
          notes?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"] | null
          phone?: string | null
          product_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_agent?: string | null
          variant_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          brand_id?: string | null
          catalog_id?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          kind?: Database["public"]["Enums"]["inquiry_kind"]
          locale?: Database["public"]["Enums"]["language_code"]
          message?: string | null
          name?: string | null
          notes?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"] | null
          phone?: string | null
          product_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_agent?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          author_id: string | null
          body_ar: Json | null
          body_en: Json | null
          brand_id: string | null
          cover_asset_id: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_en: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_ar?: Json | null
          body_en?: Json | null
          brand_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_ar?: Json | null
          body_en?: Json | null
          brand_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          label_ar: string
          label_en: string | null
          location: string
          open_in_new_tab: boolean
          parent_id: string | null
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          label_ar: string
          label_en?: string | null
          location?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          label_ar?: string
          label_en?: string | null
          location?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          body_ar: Json | null
          body_en: Json | null
          brand_id: string | null
          cover_asset_id: string | null
          id: string
          identity_scope: Database["public"]["Enums"]["identity_scope"]
          is_published: boolean
          published_at: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          body_ar?: Json | null
          body_en?: Json | null
          brand_id?: string | null
          cover_asset_id?: string | null
          id?: string
          identity_scope?: Database["public"]["Enums"]["identity_scope"]
          is_published?: boolean
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          body_ar?: Json | null
          body_en?: Json | null
          brand_id?: string | null
          cover_asset_id?: string | null
          id?: string
          identity_scope?: Database["public"]["Enums"]["identity_scope"]
          is_published?: boolean
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      product_assets: {
        Row: {
          asset_id: string
          caption_ar: string | null
          caption_en: string | null
          id: string
          product_id: string
          sort_order: number
          variant_id: string | null
        }
        Insert: {
          asset_id: string
          caption_ar?: string | null
          caption_en?: string | null
          id?: string
          product_id: string
          sort_order?: number
          variant_id?: string | null
        }
        Update: {
          asset_id?: string
          caption_ar?: string | null
          caption_en?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_assets_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_assets_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          icon_asset_id: string | null
          id: string
          name_ar: string
          name_en: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon_asset_id?: string | null
          id?: string
          name_ar: string
          name_en: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon_asset_id?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_icon_asset_id_fkey"
            columns: ["icon_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_faqs: {
        Row: {
          answer_ar: string
          answer_en: string | null
          id: string
          product_id: string
          question_ar: string
          question_en: string | null
          sort_order: number
        }
        Insert: {
          answer_ar: string
          answer_en?: string | null
          id?: string
          product_id: string
          question_ar: string
          question_en?: string | null
          sort_order?: number
        }
        Update: {
          answer_ar?: string
          answer_en?: string | null
          id?: string
          product_id?: string
          question_ar?: string
          question_en?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ingredients: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          notes_ar: string | null
          notes_en: string | null
          origin_ar: string | null
          origin_en: string | null
          percentage: number | null
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          notes_ar?: string | null
          notes_en?: string | null
          origin_ar?: string | null
          origin_en?: string | null
          percentage?: number | null
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          notes_ar?: string | null
          notes_en?: string | null
          origin_ar?: string | null
          origin_en?: string | null
          percentage?: number | null
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_nutrition: {
        Row: {
          id: string
          label_ar: string
          label_en: string
          product_id: string
          sort_order: number
          unit: string | null
          value: string
        }
        Insert: {
          id?: string
          label_ar: string
          label_en: string
          product_id: string
          sort_order?: number
          unit?: string | null
          value: string
        }
        Update: {
          id?: string
          label_ar?: string
          label_en?: string
          product_id?: string
          sort_order?: number
          unit?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_nutrition_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          cover_asset_id: string | null
          created_at: string
          dimensions_mm: Json | null
          id: string
          internal_sku: string | null
          is_published: boolean
          name_ar: string
          name_en: string
          pack_size: string | null
          product_id: string
          slug: string
          sort_order: number
          unit_count: number | null
          updated_at: string
          variant_type: string
          weight_grams: number | null
        }
        Insert: {
          barcode?: string | null
          cover_asset_id?: string | null
          created_at?: string
          dimensions_mm?: Json | null
          id?: string
          internal_sku?: string | null
          is_published?: boolean
          name_ar: string
          name_en: string
          pack_size?: string | null
          product_id: string
          slug: string
          sort_order?: number
          unit_count?: number | null
          updated_at?: string
          variant_type?: string
          weight_grams?: number | null
        }
        Update: {
          barcode?: string | null
          cover_asset_id?: string | null
          created_at?: string
          dimensions_mm?: Json | null
          id?: string
          internal_sku?: string | null
          is_published?: boolean
          name_ar?: string
          name_en?: string
          pack_size?: string | null
          product_id?: string
          slug?: string
          sort_order?: number
          unit_count?: number | null
          updated_at?: string
          variant_type?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          category_id: string | null
          cover_asset_id: string | null
          created_at: string
          id: string
          is_published: boolean
          key_benefits_ar: string[] | null
          key_benefits_en: string[] | null
          long_description_ar: string | null
          long_description_en: string | null
          name_ar: string
          name_en: string
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          short_description_ar: string | null
          short_description_en: string | null
          slug: string
          sort_order: number
          updated_at: string
          usage_instructions_ar: string | null
          usage_instructions_en: string | null
        }
        Insert: {
          brand_id: string
          category_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          key_benefits_ar?: string[] | null
          key_benefits_en?: string[] | null
          long_description_ar?: string | null
          long_description_en?: string | null
          name_ar: string
          name_en: string
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          short_description_ar?: string | null
          short_description_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          usage_instructions_ar?: string | null
          usage_instructions_en?: string | null
        }
        Update: {
          brand_id?: string
          category_id?: string | null
          cover_asset_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          key_benefits_ar?: string[] | null
          key_benefits_en?: string[] | null
          long_description_ar?: string | null
          long_description_en?: string | null
          name_ar?: string
          name_en?: string
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          short_description_ar?: string | null
          short_description_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          usage_instructions_ar?: string | null
          usage_instructions_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          locale: Database["public"]["Enums"]["language_code"]
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          locale?: Database["public"]["Enums"]["language_code"]
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          locale?: Database["public"]["Enums"]["language_code"]
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      topic_hubs: {
        Row: {
          cover_asset_id: string | null
          created_at: string
          id: string
          intro_ar: string | null
          intro_en: string | null
          is_published: boolean
          related_article_ids: string[] | null
          related_brand_ids: string[] | null
          related_product_ids: string[] | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          cover_asset_id?: string | null
          created_at?: string
          id?: string
          intro_ar?: string | null
          intro_en?: string | null
          is_published?: boolean
          related_article_ids?: string[] | null
          related_brand_ids?: string[] | null
          related_product_ids?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          cover_asset_id?: string | null
          created_at?: string
          id?: string
          intro_ar?: string | null
          intro_en?: string | null
          is_published?: boolean
          related_article_ids?: string[] | null
          related_brand_ids?: string[] | null
          related_product_ids?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_hubs_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_variants_public: {
        Row: {
          cover_asset_id: string | null
          created_at: string | null
          dimensions_mm: Json | null
          id: string | null
          is_published: boolean | null
          name_ar: string | null
          name_en: string | null
          pack_size: string | null
          product_id: string | null
          slug: string | null
          sort_order: number | null
          unit_count: number | null
          updated_at: string | null
          variant_type: string | null
          weight_grams: number | null
        }
        Insert: {
          cover_asset_id?: string | null
          created_at?: string | null
          dimensions_mm?: Json | null
          id?: string | null
          is_published?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          pack_size?: string | null
          product_id?: string | null
          slug?: string | null
          sort_order?: number | null
          unit_count?: number | null
          updated_at?: string | null
          variant_type?: string | null
          weight_grams?: number | null
        }
        Update: {
          cover_asset_id?: string | null
          created_at?: string | null
          dimensions_mm?: Json | null
          id?: string | null
          is_published?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          pack_size?: string | null
          product_id?: string | null
          slug?: string | null
          sort_order?: number | null
          unit_count?: number | null
          updated_at?: string | null
          variant_type?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_brand_role: {
        Args: {
          _brand_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      user_manages_brand_path: {
        Args: { _path: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "brand_manager" | "editor" | "viewer"
      asset_channel:
        | "brand_logo"
        | "packaging_official"
        | "marketing_generated"
        | "catalog_pdf"
        | "document"
      brand_status: "active" | "archived" | "draft"
      catalog_visibility: "public" | "restricted" | "b2b_only"
      identity_scope: "corporate" | "brand"
      inquiry_kind:
        | "whatsapp_click"
        | "b2b_lead"
        | "catalog_request"
        | "contact_form"
      inquiry_status: "new" | "in_review" | "contacted" | "converted" | "closed"
      language_code: "ar" | "en"
      partner_type:
        | "local_distributor"
        | "international_supplier"
        | "retail_chain"
        | "pharmacy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "brand_manager", "editor", "viewer"],
      asset_channel: [
        "brand_logo",
        "packaging_official",
        "marketing_generated",
        "catalog_pdf",
        "document",
      ],
      brand_status: ["active", "archived", "draft"],
      catalog_visibility: ["public", "restricted", "b2b_only"],
      identity_scope: ["corporate", "brand"],
      inquiry_kind: [
        "whatsapp_click",
        "b2b_lead",
        "catalog_request",
        "contact_form",
      ],
      inquiry_status: ["new", "in_review", "contacted", "converted", "closed"],
      language_code: ["ar", "en"],
      partner_type: [
        "local_distributor",
        "international_supplier",
        "retail_chain",
        "pharmacy",
      ],
    },
  },
} as const
