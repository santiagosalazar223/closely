export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "buyer" | "seller";
          avatar: string | null;
          bio: string | null;
          location: string | null;
          country: string | null;
          phone: string | null;
          verified: boolean;
          investment_range_min: number | null;
          investment_range_max: number | null;
          interested_categories: string[] | null;
          investment_experience: string | null;
          investment_type: string[] | null;
          business_count: number | null;
          linkedin_url: string | null;
          website_url: string | null;
          onboarding_completed: boolean;
          onboarding_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: "buyer" | "seller";
          avatar?: string | null;
          bio?: string | null;
          location?: string | null;
          country?: string | null;
          phone?: string | null;
          verified?: boolean;
          investment_range_min?: number | null;
          investment_range_max?: number | null;
          interested_categories?: string[] | null;
          investment_experience?: string | null;
          investment_type?: string[] | null;
          business_count?: number | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "buyer" | "seller";
          avatar?: string | null;
          bio?: string | null;
          location?: string | null;
          country?: string | null;
          phone?: string | null;
          verified?: boolean;
          investment_range_min?: number | null;
          investment_range_max?: number | null;
          interested_categories?: string[] | null;
          investment_experience?: string | null;
          investment_type?: string[] | null;
          business_count?: number | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Relationships: [
          {
            foreignKeyName: "businesses_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_images_business_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "business_images";
            referencedColumns: ["business_id"];
          }
        ];
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          short_description: string;
          category: string;
          subcategory: string | null;
          location: string;
          country: string;
          status: "active" | "pending" | "sold" | "draft";
          featured: boolean;
          views: number;
          saves: number;
          inquiries: number;
          percentage_for_sale: number;
          annual_revenue: number;
          annual_profit: number;
          asking_price: number;
          profit_margin: number;
          revenue_growth: number;
          employee_count: number;
          year_established: number;
          highlights: string[];
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          short_description: string;
          category: string;
          subcategory?: string | null;
          location: string;
          country: string;
          status?: "active" | "pending" | "sold" | "draft";
          featured?: boolean;
          views?: number;
          saves?: number;
          inquiries?: number;
          percentage_for_sale: number;
          annual_revenue: number;
          annual_profit: number;
          asking_price: number;
          profit_margin: number;
          revenue_growth: number;
          employee_count: number;
          year_established: number;
          highlights: string[];
          tags: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          short_description?: string;
          category?: string;
          subcategory?: string | null;
          location?: string;
          country?: string;
          status?: "active" | "pending" | "sold" | "draft";
          featured?: boolean;
          views?: number;
          saves?: number;
          inquiries?: number;
          percentage_for_sale?: number;
          annual_revenue?: number;
          annual_profit?: number;
          asking_price?: number;
          profit_margin?: number;
          revenue_growth?: number;
          employee_count?: number;
          year_established?: number;
          highlights?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      business_images: {
        Row: {
          id: string;
          business_id: string;
          url: string;
          alt: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          url: string;
          alt: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          url?: string;
          alt?: string;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_businesses: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          business_id: string;
          buyer_id: string;
          seller_id: string;
          status: "pending" | "accepted" | "rejected" | "expired";
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          buyer_id: string;
          seller_id: string;
          status?: "pending" | "accepted" | "rejected" | "expired";
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          buyer_id?: string;
          seller_id?: string;
          status?: "pending" | "accepted" | "rejected" | "expired";
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          business_id: string;
          buyer_id: string;
          seller_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          buyer_id: string;
          seller_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          buyer_id?: string;
          seller_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          text?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "match" | "message" | "view" | "save" | "inquiry";
          title: string;
          description: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "match" | "message" | "view" | "save" | "inquiry";
          title: string;
          description: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "match" | "message" | "view" | "save" | "inquiry";
          title?: string;
          description?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          properties: Json;
          path: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          properties?: Json;
          path?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          properties?: Json;
          path?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          rating: number | null;
          category: string | null;
          message: string;
          page: string | null;
          email: string | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          rating?: number | null;
          category?: string | null;
          message: string;
          page?: string | null;
          email?: string | null;
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          rating?: number | null;
          category?: string | null;
          message?: string;
          page?: string | null;
          email?: string | null;
          resolved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "enterprise";
          role: "buyer" | "seller";
          status: "active" | "cancelled" | "past_due" | "trialing";
          current_period_end: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: "free" | "pro" | "enterprise";
          role: "buyer" | "seller";
          status?: "active" | "cancelled" | "past_due" | "trialing";
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "pro" | "enterprise";
          role?: "buyer" | "seller";
          status?: "active" | "cancelled" | "past_due" | "trialing";
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_business_views: {
        Args: { business_id: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: "buyer" | "seller";
      business_status: "active" | "pending" | "sold" | "draft";
      match_status: "pending" | "accepted" | "rejected" | "expired";
      notification_type: "match" | "message" | "view" | "save" | "inquiry";
    };
    CompositeTypes: Record<string, never>;
  };
};
