import { Container, Title, Stack, Text } from "@mantine/core";
import prisma from "../../../lib/prisma";
import { ResultsDisplay } from "../../components/ResultsDisplay";
import { ExportButtonsWrapper } from "../../components/ExportButtonsWrapper";
import type { ExperimentResponse, ResponseMetrics } from "../../types";

type Props = { params: { id: string } };

export default async function ReportDetail({ params }: Props) {
  const { id } = await params;

  const set = await prisma.experimentSet.findUnique({
    where: { id },
    include: { responses: true },
  });
  if (!set) {
    return (
      <Container>
        <Text>Report not found</Text>
      </Container>
    );
  }

  const responses = (set.responses || []).map(
    (r): ExperimentResponse => ({
      id: r.id,
      prompt: r.prompt,
      response: r.response,
      temperature: r.temperature,
      topP: r.topP,
      maxTokens: r.maxTokens,
      model: r.model || undefined,
      timestamp: new Date(r.timestamp),
      latencyMs: r.latencyMs,
      usage: r.usage
        ? (r.usage as {
            promptTokens: number | null;
            completionTokens: number | null;
            totalTokens: number | null;
          })
        : undefined,
      metrics: r.metrics
        ? (r.metrics as unknown as ResponseMetrics)
        : {
            coherenceScore: 0,
            lengthScore: 0,
            vocabularyRichnessScore: 0,
            overallScore: 0,
          },
    })
  );

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Title order={2}>{set.title ?? "Experiment Report"}</Title>
        <Title order={3}>Prompt: {responses[0].prompt}</Title>
        <ExportButtonsWrapper id={id} timestamp={new Date(set.timestamp)} />

        <ResultsDisplay responses={responses} />
      </Stack>
    </Container>
  );
}
