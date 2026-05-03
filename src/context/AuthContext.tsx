"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { track, resetAnalyticsUser } from "@/lib/analytics";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string, role: "buyer" | "seller") => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabase();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data as Profile);
  }, [supabase]);

  useEffect(() => {
    // Safety timeout — never hang forever
    const timeout = setTimeout(() => setIsLoading(false), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          clearTimeout(timeout);
          setIsLoading(false);
        });
      } else {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) track("login_completed", {});
    return { error: error?.message ?? null };
  }, [supabase]);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: "buyer" | "seller"
  ) => {
    track("register_started", { role });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (!error) track("register_completed", { role });
    return { error: error?.message ?? null };
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    resetAnalyticsUser();
  }, [supabase]);

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    if (!supabaseUser) return { error: "No autenticado" };
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", supabaseUser.id);
    if (!error) await fetchProfile(supabaseUser.id);
    return { error: error?.message ?? null };
  }, [supabase, supabaseUser, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (supabaseUser) await fetchProfile(supabaseUser.id);
  }, [supabaseUser, fetchProfile]);

  return (
    <AuthContext.Provider value={{
      session,
      supabaseUser,
      profile,
      isAuthenticated: !!session && !!profile,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
