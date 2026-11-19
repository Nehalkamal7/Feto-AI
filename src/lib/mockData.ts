import { ChatSession, KnowledgeDocument, ModelOption } from "./types";

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "feto-auto",
    name: "FetoAI Auto",
    provider: "Smart Routing",
    badge: "Recommended",
    description: "Dynamically routes queries between fast LPUs and multimodal engines for optimal cost and latency.",
    contextWindow: "128k tokens",
    speed: "~320 tok/sec",
    recommendedFor: "General research, hybrid RAG, and multi-turn workflows",
  },
  {
    id: "feto-fast",
    name: "FetoAI Fast",
    provider: "Llama 3.3 70B (Groq LPU)",
    badge: "Ultra Fast",
    description: "Instant sub-250ms time-to-first-token. Optimized for rapid coding, logic, and reasoning.",
    contextWindow: "128k tokens",
    speed: "550+ tok/sec",
    recommendedFor: "Code generation, algorithmic debugging, quick summarization",
  },
  {
    id: "feto-vision",
    name: "FetoAI Vision",
    provider: "Gemini 1.5 / 2.5 Flash",
    badge: "Multimodal",
    description: "High-accuracy image, chart, and document visual understanding with 1M context window.",
    contextWindow: "1M tokens",
    speed: "~180 tok/sec",
    recommendedFor: "Screenshots, UI design audits, financial charts, PDF parsing",
  },
  {
    id: "feto-custom",
    name: "Custom Fine-Tuned Model",
    provider: "Hugging Face / Together AI",
    badge: "Kaggle / Custom",
    description: "Connect your fine-tuned Kaggle weights hosted on Hugging Face Inference Endpoints, Together AI, or vLLM.",
    contextWindow: "Dynamic",
    speed: "Custom Endpoint",
    recommendedFor: "Domain-specific fine-tunes, specialized classification, Kaggle competitive models",
  },
];

export const INITIAL_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: "doc-1",
    title: "FetoAI_Unified_Intelligence_Whitepaper.pdf",
    size: "2.4 MB",
    type: "pdf",
    chunkCount: 38,
    vectorId: "vec_feto_9921",
    status: "indexed",
    uploadedAt: "2025-01-14",
  },
  {
    id: "doc-2",
    title: "Enterprise_SOC2_Compliance_Audit_2025.pdf",
    size: "4.1 MB",
    type: "pdf",
    chunkCount: 64,
    vectorId: "vec_soc2_4412",
    status: "indexed",
    uploadedAt: "2025-01-12",
  },
  {
    id: "doc-3",
    title: "Q4_Cloud_Infrastructure_Costs_Breakdown.xlsx",
    size: "820 KB",
    type: "xlsx",
    chunkCount: 18,
    vectorId: "vec_cloud_7720",
    status: "indexed",
    uploadedAt: "2025-01-08",
  },
  {
    id: "doc-4",
    title: "Microservices_Architecture_Specs_v2.docx",
    size: "1.1 MB",
    type: "docx",
    chunkCount: 26,
    vectorId: "vec_arch_3319",
    status: "indexed",
    uploadedAt: "2025-01-02",
  },
];

export const DEFAULT_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Live Web Synthesis: LLM Frontier Benchmarks",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: "feto-auto",
    messages: [
      {
        id: "msg-1-u",
        role: "user",
        content: "Synthesize the latest benchmarks comparing Llama 3.3 70B, DeepSeek-V3, and Claude 3.5 Sonnet on MMLU-Pro, HumanEval, and cost per million tokens.",
        timestamp: "10:14 AM",
        modeFlags: {
          webSearch: true,
          deepRag: false,
          codeInterpreter: false,
        },
      },
      {
        id: "msg-1-a",
        role: "assistant",
        content: `### Frontier LLM Comparative Evaluation (2025)

Based on synthesized real-time benchmark repositories and technical evals [1], [2], here is the structured comparison between **Llama 3.3 70B**, **DeepSeek-V3**, and **Claude 3.5 Sonnet**:

| Model | MMLU-Pro (Reasoning) | HumanEval (Coding) | Input ($/M Tok) | Output ($/M Tok) | Provider Infrastructure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Claude 3.5 Sonnet** | **84.8%** | **93.7%** | \$3.00 | \$15.00 | Anthropic API [1] |
| **DeepSeek-V3 (FP8)** | 82.6% | 89.2% | \$0.14 | \$0.28 | Decentralized Cluster [2] |
| **Llama 3.3 70B** | 80.4% | 86.8% | **\$0.05** (Groq/Free) | **\$0.08** | Groq LPUs / Open Weights [1] |

#### Key Strategic Insights:
1. **Coding & Multi-Step Logic**: Claude 3.5 Sonnet holds a marginal lead on raw HumanEval and SWE-bench, but DeepSeek-V3 achieves 95% of its performance at **< 5% of the API cost** [2].
2. **Groq LPU Acceleration**: Llama 3.3 hosted on LPUs delivers unprecedented inference speeds (~550 tokens/sec), making it optimal for interactive agentic loops where latency dominates [1].
3. **Enterprise Recommendation**: Use **FetoAI Auto Routing** to invoke Llama 3.3 for code transformations and intermediate drafts, while delegating complex zero-shot architectural proofs to frontier reasoning.`,
        timestamp: "10:14 AM",
        thoughts: "Analyzed benchmark query. Activated live web synthesis over 4 real-time sources (Artificial Analysis, LMSYS Arena, PapersWithCode). Formatted markdown comparison table with exact price-to-performance metrics.",
        traces: [
          "Evaluating query intent & multi-tenant credit quota (Cost: 2 credits)...",
          "Searching live web via DuckDuckGo (Zero-Cost Engine)...",
          "Retrieved 3 verified sources and extracted key token economics",
          "Routing to Groq LPU (llama-3.3-70b-versatile) for low-latency synthesis...",
          "Stream completed with 462 tok/sec throughput"
        ],
        citations: [
          {
            index: 1,
            title: "Artificial Analysis — LLM Quality & Speed Index 2025",
            url: "https://artificialanalysis.ai/models/llama-3-3-70b",
            domain: "artificialanalysis.ai",
            snippet: "Llama 3.3 70B demonstrates near-flagship performance matching original Llama 3 405B quality while drastically reducing inference hardware overhead on Groq LPUs.",
          },
          {
            index: 2,
            title: "LMSYS Chatbot Arena Leaderboard Real-Time Rankings",
            url: "https://chat.lmsys.org",
            domain: "chat.lmsys.org",
            snippet: "DeepSeek-V3 and Claude 3.5 Sonnet occupy top percentile ELO brackets across coding and multi-turn technical evaluation prompts.",
          },
          {
            index: 3,
            title: "PapersWithCode: MMLU-Pro & HumanEval Frontier Leaderboard",
            url: "https://paperswithcode.com",
            domain: "paperswithcode.com",
            snippet: "Benchmark aggregations tracking speculative decoding gains and hardware inference efficiency.",
          },
        ],
        telemetry: {
          model: "FetoAI Auto (Groq LPU + Live Search)",
          latencyMs: 312,
          tokensPerSec: 462,
          promptTokens: 420,
          completionTokens: 384,
          routedVia: "LPU Fast Inference Cluster",
        },
      },
    ],
  },
  {
    id: "session-2",
    title: "Python Sandbox: Cloud Spend Anomaly Analysis",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    model: "feto-fast",
    messages: [
      {
        id: "msg-2-u",
        role: "user",
        content: "Run a python script to simulate our monthly AWS/GCP infrastructure expenditure across Compute, Storage, Networking, and AI GPU clusters. Show the trend and highlight anomalies.",
        timestamp: "08:30 AM",
        modeFlags: {
          webSearch: false,
          deepRag: false,
          codeInterpreter: true,
        },
      },
      {
        id: "msg-2-a",
        role: "assistant",
        content: `I've executed the cloud infrastructure cost model in the **FetoAI Python Sandbox**.

### Key Observations:
- **AI GPU Cluster (H100/A100)** exhibited an exponential **+240% spike** starting in Q3 due to continuous batch inference scaling.
- **Compute (EC2/GKE)** stabilized around \$42,000/mo after Spot instance migration.
- **Projected Q4 Cost**: \$184,200 (vs budgeted \$135,000). Immediate recommendation: enable dynamic model tiering and KV-cache compression.`,
        timestamp: "08:31 AM",
        thoughts: "Parsed infrastructure simulation request. Initialized in-memory NumPy/Pandas computation engine. Calculated monthly distributions and generated visual breakdown.",
        traces: [
          "Detected Code Interpreter intent (Cost: 3 credits)...",
          "Initializing Python 3.12 sandbox microVM...",
          "Sandbox execution completed in 44ms (Exit code: 0)",
          "Routing to Groq LPU (llama-3.3-70b-versatile) for analysis..."
        ],
        pythonExecution: {
          code: `import numpy as np
import pandas as pd

# Cloud spend breakdown (in $1,000 USD)
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
compute = [42.1, 41.8, 43.0, 42.5, 41.2, 42.8, 43.4, 44.1, 42.9, 43.5]
storage = [18.2, 18.5, 19.1, 19.4, 19.8, 20.2, 20.9, 21.4, 22.0, 22.8]
ai_gpus = [12.0, 14.5, 18.2, 24.0, 31.5, 42.0, 58.0, 74.5, 96.0, 118.0]

total_spend = np.array(compute) + np.array(storage) + np.array(ai_gpus)
peak_month = months[np.argmax(total_spend)]
print(f"Total 10-Month Spend: \${np.sum(total_spend):,.1f}k")
print(f"Peak Spend Month: {peak_month} (\${np.max(total_spend):,.1f}k)")
print(f"AI GPU CAGR: +{((ai_gpus[-1]/ai_gpus[0])**(1/9) - 1)*100:.1f}% per month")`,
          stdout: `Total 10-Month Spend: $714.3k\nPeak Spend Month: Oct ($184.3k)\nAI GPU CAGR: +28.9% per month\n[STATUS: Sandbox Execution Successful (Exit code: 0)]`,
          executionTimeMs: 44,
          chartType: "bar",
          chartData: [
            { label: "Jan", value: 72.3, secondary: 12.0 },
            { label: "Mar", value: 80.3, secondary: 18.2 },
            { label: "May", value: 92.5, secondary: 31.5 },
            { label: "Jul", value: 122.3, secondary: 58.0 },
            { label: "Sep", value: 160.9, secondary: 96.0 },
            { label: "Oct", value: 184.3, secondary: 118.0 },
          ],
        },
        telemetry: {
          model: "FetoAI Fast (Llama 3.3 Python Engine)",
          latencyMs: 142,
          tokensPerSec: 512,
          promptTokens: 280,
          completionTokens: 245,
          routedVia: "Isolated MicroVM Sandbox",
        },
      },
    ],
  },
  {
    id: "session-3",
    title: "Hybrid Document RAG: SOC2 Security Posture",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    model: "feto-auto",
    messages: [
      {
        id: "msg-3-u",
        role: "user",
        content: "What are our encryption standards in transit and at rest according to our indexed SOC2 compliance document?",
        timestamp: "Yesterday",
        modeFlags: {
          webSearch: false,
          deepRag: true,
          codeInterpreter: false,
        },
      },
      {
        id: "msg-3-a",
        role: "assistant",
        content: `According to the indexed **Enterprise SOC2 Compliance Audit (Section 4.2 - Cryptographic Controls)** [1]:

### 1. Data in Transit:
- **Mandatory TLS 1.3**: All external and ingress endpoints enforce TLS 1.3 with forward secrecy (ECDHE-RSA-AES128-GCM-SHA256 minimum cipher suite) [1].
- **Mutual TLS (mTLS)**: Enforced for all inter-microservice communication inside the Kubernetes service mesh.
- **HSTS Header**: Strict-Transport-Security enforced with \`max-age=63072000; includeSubDomains; preload\`.

### 2. Data at Rest:
- **AES-256-GCM**: Applied across all persistent block stores, PostgreSQL instances, and object storage buckets [2].
- **KMS Envelope Encryption**: Keys rotated automatically every 90 days with AWS/GCP Cloud KMS hardware security modules (FIPS 140-3 Level 3 validated).
- **Ephemeral Sandbox Storage**: User upload artifacts in temporary execution microVMs are scrubbed using zero-fill memory wipes upon task termination.`,
        timestamp: "Yesterday",
        thoughts: "Queried Supabase vector index with cosine similarity threshold 0.82. Found 3 matching chunks from Enterprise_SOC2_Compliance_Audit_2025.pdf. Verified TLS & AES-256 cryptographic compliance standards.",
        traces: [
          "Verifying RAG quota (Cost: 2 credits)...",
          "Generating 384-dimensional query embedding...",
          "Executing Supabase hybrid_search_chunks RRF...",
          "Retrieved 2 verified document chunks with similarity > 0.88",
          "Synthesized compliance response"
        ],
        citations: [
          {
            index: 1,
            title: "Enterprise_SOC2_Compliance_Audit_2025.pdf [Chunk #14]",
            url: "#knowledge-base",
            domain: "Internal Knowledge Base",
            snippet: "Section 4.2.1: Data in transit across public networks must utilize TLS 1.3 with strong ciphers. Deprecated protocols (TLS 1.0, 1.1) are rejected at edge load balancers.",
          },
          {
            index: 2,
            title: "Enterprise_SOC2_Compliance_Audit_2025.pdf [Chunk #19]",
            url: "#knowledge-base",
            domain: "Internal Knowledge Base",
            snippet: "Section 4.2.4: Storage volumes and vector database collections are encrypted with customer-managed keys (CMK) using AES-256-GCM envelope encryption.",
          },
        ],
        telemetry: {
          model: "FetoAI Auto (Hybrid Vector RAG)",
          latencyMs: 198,
          tokensPerSec: 388,
          promptTokens: 610,
          completionTokens: 295,
          routedVia: "pgvector Index (Cosine: 0.88)",
        },
      },
    ],
  },
];
