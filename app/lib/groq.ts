import axios, { AxiosError } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ExperimentConfig, ExperimentResponse } from "../types";
import { calculateMetrics } from "./metrics";

type GenerateOptions = {
  abortSignal?: AbortSignal;
  maxRetries?: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getProxyAgent() {
  const url = process.env.PROXY_URL;
  if (!url) return undefined;
  try {
    return new HttpsProxyAgent(url);
  } catch {
    return undefined;
  }
}

function isRetriableStatus(code?: number) {
  if (!code) return false;
  return code === 429 || (code >= 500 && code <= 599);
}

export async function generateResponse(
  config: ExperimentConfig,
  opts: GenerateOptions = {}
): Promise<ExperimentResponse> {
  const {
    prompt,
    temperature,
    topP,
    maxTokens,
    system,
    stop,
    frequencyPenalty,
    presencePenalty,
    seed,
    model = "llama-3.3-70b-versatile",
  } = config;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const proxyAgent = getProxyAgent();

  const maxRetries = opts.maxRetries ?? 3;
  let attempt = 0;

  while (true) {
    try {
      const started = Date.now();
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt },
          ],
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stop,
          seed,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          httpsAgent: proxyAgent,
          timeout: 60_000,
          signal: opts.abortSignal as AbortSignal,
          validateStatus: (s) => s >= 200 && s < 300,
        }
      );

      const latencyMs = Date.now() - started;
      const completion = res.data;
      const generatedText = completion?.choices?.[0]?.message?.content ?? "";
      const usage = completion?.usage ?? {};
      const metrics = calculateMetrics(generatedText, prompt);

      return {
        id: completion?.id ?? cryptoRandomId(),
        prompt,
        response: generatedText,
        temperature,
        topP,
        maxTokens,
        model,
        timestamp: new Date(),
        latencyMs,
        usage: {
          promptTokens: usage?.prompt_tokens ?? null,
          completionTokens: usage?.completion_tokens ?? null,
          totalTokens: usage?.total_tokens ?? null,
        },
        rawParams: {
          frequencyPenalty,
          presencePenalty,
          stop,
          seed,
        },
        metrics,
      };
    } catch (err) {
      const e = err as AxiosError;
      const code = e.response?.status;
      attempt++;

      if (axios.isCancel(err)) {
        throw new Error("Request canceled.");
      }
      if (e.code === "ECONNABORTED") {
        if (attempt > maxRetries) throw new Error("Timeout after retries.");
      }

      if (isRetriableStatus(code) && attempt <= maxRetries) {
        const base = 400;
        const delay =
          Math.min(4000, base * Math.pow(2, attempt - 1)) + Math.random() * 250;
        await sleep(delay);
        continue;
      }

      const msg = e.response?.data
        ? JSON.stringify(e.response.data)
        : e.message;
      console.error("Error calling Groq API:", msg);
      throw new Error(`Failed to generate response: ${code ?? ""} ${msg}`);
    }
  }
}

function cryptoRandomId() {
  return "loc_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
