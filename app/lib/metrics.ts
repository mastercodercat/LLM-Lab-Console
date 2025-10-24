/**
 * LLM Response Quality Metrics
 * ===========================
 *
 * This module implements a comprehensive set of metrics for evaluating LLM response quality.
 * Each metric is designed to capture different aspects of text quality and is normalized
 * to a 0-1 scale for consistency.
 *
 * Core Metrics
 * -----------
 *
 * 1. Coherence Score (30% weight by default)
 *    - Measures the logical flow and connection between sentences
 *    - Uses Jaccard similarity between adjacent sentences
 *    - Considers sentence-to-sentence transitions
 *    - Higher scores indicate better logical progression
 *    - Range: 0 (disconnected) to 1 (highly coherent)
 *
 * 2. Vocabulary Richness Score (25% weight by default)
 *    - Evaluates lexical diversity and sophistication
 *    - Calculates unique word ratio with adjustments
 *    - Considers word variety and repetition
 *    - Penalizes overuse of common words
 *    - Range: 0 (basic/repetitive) to 1 (diverse/sophisticated)
 *
 * 3. Length Score (20% weight by default)
 *    - Assesses response completeness
 *    - Based on word and sentence count
 *    - Uses dynamic thresholds based on prompt
 *    - Penalizes both too short and too long responses
 *    - Range: 0 (inadequate length) to 1 (optimal length)
 *
 * 4. Readability Score (15% weight by default)
 *    - Uses Flesch-Kincaid Grade Level
 *    - Adjusted for target complexity level
 *    - Considers sentence structure
 *    - Balances complexity and clarity
 *    - Range: 0 (inappropriate level) to 1 (optimal complexity)
 *
 * 5. Repetition Penalty (10% weight by default)
 *    - Detects and penalizes repeated phrases
 *    - Uses sliding window analysis
 *    - Considers context-appropriate repetition
 *    - Higher scores mean less problematic repetition
 *    - Range: 0 (high repetition) to 1 (optimal variation)
 *
 * Overall Score Calculation
 * ------------------------
 * - Weighted sum of individual metrics
 * - Weights are configurable via MetricWeights interface
 * - Default weights prioritize coherence and vocabulary
 * - Final score normalized to 0-100 scale
 * - Includes detailed breakdown in metrics.details
 *
 * Implementation Notes
 * -------------------
 * - Text normalization removes punctuation and case sensitivity
 * - Sentence splitting handles multiple terminators (.!?)
 * - Word tokenization preserves meaningful hyphenation
 * - Jaccard similarity used for semantic similarity
 * - All calculations optimized for real-time performance
 *
 * Usage Example:
 * ```typescript
 * const metrics = calculateMetrics(response, prompt, customWeights);
 * console.log(metrics.overallScore); // 0-100 score
 * console.log(metrics.details); // Detailed breakdown
 * ```
 */

import type { ResponseMetrics } from "../types";

// Internal metrics type that must match the exported ResponseMetrics interface
interface ComputedMetrics {
  coherenceScore: number;
  lengthScore: number;
  vocabularyRichnessScore: number;
  repetitionPenalty?: number;
  readabilityScore?: number;
  overallScore: number;
  details?: Record<string, string | number | boolean | null>;
}

type Weights = {
  coherence: number;
  length: number;
  vocab: number;
  repetition: number;
  readability: number;
};

const DEFAULT_WEIGHTS: Weights = {
  coherence: 0.3,
  length: 0.2,
  vocab: 0.25,
  repetition: 0.1,
  readability: 0.15,
};

function normalizeText(text: string): string {
  return text.toLowerCase();
}
function tokenizeWords(text: string): string[] {
  return normalizeText(text)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function sentences(text: string): string[] {
  const s = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return s.length ? s : [text.trim()].filter(Boolean);
}
function jaccard(a: Set<string>, b: Set<string>) {
  const inter = new Set([...a].filter((x) => b.has(x))).size;
  const uni = new Set([...a, ...b]).size || 1;
  return inter / uni;
}
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "for",
  "on",
  "with",
  "is",
  "are",
  "be",
  "as",
  "by",
  "that",
  "this",
  "it",
  "you",
  "your",
  "we",
  "our",
  "at",
  "from",
  "how",
  "what",
  "why",
  "when",
  "where",
  "which",
  "but",
  "if",
  "then",
  "so",
  "than",
  "can",
  "could",
  "should",
  "would",
  "about",
  "into",
  "over",
  "under",
  "more",
  "most",
  "some",
  "any",
  "such",
  "no",
  "not",
  "only",
  "own",
  "same",
  "too",
  "very",
]);
function contentWords(words: string[]): string[] {
  return words.filter((w) => !STOPWORDS.has(w) && w.length > 2);
}
function avg(a: number[]) {
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
}
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function clamp0to100(x: number) {
  return Math.max(0, Math.min(100, x));
}

function extractRequirements(prompt: string): string[] {
  // Capture bullet points, numbered steps, or imperative lines
  const lines = prompt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const reqs: string[] = [];

  for (const line of lines) {
    if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      reqs.push(line.replace(/^([-*•]|\d+\.)\s+/, ""));
      continue;
    }
    // Imperative sentences starting with verbs (simple heuristic)
    if (
      /^(write|create|explain|compare|list|design|implement|show|build|summarize|analyze|evaluate|provide|outline|generate)\b/i.test(
        line
      )
    ) {
      reqs.push(line);
    }
  }

  return reqs.length ? reqs : [prompt];
}

function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;

  const groups = w.replace(/e\b/g, "").match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 0);
}

function fkGrade(text: string): number {
  const sentsArr = sentences(text);
  const wordsArr = tokenizeWords(text);
  const words = wordsArr.length || 1;
  const sents = sentsArr.length || 1;
  const syllables = wordsArr.reduce((acc, w) => acc + syllableCount(w), 0);
  return 0.39 * (words / sents) + 11.8 * (syllables / words) - 15.59;
}
function readabilityScore(text: string): { score: number; grade: number } {
  const grade = fkGrade(text);
  const target = 10;
  const span = 6;
  const raw = 1 - Math.min(1, Math.abs(grade - target) / span);
  return { score: clamp01(raw), grade };
}

export function calculateMetrics(
  response: string,
  prompt: string,
  weights: Partial<Weights> = {}
): ResponseMetrics {
  const w = { ...DEFAULT_WEIGHTS, ...weights };

  const coherence = calculateCoherenceScore(response);
  const length = calculateLengthScore(response, prompt);
  const vocab = calculateVocabularyRichness(response);
  const repetition = repetitionPenaltyScore(response);
  const reqs = extractRequirements(prompt);
  const readability = readabilityScore(response);

  const weighted =
    coherence * w.coherence +
    length * w.length +
    vocab * w.vocab +
    repetition * w.repetition +
    readability.score * w.readability;

  const overall = clamp0to100(Math.round(weighted * 100));

  const metrics: ResponseMetrics = {
    coherenceScore: clamp01(coherence),
    lengthScore: clamp01(length),
    vocabularyRichnessScore: clamp01(vocab),
    repetitionPenalty: clamp01(repetition),
    readabilityScore: clamp01(readability.score),
    overallScore: overall,
    details: {
      sentenceCount: sentences(response).length,
      wordCount: tokenizeWords(response).length,
      requirements: reqs.join(", "),
      fkGrade: readability.grade,
    },
  };
  return metrics;
}

function calculateCoherenceScore(text: string): number {
  const sents = sentences(text);
  if (sents.length <= 1) {
    const tokens = tokenizeWords(text).length;
    return clamp01(tokens > 40 ? 0.6 : 0.5);
  }

  // Lexical cohesion
  const sims: number[] = [];
  for (let i = 0; i < sents.length - 1; i++) {
    const a = new Set(contentWords(tokenizeWords(sents[i])));
    const b = new Set(contentWords(tokenizeWords(sents[i + 1])));
    sims.push(jaccard(a, b));
  }
  const mean = avg(sims);
  const variance =
    sims.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / sims.length;
  const stability = 1 - Math.min(1, variance * 3);

  // Structure features
  const hasHeadings =
    /(^|\n)#{1,6}\s+\S|(^|\n)\d+\.\s+\S|(^|\n)[-•*]\s+\S/.test(text);
  const listLines = (text.match(/(^|\n)([-•*]|\d+\.)\s+\S/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  const avgSentPerPara = sents.length / Math.max(1, paragraphs.length);
  const paraPenalty = paragraphs.some((p) => p.length > 600 && !/\n/.test(p))
    ? 0.1
    : 0;

  const transLex = new Set([
    "however",
    "therefore",
    "thus",
    "consequently",
    "furthermore",
    "moreover",
    "meanwhile",
    "nevertheless",
    "alternatively",
    "additionally",
    "similarly",
    "conversely",
    "instead",
    "accordingly",
    "finally",
    "first",
    "second",
    "third",
    "overall",
    "in",
    "conclusion",
    "next",
  ]);
  const transCount = sents.reduce((acc, s) => {
    const w = tokenizeWords(s);
    return acc + (w.some((t) => transLex.has(t)) ? 1 : 0);
  }, 0);
  const transScore = Math.min(1, transCount / Math.max(1, sents.length - 1));

  const structureBonus =
    (hasHeadings ? 0.12 : 0) +
    Math.min(0.12, listLines * 0.02) +
    clamp01(1 - Math.abs(avgSentPerPara - 4) / 6) * 0.1;

  const cohesion = clamp01(
    0.6 * mean + 0.2 * stability + 0.1 * transScore + structureBonus
  );
  return clamp01(cohesion - paraPenalty);
}

function calculateLengthScore(text: string, prompt: string): number {
  const responseWords = tokenizeWords(text).length;
  const promptWords = tokenizeWords(prompt).length;

  if (responseWords === 0) return 0;

  const reqs = extractRequirements(prompt);
  const reqCount = Math.min(10, reqs.length || 1);
  const base = 100;
  const perReq = 60;
  const target = Math.max(60, Math.min(1200, base + perReq * reqCount));

  // Gaussian with adaptive sigma (wider tolerance for longer targets)
  const ratio = responseWords / target;
  const sigma = Math.min(0.9, 0.28 + 0.0004 * target);
  let score = Math.exp(-Math.pow(ratio - 1, 2) / (2 * sigma * sigma));

  if (responseWords < 40) score *= responseWords / 40;

  const hardMin = Math.floor(target * 0.5);
  const hardMax = Math.ceil(target * 1.8);
  let penalty = 0;
  if (responseWords < hardMin) penalty = (hardMin - responseWords) / hardMin;
  if (responseWords > hardMax) penalty = (responseWords - hardMax) / hardMax;

  // Structure bonus
  const sentCount = sentences(text).length;
  const paraCount = text.split(/\n\s*\n/).filter(Boolean).length || 1;
  const structureBonus = clamp01(sentCount / paraCount / 6);

  return clamp01(score * (1 - 0.6 * penalty) * (0.9 + 0.1 * structureBonus));
}

function calculateVocabularyRichness(text: string): number {
  const tokens = tokenizeWords(text);
  const words = contentWords(tokens);
  const N = words.length;
  if (N === 0) return 0;

  const unique = new Set(words).size;
  const ttr = unique / N;

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
  const hapax =
    Object.values(freq).filter((c) => c === 1).length / Math.max(1, unique);

  // Length normalization using logarithmic damping
  const lengthDamp = Math.min(1, Math.log10(N + 10) / 2);
  const base = clamp01(0.7 * ttr + 0.3 * hapax);
  const score = base * lengthDamp + 0.2 * (1 - lengthDamp);
  return clamp01(score);
}

function repetitionPenaltyScore(text: string): number {
  const w = tokenizeWords(text);
  if (w.length < 6) return 1;
  const bigrams: Record<string, number> = {};
  for (let i = 0; i < w.length - 1; i++) {
    const bg = w[i] + " " + w[i + 1];
    bigrams[bg] = (bigrams[bg] ?? 0) + 1;
  }
  const repeats = Object.values(bigrams)
    .filter((c) => c > 1)
    .reduce((a, b) => a + (b - 1), 0);
  const penalty = Math.min(1, repeats / Math.max(1, w.length / 12));
  return 1 - penalty;
}
