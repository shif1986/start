export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      favorites: {
        Row: { created_at: string; listing_id: string; user_id: string };
        Insert: { created_at?: string; listing_id: string; user_id: string };
        Update: { created_at?: string; listing_id?: string; user_id?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"];
          account_type: Database["public"]["Enums"]["account_type"];
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          created_at: string;
          display_name: string;
          id: string;
          is_verified: boolean;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
          username: string;
        };
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"];
          account_type?: Database["public"]["Enums"]["account_type"];
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          is_verified?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          username: string;
        };
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"];
          account_type?: Database["public"]["Enums"]["account_type"];
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          display_name?: string;
          id?: string;
          is_verified?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      profile_contacts: {
        Row: { profile_id: string; phone: string | null; public_email: string | null; postal_address: string | null; updated_at: string };
        Insert: { profile_id: string; phone?: string | null; public_email?: string | null; postal_address?: string | null; updated_at?: string };
        Update: { phone?: string | null; public_email?: string | null; postal_address?: string | null; updated_at?: string };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          position: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          position?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          position?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          category_id: string;
          city: string;
          condition: string | null;
          country_code: string;
          created_at: string;
          currency: string;
          description: string;
          id: string;
          is_featured: boolean;
          latitude: number | null;
          longitude: number | null;
          owner_id: string;
          postal_code: string | null;
          price: number | null;
          published_at: string | null;
          rejection_reason: string | null;
          slug: string;
          status: Database["public"]["Enums"]["listing_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          city: string;
          condition?: string | null;
          country_code?: string;
          created_at?: string;
          currency?: string;
          description: string;
          id?: string;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          owner_id: string;
          postal_code?: string | null;
          price?: number | null;
          published_at?: string | null;
          rejection_reason?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          height: number | null;
          id: string;
          listing_id: string;
          position: number;
          storage_path: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          height?: number | null;
          id?: string;
          listing_id: string;
          position?: number;
          storage_path: string;
          width?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["listing_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_comments: {
        Row: { id: string; listing_id: string; author_id: string; body: string; is_hidden: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; listing_id: string; author_id: string; body: string; is_hidden?: boolean; created_at?: string; updated_at?: string };
        Update: { body?: string; is_hidden?: boolean; updated_at?: string };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          code: string;
          created_at: string;
          currency: string;
          id: string;
          interval: Database["public"]["Enums"]["subscription_interval"];
          is_active: boolean;
          name: string;
          position: number;
          price_cents: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          currency?: string;
          id?: string;
          interval: Database["public"]["Enums"]["subscription_interval"];
          is_active?: boolean;
          name: string;
          position?: number;
          price_cents: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          currency?: string;
          interval?: Database["public"]["Enums"]["subscription_interval"];
          is_active?: boolean;
          name?: string;
          position?: number;
          price_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_id: string;
          provider: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_id: string;
          provider: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          plan_id?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_active_professional_subscription: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      search_listings_v2: {
        Args: {
          category_slug?: string | null;
          city_query?: string | null;
          country_filter?: string | null;
          max_price?: number | null;
          min_price?: number | null;
          page_offset?: number;
          page_size?: number;
          search_query?: string | null;
          sort_order?: string;
          subdivision_filter?: string | null;
        };
        Returns: {
          category_name: string;
          category_slug: string;
          city: string;
          condition: string | null;
          country_code: string;
          cover_storage_path: string | null;
          currency: string;
          description: string;
          id: string;
          is_favorite: boolean;
          is_featured: boolean;
          latitude: number | null;
          longitude: number | null;
          price: number | null;
          published_at: string;
          slug: string;
          subdivision_code: string | null;
          subdivision_name: string | null;
          title: string;
          total_count: number;
        }[];
      };
      get_listing_detail: {
        Args: { listing_slug: string };
        Returns: {
          category_id: string;
          category_name: string;
          category_slug: string;
          city: string;
          condition: string | null;
          country_code: string;
          currency: string;
          description: string;
          id: string;
          images: Json;
          is_favorite: boolean;
          latitude: number | null;
          longitude: number | null;
          owner_id: string;
          price: number | null;
          published_at: string | null;
          seller_avatar_url: string | null;
          seller_bio: string | null;
          seller_city: string | null;
          seller_display_name: string;
          seller_email: string | null;
          seller_is_verified: boolean;
          seller_phone: string | null;
          seller_postal_address: string | null;
          seller_username: string;
          slug: string;
          status: Database["public"]["Enums"]["listing_status"];
          subdivision_code: string | null;
          subdivision_name: string | null;
          title: string;
        }[];
      };
    };
    Enums: {
      account_status: "active" | "suspended";
      account_type: "customer" | "professional";
      field_type: "text" | "textarea" | "number" | "select" | "multi_select" | "checkbox" | "boolean" | "date" | "price" | "url";
      listing_status: "draft" | "pending" | "published" | "rejected" | "sold" | "archived";
      report_reason: "scam" | "forbidden_content" | "spam" | "wrong_category" | "counterfeit" | "already_sold" | "other";
      report_status: "open" | "reviewing" | "resolved" | "dismissed";
      user_role: "user" | "moderator" | "admin";
      subscription_interval: "monthly" | "yearly";
      subscription_status: "incomplete" | "trialing" | "active" | "past_due" | "canceled" | "unpaid";
    };
    CompositeTypes: Record<string, never>;
  };
};
