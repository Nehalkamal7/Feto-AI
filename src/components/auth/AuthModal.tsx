"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { FetoLogo } from "@/components/brand/FetoLogo";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    continueAsGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSignUp = authModalMode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);

    if (isSignUp) {
      const res = await signUpWithEmail(email, password, fullName);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to create account.");
      }
    } else {
      const res = await signInWithEmail(email, password);
      if (!res.success) {
        setErrorMsg(res.error || "Invalid credentials.");
      }
    }

    setIsSubmitting(false);
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setErrorMsg(res.error || "Google authentication failed.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8 shadow-2xl font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 p-1.5 rounded-md text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <FetoLogo size="sm" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white font-sans">
            {isSignUp ? "Create your FetoAI Account" : "Sign in to FetoAI"}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 font-mono">
            {isSignUp
              ? "Access 15 daily credits, saved chats & vector stores"
              : "Enterprise intelligence for research, code & data"}
          </p>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-xs font-mono text-black dark:text-white">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-black dark:text-white text-xs font-mono font-medium transition-colors shadow-xs"
        >
          <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            <span className="bg-white dark:bg-neutral-950 px-2">or with email</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 font-sans">
          {isSignUp && (
            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-xs font-mono text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-xs font-mono text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-xs font-mono text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 mt-2"
          >
            <span>{isSignUp ? "Create Free Account" : "Sign In to Workspace"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="mt-4 text-center text-xs font-mono text-neutral-500">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="underline text-black dark:text-white hover:opacity-80"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="underline text-black dark:text-white hover:opacity-80"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>

        {/* Distinct 'Continue as Guest' Option */}
        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full py-2.5 px-3 rounded-lg border border-dashed border-neutral-400 dark:border-neutral-700 hover:border-black dark:hover:border-neutral-400 text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors bg-neutral-50 dark:bg-neutral-900/40"
          >
            <div className="flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continue as Guest (5 Free Messages)</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Zero login required &bull; Test full workspace instantly
            </div>
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Supabase Auth &bull; Multi-Tenant Isolation &bull; TLS 1.3</span>
        </div>
      </div>
    </div>
  );
};
