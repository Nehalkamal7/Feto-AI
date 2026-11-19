"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser } from "./types";
import { getSupabaseClient, isSupabaseConfigured, deductCreditRpc } from "./supabaseClient";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  continueAsGuest: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAndDeductCredit: (cost?: number) => Promise<{ allowed: boolean; remaining: number }>;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_DEFAULT: AuthUser = {
  id: "guest_user",
  email: "guest@fetoai.local",
  fullName: "Guest Researcher",
  planTier: "free",
  dailyCreditsUsed: 0,
  dailyCreditsLimit: 5, // 5 free messages for guest
  isGuest: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    // 1. Check existing saved user session in localStorage or Supabase
    const initAuth = async () => {
      const supabase = getSupabaseClient();

      if (supabase && isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name || session.user.email?.split("@")[0] || "User",
                avatarUrl: profile.avatar_url,
                planTier: profile.plan_tier || "free",
                dailyCreditsUsed: profile.daily_credits_used || 0,
                dailyCreditsLimit: profile.daily_credits_limit || 15,
                isGuest: false,
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Supabase auth session check failed:", e);
        }
      }

      // Check localStorage for guest or demo user
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("feto_auth_user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
            setIsLoading(false);
            return;
          } catch {}
        }
      }

      // Default to guest user so the user can immediately experience FetoAI
      setUser(GUEST_DEFAULT);
      setIsLoading(false);
    };

    initAuth();

    // Setup Supabase auth state listener
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const authed: AuthUser = {
              id: session.user.id,
              email: session.user.email || "",
              fullName: profile?.full_name || session.user.email?.split("@")[0] || "User",
              avatarUrl: profile?.avatar_url,
              planTier: profile?.plan_tier || "free",
              dailyCreditsUsed: profile?.daily_credits_used || 0,
              dailyCreditsLimit: profile?.daily_credits_limit || 15,
              isGuest: false,
            };
            setUser(authed);
            localStorage.setItem("feto_auth_user", JSON.stringify(authed));
          } else if (event === "SIGNED_OUT") {
            setUser(GUEST_DEFAULT);
            localStorage.setItem("feto_auth_user", JSON.stringify(GUEST_DEFAULT));
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const continueAsGuest = () => {
    const guestUser: AuthUser = {
      ...GUEST_DEFAULT,
      id: `guest_${Date.now().toString(36)}`,
    };
    setUser(guestUser);
    localStorage.setItem("feto_auth_user", JSON.stringify(guestUser));
    closeAuthModal();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      closeAuthModal();
      setIsLoading(false);
      return { success: true };
    }

    // Demo Mode Simulated Sign In
    const authedUser: AuthUser = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email,
      fullName: email.split("@")[0],
      planTier: "free",
      dailyCreditsUsed: 0,
      dailyCreditsLimit: 15,
      isGuest: false,
    };
    setUser(authedUser);
    localStorage.setItem("feto_auth_user", JSON.stringify(authedUser));
    closeAuthModal();
    setIsLoading(false);
    return { success: true };
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      closeAuthModal();
      setIsLoading(false);
      return { success: true };
    }

    // Demo Mode Simulated Sign Up
    const newUser: AuthUser = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email,
      fullName: name || email.split("@")[0],
      planTier: "free",
      dailyCreditsUsed: 0,
      dailyCreditsLimit: 15,
      isGuest: false,
    };
    setUser(newUser);
    localStorage.setItem("feto_auth_user", JSON.stringify(newUser));
    closeAuthModal();
    setIsLoading(false);
    return { success: true };
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/chat` : undefined,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // Demo simulated Google Login
    const googleUser: AuthUser = {
      id: `usr_goog_${Date.now()}`,
      email: "engineer@enterprise.ai",
      fullName: "Alex Rivera",
      planTier: "free",
      dailyCreditsUsed: 0,
      dailyCreditsLimit: 15,
      isGuest: false,
    };
    setUser(googleUser);
    localStorage.setItem("feto_auth_user", JSON.stringify(googleUser));
    closeAuthModal();
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(GUEST_DEFAULT);
    localStorage.setItem("feto_auth_user", JSON.stringify(GUEST_DEFAULT));
  };

  const checkAndDeductCredit = async (cost = 1): Promise<{ allowed: boolean; remaining: number }> => {
    if (!user) return { allowed: false, remaining: 0 };

    // Pro is unlimited
    if (user.planTier === "pro" || user.planTier === "enterprise") {
      return { allowed: true, remaining: 999999 };
    }

    const newUsed = user.dailyCreditsUsed + cost;
    if (newUsed > user.dailyCreditsLimit) {
      return { allowed: false, remaining: 0 };
    }

    // Call Supabase RPC if logged in
    if (!user.isGuest && isSupabaseConfigured()) {
      deductCreditRpc(user.id, cost).catch(console.warn);
    }

    const updatedUser: AuthUser = {
      ...user,
      dailyCreditsUsed: newUsed,
    };
    setUser(updatedUser);
    localStorage.setItem("feto_auth_user", JSON.stringify(updatedUser));

    return {
      allowed: true,
      remaining: user.dailyCreditsLimit - newUsed,
    };
  };

  const upgradeToPro = () => {
    if (!user) return;
    const proUser: AuthUser = {
      ...user,
      planTier: "pro",
      dailyCreditsLimit: 999999,
      dailyCreditsUsed: 0,
    };
    setUser(proUser);
    localStorage.setItem("feto_auth_user", JSON.stringify(proUser));

    // Update Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase && !user.isGuest) {
      supabase
        .from("user_profiles")
        .update({ plan_tier: "pro" })
        .eq("id", user.id)
        .then();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && !user.isGuest),
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        continueAsGuest,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        checkAndDeductCredit,
        upgradeToPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
