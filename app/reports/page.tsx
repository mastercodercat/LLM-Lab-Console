"use client";
import { useEffect, useState } from "react";
import { Title, Paper, Stack, Text, Anchor, Button } from "@mantine/core";
import Link from "next/link";
import { ReportListItem } from "../components/ui/ReportListItem";
import { PageContainer } from "../components/ui/PageContainer";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

type ReportSummary = {
  id: string;
  prompt: string;
  timestamp: string;
  responses: Array<{ id: string; timestamp: string }>;
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        if (!mounted) return;
        setReports(data.sets ?? []);
      } catch (err) {
        console.error("Failed to load reports", err);
        if (mounted)
          setError("Unable to load reports. Please try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageContainer
      title="Experiment Reports"
      subtitle="View and analyze your experiment results"
    >
      <Paper p="md" withBorder>
        {loading ? (
          <LoadingSpinner
            text="Loading reports..."
            withBackground
            size="lg"
            aria-live="polite"
          />
        ) : error ? (
          <Stack align="center" py="xl" gap="md">
            <Text size="lg" fw={500} c="red">
              {error}
            </Text>
          </Stack>
        ) : reports.length === 0 ? (
          <Stack align="center" py="xl" gap="md">
            <Text size="lg" fw={500} c="dimmed">
              No reports yet
            </Text>
            <Text c="dimmed">
              Run an experiment to create your first report
            </Text>
            <Button component={Link} href="/experiment" variant="light">
              Create Experiment
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            {reports.map((r) => (
              <ReportListItem
                key={r.id}
                id={r.id}
                prompt={r.prompt}
                timestamp={r.timestamp}
                responseCount={r.responses.length}
              />
            ))}
          </Stack>
        )}
      </Paper>
    </PageContainer>
  );
}
