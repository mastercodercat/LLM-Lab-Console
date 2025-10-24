"use client";
import {
  Paper,
  Title,
  Text,
  Group,
  Center,
  Stack,
  Button,
  useMantineTheme,
} from "@mantine/core";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { useMemo } from "react";
import { ExperimentResponse } from "../types";
import { IconInfoCircle } from "@tabler/icons-react";
import { ResponseCard } from "./ResponseCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface ResultsDisplayProps {
  responses: ExperimentResponse[];
  onExport?: () => void;
}

// Define the type for API responses
interface ApiResponse {
  id: string;
  temperature: number;
  topP: number;
  metrics: {
    overallScore: number;
    coherenceScore: number;
    lengthScore: number;
    vocabularyRichnessScore: number;
    readabilityScore?: number;
    repetitionPenalty?: number;
  };
}

function toPct(x: number | undefined | null, assumeZeroToOne = true): number {
  if (x == null || Number.isNaN(x)) return 0;
  // If overallScore might already be 0–100, keep it; otherwise scale
  if (!assumeZeroToOne && x > 1) return Math.max(0, Math.min(100, x));
  return Math.max(0, Math.min(100, x * 100));
}

export function ResultsDisplay({ responses, onExport }: ResultsDisplayProps) {
  const theme = useMantineTheme();

  const apiResponses: ApiResponse[] = responses.map((r) => ({
    id: r.id,
    temperature: r.temperature ?? 0,
    topP: r.topP ?? 0,
    metrics: r.metrics ?? {
      overallScore: 0,
      coherenceScore: 0,
      lengthScore: 0,
      vocabularyRichnessScore: 0,
    },
  }));

  const overallIs0to100 = useMemo(() => {
    const firstOverall = apiResponses[0]?.metrics?.overallScore ?? 0;
    return firstOverall > 1.5;
  }, [apiResponses]);

  const chartData = useMemo(() => {
    const labels = apiResponses.map(
      (r: ApiResponse) => `T:${r.temperature}/P:${r.topP}`
    );
    return {
      labels,
      datasets: [
        {
          label: "Overall",
          data: apiResponses.map((r: ApiResponse) =>
            overallIs0to100
              ? toPct(r.metrics.overallScore, false)
              : toPct(r.metrics.overallScore, true)
          ),
          borderColor: theme.colors.blue[6],
          tension: 0.2,
        },
        {
          label: "Coherence",
          data: apiResponses.map((r: ApiResponse) =>
            toPct(r.metrics.coherenceScore)
          ),
          borderColor: theme.colors.red[6],
          tension: 0.2,
        },
        {
          label: "Length",
          data: apiResponses.map((r: ApiResponse) =>
            toPct(r.metrics.lengthScore)
          ),
          borderColor: theme.colors.cyan[6],
          tension: 0.2,
        },
        {
          label: "Vocabulary",
          data: apiResponses.map((r: ApiResponse) =>
            toPct(r.metrics.vocabularyRichnessScore)
          ),
          borderColor: theme.colors.yellow[6],
          tension: 0.2,
        },
        ...(apiResponses.some(
          (r: ApiResponse) => r.metrics.readabilityScore != null
        )
          ? [
              {
                label: "Readability",
                data: apiResponses.map((r: ApiResponse) =>
                  toPct(r.metrics.readabilityScore ?? 0)
                ),
                borderColor: theme.colors.orange[6],
                tension: 0.2,
              },
            ]
          : []),
        ...(apiResponses.some(
          (r: ApiResponse) => r.metrics.repetitionPenalty != null
        )
          ? [
              {
                label: "Repetition (higher=better)",
                data: apiResponses.map((r: ApiResponse) =>
                  toPct(r.metrics.repetitionPenalty ?? 0)
                ),
                borderColor: theme.colors.teal[6],
                tension: 0.2,
              },
            ]
          : []),
      ],
    };
  }, [apiResponses, overallIs0to100, theme]);

  const chartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: false,
          text: "Metrics by Parameter Combo",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (tickValue: string | number) => `${tickValue}%`,
          },
        },
        x: {
          ticks: { maxRotation: 0, minRotation: 0 },
        },
      },
    }),
    []
  );

  if (!responses.length) {
    return (
      <Paper p="lg" withBorder radius="md" className="rd-paper-centered">
        <Center>
          <IconInfoCircle size={28} className="icon-violet" />
        </Center>
        <Title order={4} mt="sm">
          No results yet
        </Title>
        <Text size="sm" c="dimmed" mt="xs">
          Run an experiment using the form above to generate responses and
          metrics.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="xl">
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          Results Overview
        </Title>
        <div className="chart-box" aria-label="Experiment metrics chart">
          <Line data={chartData} options={chartOptions} />
        </div>
      </Paper>

      {responses.map((response) => (
        <ResponseCard
          key={response.id}
          response={response}
          overallIs0to100={overallIs0to100}
        />
      ))}

      {onExport && (
        <Group justify="flex-end">
          <Button onClick={onExport}>Export Results</Button>
        </Group>
      )}
    </Stack>
  );
}
