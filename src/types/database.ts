// Generated types placeholder — will be replaced by supabase gen types command
// These types mirror the database schema for development ergonomics

import type { Category, Role } from "@/types";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          status: "pending" | "approved" | "rejected";
          role: Role | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          role?: Role | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          role?: Role | null;
          created_at?: string;
        };
      };
      gds: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          weekday: number | null;
          start_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          active?: boolean;
          weekday?: number | null;
          start_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          active?: boolean;
          weekday?: number | null;
          start_time?: string | null;
          created_at?: string;
        };
      };
      gd_staff: {
        Row: {
          gd_id: string;
          profile_id: string;
        };
        Insert: {
          gd_id: string;
          profile_id: string;
        };
        Update: {
          gd_id?: string;
          profile_id?: string;
        };
      };
      people: {
        Row: {
          id: string;
          gd_id: string;
          name: string;
          category: Category;
          member_since: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gd_id: string;
          name: string;
          category: Category;
          member_since?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gd_id?: string;
          name?: string;
          category?: Category;
          member_since?: string | null;
          created_at?: string;
        };
      };
      weeks: {
        Row: {
          id: string;
          gd_id: string;
          date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gd_id: string;
          date: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gd_id?: string;
          date?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          week_id: string;
          person_id: string;
          category_at_time: Category;
        };
        Insert: {
          week_id: string;
          person_id: string;
          category_at_time: Category;
        };
        Update: {
          week_id?: string;
          person_id?: string;
          category_at_time?: Category;
        };
      };
    };
  };
}
