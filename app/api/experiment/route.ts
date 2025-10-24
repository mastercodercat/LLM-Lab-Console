import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { generateResponse } from "../../lib/groq";
import { ExperimentConfig, ExperimentResponse } from "../../types";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      parameterSets,
    }: {
      prompt: string;
      parameterSets: Array<{
        temperature: number;
        topP: number;
        maxTokens: number;
      }>;
    } = body;

    const responses: ExperimentResponse[] = [];

    for (const params of parameterSets) {
      const config: ExperimentConfig = {
        prompt,
        ...params,
      };

      const result = await generateResponse(config);
      responses.push(result);
    }

    const experimentSet = await prisma.experimentSet.create({
      data: {
        prompt,
        timestamp: new Date(),
        parameterSpace: { parameterSets },
      },
    });

    for (const r of responses) {
      await prisma.response.create({
        data: {
          id: r.id,
          experimentSetId: experimentSet.id,
          prompt: r.prompt,
          response: r.response,
          temperature: r.temperature,
          topP: r.topP,
          maxTokens: r.maxTokens ?? 0,
          model: r.model ?? null,
          frequencyPenalty: r.frequencyPenalty ?? null,
          presencePenalty: r.presencePenalty ?? null,
          stop: (r.stop ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          seed: r.seed ?? null,
          rawParams: (r.rawParams ?? {}) as Prisma.InputJsonValue,
          timestamp:
            r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp),
          latencyMs: r.latencyMs ?? null,
          usage: (r.usage ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          metrics: r.metrics as any,
        },
      });
    }

    return NextResponse.json({ responses, experimentSetId: experimentSet.id });
  } catch (error) {
    console.error("Error processing experiment:", error);
    return NextResponse.json(
      { error: "Failed to process experiment" },
      { status: 500 }
    );
  }
}
