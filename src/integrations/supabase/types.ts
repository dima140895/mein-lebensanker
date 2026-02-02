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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      person_profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          encrypted_password_recovery: string | null
          encryption_salt: string | null
          full_name: string | null
          has_paid: boolean | null
          id: string
          is_encrypted: boolean | null
          max_profiles: number | null
          partner_name: string | null
          payment_type: string | null
          purchased_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          encrypted_password_recovery?: string | null
          encryption_salt?: string | null
          full_name?: string | null
          has_paid?: boolean | null
          id?: string
          is_encrypted?: boolean | null
          max_profiles?: number | null
          partner_name?: string | null
          payment_type?: string | null
          purchased_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          encrypted_password_recovery?: string | null
          encryption_salt?: string | null
          full_name?: string | null
          has_paid?: boolean | null
          id?: string
          is_encrypted?: boolean | null
          max_profiles?: number | null
          partner_name?: string | null
          payment_type?: string | null
          purchased_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      share_token_access_log: {
        Row: {
          accessed_at: string
          id: string
          token_hash: string
          was_rate_limited: boolean
          was_valid: boolean
        }
        Insert: {
          accessed_at?: string
          id?: string
          token_hash: string
          was_rate_limited?: boolean
          was_valid: boolean
        }
        Update: {
          accessed_at?: string
          id?: string
          token_hash?: string
          was_rate_limited?: boolean
          was_valid?: boolean
        }
        Relationships: []
      }
      share_tokens: {
        Row: {
          created_at: string
          encrypted_recovery_key: string | null
          expires_at: string | null
          failed_attempts: number
          id: string
          is_active: boolean
          label: string | null
          pin_hash: string | null
          pin_salt: string | null
          shared_profile_ids: string[] | null
          shared_profile_sections: Json | null
          shared_sections: string[] | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_recovery_key?: string | null
          expires_at?: string | null
          failed_attempts?: number
          id?: string
          is_active?: boolean
          label?: string | null
          pin_hash?: string | null
          pin_salt?: string | null
          shared_profile_ids?: string[] | null
          shared_profile_sections?: Json | null
          shared_sections?: string[] | null
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_recovery_key?: string | null
          expires_at?: string | null
          failed_attempts?: number
          id?: string
          is_active?: boolean
          label?: string | null
          pin_hash?: string | null
          pin_salt?: string | null
          shared_profile_ids?: string[] | null
          shared_profile_sections?: Json | null
          shared_sections?: string[] | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vorsorge_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_for_partner: boolean | null
          person_profile_id: string | null
          section_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_for_partner?: boolean | null
          person_profile_id?: string | null
          section_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_for_partner?: boolean | null
          person_profile_id?: string | null
          section_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vorsorge_data_person_profile_id_fkey"
            columns: ["person_profile_id"]
            isOneToOne: false
            referencedRelation: "person_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_token_access_logs: { Args: never; Returns: undefined }
      get_encryption_info_by_token: {
        Args: { _pin?: string; _token: string }
        Returns: {
          encrypted_password_recovery: string
          encrypted_recovery_key: string
          encryption_salt: string
          is_encrypted: boolean
          pin_salt: string
        }[]
      }
      get_profile_by_token:
        | {
            Args: { _token: string }
            Returns: {
              full_name: string
              partner_name: string
            }[]
          }
        | {
            Args: { _pin?: string; _token: string }
            Returns: {
              full_name: string
              partner_name: string
            }[]
          }
      get_profiles_by_token:
        | {
            Args: { _token: string }
            Returns: {
              birth_date: string
              profile_id: string
              profile_name: string
            }[]
          }
        | {
            Args: { _pin?: string; _token: string }
            Returns: {
              birth_date: string
              profile_id: string
              profile_name: string
            }[]
          }
      get_shared_profile_sections_by_token:
        | { Args: { _token: string }; Returns: Json }
        | { Args: { _pin?: string; _token: string }; Returns: Json }
      get_shared_sections_by_token:
        | { Args: { _token: string }; Returns: string[] }
        | { Args: { _pin?: string; _token: string }; Returns: string[] }
      get_vorsorge_data_by_token:
        | {
            Args: { _token: string }
            Returns: {
              data: Json
              is_for_partner: boolean
              person_profile_id: string
              profile_name: string
              section_key: string
            }[]
          }
        | {
            Args: { _pin?: string; _token: string }
            Returns: {
              data: Json
              is_for_partner: boolean
              person_profile_id: string
              profile_name: string
              section_key: string
            }[]
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_pin: { Args: { _pin: string }; Returns: string }
      hash_pin_secure: {
        Args: { _pin: string; _salt: string }
        Returns: string
      }
      user_has_access: { Args: { _user_id: string }; Returns: boolean }
      validate_share_token: {
        Args: { _token: string }
        Returns: {
          is_valid: boolean
          user_id: string
        }[]
      }
      validate_share_token_with_pin: {
        Args: { _pin: string; _token: string }
        Returns: {
          is_valid: boolean
          pin_valid: boolean
          remaining_attempts: number
          requires_pin: boolean
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
