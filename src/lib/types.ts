export type ModelId = "feto-auto" | "feto-fast" | "feto-vision" | "feto-custom";

export interface ModelOption {
  id: ModelId;
  name: string;
  provider: string;
  badge: string;
  description: string;
  contextWindow: string;
  speed: string;
  recommendedFor: string;
}

export interface WebCitation {
  index: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface DocumentCitation {
  chunkId: string;
  documentId: string;
  content: string;
  fileName: string;
  pageNumber: number;
  badgeText: string;
  rrfScore?: number;
  cosineDistance?: number;
  ftsRank?: number;
}

export interface PythonExecutionResult {
  code: string;
  stdout: string;
  stderr?: string;
  executionTimeMs: number;
  imageBase64?: string;
  images?: string[];
  chartType?: "bar" | "line" | "metric" | "table" | "matplotlib_png";
  chartData?: Array<{ label: string; value: number; secondary?: number }>;
  tableData?: Array<Record<string, string | number>>;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // For previews/images
  textPreview?: string;
}

export interface RagDiagnosticChunk {
  chunkId: string;
  documentId?: string;
  fileName: string;
  pageNumber?: number;
  contentSnippet: string;
  cosineSimilarity: number;
  keywordRank: number;
  rrfScore: number;
}

export interface MessageTelemetry {
  provider?: string;
  model: string;
  latencyMs: number;
  ttftMs?: number;
  tokensPerSec: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens?: number;
  routedVia: string;
  costEstimatedUsd?: number;
  ragDiagnostics?: RagDiagnosticChunk[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  thoughts?: string;
  traces?: string[];
  isStreaming?: boolean;
  isThinkingOpen?: boolean;
  citations?: WebCitation[];
  documentCitations?: DocumentCitation[];
  pythonExecution?: PythonExecutionResult;
  attachments?: FileAttachment[];
  telemetry?: MessageTelemetry;
  modeFlags?: {
    webSearch: boolean;
    deepRag: boolean;
    codeInterpreter: boolean;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: ModelId;
  messages: ChatMessage[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  size: string;
  type: "pdf" | "docx" | "txt" | "csv" | "xlsx";
  chunkCount: number;
  vectorId: string;
  status: "indexed" | "processing" | "ready";
  uploadedAt: string;
}

export interface UserCredits {
  used: number;
  total: number;
  plan: "Free" | "Pro";
  resetPeriod: string;
}

export interface UserApiKeys {
  groqKey: string;
  geminiKey: string;
  tavilyKey: string;
  supabaseUrl: string;
  supabaseKey: string;
  systemMemory?: string;
  customModelBaseUrl?: string;
  customModelName?: string;
  customModelApiKey?: string;
}

// Supabase Multi-Tenant Auth & Database Types
export interface UserProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_tier: "free" | "pro" | "enterprise";
  daily_credits_used: number;
  daily_credits_limit: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  planTier: "free" | "pro" | "enterprise";
  dailyCreditsUsed: number;
  dailyCreditsLimit: number;
  isGuest: boolean;
  customInstructions?: string;
}

export interface ChatConversationData {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageData {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments_json: any;
  tool_traces_json: any;
  citations_json: any;
  telemetry_json: any;
  created_at: string;
}
