export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
    };
    Views: Record<string, never>;
    Functions: {
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
      account_type: "customer" | "professional";
      field_type: "text" | "textarea" | "number" | "select" | "multi_select" | "checkbox" | "boolean" | "date" | "price" | "url";
      listing_status: "draft" | "pending" | "published" | "rejected" | "sold" | "archived";
      report_reason: "scam" | "forbidden_content" | "spam" | "wrong_category" | "counterfeit" | "already_sold" | "other";
      report_status: "open" | "reviewing" | "resolved" | "dismissed";
      user_role: "user" | "moderator" | "admin";
    };
    CompositeTypes: Record<string, never>;
  };
};
