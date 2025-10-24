"use client";
import { Paper, Stack, Group, Badge, Text, SimpleGrid } from "@mantine/core";
import { ExperimentResponse } from "../types";
import { MetricCard } from "./ui/MetricCard";

interface ResponseCardProps {
  response: ExperimentResponse;
  overallIs0to100?: boolean;
}

function toPct(x: number | undefined | null, assumeZeroToOne = true): number {
  if (x == null || Number.isNaN(x)) return 0;
  if (!assumeZeroToOne && x > 1) return Math.max(0, Math.min(100, x));
  return Math.max(0, Math.min(100, x * 100));
}

export function ResponseCard({
  response,
  overallIs0to100 = false,
}: ResponseCardProps) {
  const m = response.metrics;
  const overallPct = overallIs0to100
    ? toPct(m.overallScore, false)
    : toPct(m.overallScore, true);

  const readabilityPct =
    m.readabilityScore != null ? toPct(m.readabilityScore) : null;
  const repetitionPct =
    m.repetitionPenalty != null ? toPct(m.repetitionPenalty) : null;

  const fkGrade =
    typeof m.details?.fkGrade === "number" ? m.details.fkGrade : null;
  const sentenceCount =
    typeof m.details?.sentenceCount === "number"
      ? m.details.sentenceCount
      : null;
  const wordCount =
    typeof m.details?.wordCount === "number" ? m.details.wordCount : null;

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Stack gap="xs">
          <Group gap="xs" wrap="wrap">
            <Badge variant="light" size="sm">
              Temperature: {response.temperature}
            </Badge>
            <Badge variant="light" size="sm">
              Top P: {response.topP}
            </Badge>
            <Badge variant="light" size="sm">
              Max Tokens: {response.maxTokens}
            </Badge>
            {response.model && (
              <Badge variant="light" size="sm">
                Model: {response.model}
              </Badge>
            )}
          </Group>

          <Group gap="xs" wrap="wrap">
            {typeof response.latencyMs === "number" && (
              <Badge color="grape" variant="light" size="sm">
                Latency: {Math.round(response.latencyMs)} ms
              </Badge>
            )}
            {response.usage?.totalTokens != null && (
              <Badge color="teal" variant="light" size="sm">
                Tokens: {response.usage.totalTokens}
              </Badge>
            )}
            <Text size="xs" c="dimmed">
              {new Date(response.timestamp).toLocaleString()}
            </Text>
          </Group>
        </Stack>

        <Paper p="sm" withBorder bg="gray.0">
          <Text className="prewrap">{response.response}</Text>
        </Paper>

        <SimpleGrid
          cols={{ base: 2, sm: 3, md: 4 }}
          spacing={{ base: "xs", sm: "md" }}
        >
          <MetricCard
            title="Overall Score"
            value={`${overallPct.toFixed(1)}%`}
          />
          <MetricCard
            title="Coherence"
            value={`${toPct(m.coherenceScore).toFixed(1)}%`}
          />
          <MetricCard
            title="Length"
            value={`${toPct(m.lengthScore).toFixed(1)}%`}
          />
          <MetricCard
            title="Vocabulary"
            value={`${toPct(m.vocabularyRichnessScore).toFixed(1)}%`}
          />
          {readabilityPct != null && (
            <MetricCard
              title="Readability"
              value={`${readabilityPct.toFixed(1)}%`}
            />
          )}
          {repetitionPct != null && (
            <MetricCard
              title="Repetition"
              value={`${repetitionPct.toFixed(1)}%`}
            />
          )}
        </SimpleGrid>

        {(fkGrade != null || sentenceCount != null || wordCount != null) && (
          <Group gap="sm" wrap="wrap">
            {fkGrade != null && (
              <Badge variant="outline" color="orange">
                FK Grade: {fkGrade.toFixed(1)}
              </Badge>
            )}
            {sentenceCount != null && (
              <Badge variant="outline" color="gray">
                Sentences: {sentenceCount}
              </Badge>
            )}
            {wordCount != null && (
              <Badge variant="outline" color="gray">
                Words: {wordCount}
              </Badge>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
