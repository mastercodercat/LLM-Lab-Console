// types.ts

// Metric weights (can be saved per experiment so users can re-rank later)
export interface MetricWeights {
  coherence: number; // 0–1 multiplier
  length: number; // 0–1 multiplier
  vocab: number; // 0–1 multiplier
  repetition?: number; // optional if you enable it in your metrics engine
  readability?: number; // optional if you enable readability
}

// Rich metrics returned by the analyzer.
// Keep existing keys for compatibility, add new ones as optional.
export interface ResponseMetrics {
  coherenceScore: number; // 0–1
  lengthScore: number; // 0–1
  vocabularyRichnessScore: number; // 0–1
  overallScore: number; // 0–100

  // Optional extended metrics
  repetitionPenalty?: number; // 0–1 (higher is better)
  readabilityScore?: number; // 0–1

  // Extra info for tooltips/diagnostics
  details?: Record<string, any>;
}

// Shape of a single LLM call result
export interface ExperimentResponse {
  id: string;
  prompt: string;
  response: string;

  // Parameters used for this call
  temperature: number;
  topP: number;
  maxTokens: number;

  // Optional extras (safe to ignore in existing UI)
  model?: string;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[] | null;
  seed?: number | null;
  rawParams?: Record<string, unknown>;

  // Observability
  timestamp: Date;
  latencyMs?: number | null;
  usage?: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
  };

  // Computed metrics
  metrics: ResponseMetrics;
}

// Config for generating a single response (used by your adapter)
export interface ExperimentConfig {
  prompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;

  // Optional extras (thread these to your adapter if supported)
  model?: string;
  system?: string;
  stop?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;
  seed?: number;
  weights?: Partial<MetricWeights>;
}

// A collection of responses for a single prompt and parameter sweep
export interface ExperimentSet {
  id: string;
  prompt: string;
  timestamp: Date;

  // Optional context to display in headers or export
  title?: string;
  notes?: string;
  model?: string;
  weights?: Partial<MetricWeights>;
  parameterSpace?: Record<string, unknown>; // e.g., ranges used

  responses: ExperimentResponse[];

  // Optional sharing/export metadata
  meta?: ExperimentMeta;
}

// Optional metadata to help with persistence/sharing
export interface ExperimentMeta {
  version?: string; // schema version
  createdBy?: string; // user/email or "anonymous"
  userAgent?: string; // client UA string
  shareToken?: string; // opaque read-only token for permalinks
}

// Export payloads for downloads
export interface ExportPayloadJSON {
  type: "application/json";
  fileName: string; // e.g., experiment_<id>.json
  data: ExperimentSet;
}

export interface ExportPayloadCSV {
  type: "text/csv";
  fileName: string; // e.g., responses_<id>.csv
  // Rows include params, metrics, latency, usage, and text
  csv: string;
}
