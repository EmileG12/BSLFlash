export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          category_name: string
          id: string
          is_active: boolean
          is_vocabulary: boolean
        }
        Insert: {
          category_name: string
          id?: string
          is_active?: boolean
          is_vocabulary?: boolean
        }
        Update: {
          category_name?: string
          id?: string
          is_active?: boolean
          is_vocabulary?: boolean
        }
        Relationships: []
      }
      custom_deck_tags: {
        Row: {
          category_id: string
          custom_deck_id: string
        }
        Insert: {
          category_id: string
          custom_deck_id: string
        }
        Update: {
          category_id?: string
          custom_deck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_deck_tags_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_deck_tags_custom_deck_id_fkey"
            columns: ["custom_deck_id"]
            isOneToOne: false
            referencedRelation: "custom_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_deck_words: {
        Row: {
          custom_deck_id: string
          word_id: string
        }
        Insert: {
          custom_deck_id: string
          word_id: string
        }
        Update: {
          custom_deck_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_deck_words_custom_deck_id_fkey"
            columns: ["custom_deck_id"]
            isOneToOne: false
            referencedRelation: "custom_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_deck_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_decks: {
        Row: {
          created_at: string
          deck_name: string
          id: string
          is_public: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_name: string
          id?: string
          is_public?: boolean
          user_id?: string
        }
        Update: {
          created_at?: string
          deck_name?: string
          id?: string
          is_public?: boolean
          user_id?: string
        }
        Relationships: []
      }
      deck_likes: {
        Row: {
          created_at: string
          custom_deck_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_deck_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          custom_deck_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_likes_custom_deck_id_fkey"
            columns: ["custom_deck_id"]
            isOneToOne: false
            referencedRelation: "custom_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          id?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          role_description: string | null
          role_name: string
        }
        Insert: {
          id?: string
          role_description?: string | null
          role_name: string
        }
        Update: {
          id?: string
          role_description?: string | null
          role_name?: string
        }
        Relationships: []
      }
      saved_decks: {
        Row: {
          created_at: string
          custom_deck_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_deck_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          custom_deck_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_decks_custom_deck_id_fkey"
            columns: ["custom_deck_id"]
            isOneToOne: false
            referencedRelation: "custom_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      sign_videos: {
        Row: {
          duration_ms: number
          file_size: number
          format: string
          height: number
          id: string
          sign_id: string
          storage_path: string
          width: number
        }
        Insert: {
          duration_ms: number
          file_size: number
          format: string
          height: number
          id?: string
          sign_id: string
          storage_path: string
          width: number
        }
        Update: {
          duration_ms?: number
          file_size?: number
          format?: string
          height?: number
          id?: string
          sign_id?: string
          storage_path?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "sign_videos_sign_id_fkey"
            columns: ["sign_id"]
            isOneToOne: false
            referencedRelation: "signs"
            referencedColumns: ["id"]
          },
        ]
      }
      signs: {
        Row: {
          id: string
          is_primary: boolean
          region: string | null
          variant_name: string
          word_id: string
        }
        Insert: {
          id?: string
          is_primary?: boolean
          region?: string | null
          variant_name: string
          word_id: string
        }
        Update: {
          id?: string
          is_primary?: boolean
          region?: string | null
          variant_name?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signs_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      word_categories: {
        Row: {
          category_id: string
          word_id: string
        }
        Insert: {
          category_id: string
          word_id: string
        }
        Update: {
          category_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_categories_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          definition: string
          id: string
          word: string
        }
        Insert: {
          definition: string
          id?: string
          word: string
        }
        Update: {
          definition?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      ban_user: { Args: { p_user_id: string }; Returns: undefined }
      create_custom_deck: {
        Args: { p_name: string; p_word_ids: string[] }
        Returns: string
      }
      delete_user: { Args: { p_user_id: string }; Returns: undefined }
      get_available_deck_tags: {
        Args: never
        Returns: {
          category_name: string
          id: string
        }[]
      }
      get_available_subcategories_for_category: {
        Args: { category_id: string }
        Returns: {
          category_name: string
          id: string
        }[]
      }
      get_categories_with_words: {
        Args: { p_is_vocabulary: boolean }
        Returns: {
          category_name: string
          id: string
          is_vocabulary: boolean
        }[]
      }
      get_public_decks: {
        Args: { p_search?: string; p_sort?: string; p_tag_ids?: string[] }
        Returns: {
          created_at: string
          deck_name: string
          id: string
          like_count: number
          liked_by_me: boolean
          owner_name: string
          owner_user_id: string
          saved_by_me: boolean
          tag_names: string[]
        }[]
      }
      get_random_word_for_category: {
        Args: {
          category_id: string
          is_custom?: boolean
          subcategory_id?: string
        }
        Returns: {
          definition: string
          format: string
          storage_path: string
          word: string
          word_id: string
        }[]
      }
      get_random_words_for_category: {
        Args: {
          card_count?: number
          category_id: string
          is_custom?: boolean
          subcategory_id?: string
        }
        Returns: {
          definition: string
          format: string
          storage_path: string
          word: string
          word_id: string
        }[]
      }
      get_saved_decks: {
        Args: never
        Returns: {
          deck_name: string
          id: string
          owner_name: string
          owner_user_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      keepalive_ping: { Args: never; Returns: string }
      list_users_with_roles: {
        Args: never
        Returns: {
          banned_until: string
          email: string
          roles: string[]
          user_id: string
          user_name: string
        }[]
      }
      revoke_role: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      set_primary_sign: { Args: { p_sign_id: string }; Returns: undefined }
      unban_user: { Args: { p_user_id: string }; Returns: undefined }
      update_custom_deck: {
        Args: {
          p_deck_id: string
          p_is_public: boolean
          p_name: string
          p_word_ids: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

