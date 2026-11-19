import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ChatConversationData, ChatMessageData, UserProfileData } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  // Check if browser has custom supabase settings in localStorage
  let url = supabaseUrl;
  let key = supabaseAnonKey;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("feto-user-keys");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.supabaseUrl && parsed.supabaseKey) {
          url = parsed.supabaseUrl;
          key = parsed.supabaseKey;
        }
      }
    } catch {}
  }

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
    }
  }

  return null;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Database persistence helpers with automatic offline / local fallback
export async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Error fetching user profile from Supabase:", err);
    return null;
  }
}

export async function deductCreditRpc(
  userId: string,
  cost = 1
): Promise<{ success: boolean; remaining?: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: true };
  }

  try {
    const { data, error } = await supabase.rpc("deduct_user_credit", {
      user_uuid: userId,
      cost,
    });

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.warn("RPC deduct_user_credit error:", err);
    return { success: true }; // Don't block user if offline/demo
  }
}

export async function persistConversation(
  userId: string,
  id: string,
  title: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  try {
    await supabase.from("conversations").upsert({
      id,
      user_id: userId,
      title,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Error persisting conversation to Supabase:", err);
  }
}

export async function persistMessage(
  conversationId: string,
  msg: {
    id?: string;
    role: string;
    content: string;
    attachments_json?: any;
    tool_traces_json?: any;
    citations_json?: any;
    telemetry_json?: any;
  }
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || !conversationId) return;

  try {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      attachments_json: msg.attachments_json || [],
      tool_traces_json: msg.tool_traces_json || {},
      citations_json: msg.citations_json || [],
      telemetry_json: msg.telemetry_json || {},
    });
  } catch (err) {
    console.warn("Error persisting message to Supabase:", err);
  }
}
