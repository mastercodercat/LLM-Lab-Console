import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

import { ExperimentSet, Prisma } from "@prisma/client";

interface ExperimentSetWithResponses extends ExperimentSet {
  responses: Array<{
    id: string;
    experimentSetId: string;
    prompt: string;
    response: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    model: string | null;
    frequencyPenalty: number | null;
    presencePenalty: number | null;
    stop: Prisma.JsonValue | null;
    seed: number | null;
    rawParams: Prisma.JsonValue | null;
    timestamp: Date;
    latencyMs: number | null;
    usage: Prisma.JsonValue | null;
    metrics: Prisma.JsonValue;
    createdAt: Date;
  }>;
}

function toCSV(set: ExperimentSetWithResponses) {
  const headers = [
    "responseId",
    "prompt",
    "response",
    "temperature",
    "topP",
    "maxTokens",
    "timestamp",
    "latencyMs",
    "promptTokens",
    "completionTokens",
    "totalTokens",
    "metrics_json",
  ];

  const rows = (set.responses || []).map((r) => {
    // Safely parse usage data
    let usage: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    } = {};
    try {
      usage = typeof r.usage === "string" ? JSON.parse(r.usage) : r.usage || {};
    } catch (e) {
      console.warn("Failed to parse usage data:", e);
    }

    // Safely parse metrics data
    let metrics: Record<string, unknown> = {};
    try {
      metrics =
        typeof r.metrics === "string" ? JSON.parse(r.metrics) : r.metrics || {};
    } catch (e) {
      console.warn("Failed to parse metrics data:", e);
    }

    // Format timestamp in ISO format
    const timestamp = r.timestamp ? new Date(r.timestamp).toISOString() : "";

    return [
      r.id || "",
      '"' + (r.prompt || "").replace(/"/g, '""') + '"',
      '"' + (r.response || "").replace(/"/g, '""') + '"',
      r.temperature?.toString() || "",
      r.topP?.toString() || "",
      r.maxTokens?.toString() || "",
      timestamp,
      r.latencyMs?.toString() || "",
      usage?.promptTokens?.toString() || "",
      usage?.completionTokens?.toString() || "",
      usage?.totalTokens?.toString() || "",
      '"' + JSON.stringify(metrics).replace(/"/g, '""') + '"',
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";

  try {
    const set = await prisma.experimentSet.findUnique({
      where: { id },
      include: { responses: true },
    });
    if (!set) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (format === "csv") {
      const csv = toCSV(set);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="experiment-${id}.csv"`,
        },
      });
    }

    return NextResponse.json({ set });
  } catch (err) {
    console.error("Export error", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to export";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
