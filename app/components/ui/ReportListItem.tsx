"use client";
import { useState, useMemo } from "react";
import {
  Paper,
  Group,
  Text,
  Badge,
  Button,
  Transition,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { IconFlask, IconClockHour4, IconArrowRight } from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";
import { useRouter } from "next/navigation";

interface ReportListItemProps {
  id: string;
  prompt: string;
  timestamp: string;
  responseCount?: number;
}

export function ReportListItem({
  id,
  prompt,
  timestamp,
  responseCount = 0,
}: ReportListItemProps) {
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formattedDate = useMemo(
    () =>
      new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [timestamp]
  );

  const onDetail = () => {
    setIsLoading(true);
    router.push(`/reports/${id}`);
  };

  return (
    <Paper
      ref={ref}
      p="lg"
      withBorder
      component="article"
      role="button"
      tabIndex={0}
      aria-label={`View report for ${prompt || "Untitled Experiment"}`}
      className={`report-item ${hovered ? "report-hovered" : ""}`}
      style={{ ["--report-violet" as any]: theme.colors.violet[6] }}
      onClick={onDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDetail();
        }
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs" className="report-stack">
          <Group>
            <div
              className="report-avatar"
              style={{ ["--report-violet" as any]: theme.colors.violet[6] }}
            >
              <IconFlask size={18} />
            </div>
            <Text fw={600} size="lg" truncate="end" className="report-title">
              {prompt || "Untitled Experiment"}
            </Text>
          </Group>

          <Group gap="md">
            <Group gap="xs">
              <IconClockHour4 size={16} className="report-clock" />
              <Text size="sm" c="dimmed">
                {formattedDate}
              </Text>
            </Group>
            {responseCount > 0 && (
              <Badge size="sm" variant="light" color="blue">
                {responseCount} {responseCount === 1 ? "Response" : "Responses"}
              </Badge>
            )}
          </Group>
        </Stack>

        <Transition mounted={hovered}>
          {() => (
            <Button
              variant="outline"
              color="violet"
              loading={isLoading}
              styles={{ root: { borderRadius: 10 } }}
              rightSection={!isLoading && <IconArrowRight size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                setIsLoading(true);
                router.push(`/reports/${id}`);
              }}
            >
              {isLoading ? "Opening..." : "View Report"}
            </Button>
          )}
        </Transition>
      </Group>
    </Paper>
  );
}
