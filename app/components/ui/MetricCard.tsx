"use client";
import {
  Paper,
  Text,
  Group,
  Stack,
  Tooltip,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon?: React.ComponentType<{
    size: number;
    stroke: number;
    style?: React.CSSProperties;
  }>;
  tooltipContent?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  icon = IconChartBar,
  tooltipContent,
}: MetricCardProps) {
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();
  const Icon = icon;

  const trend =
    previousValue !== undefined
      ? Number(value) > previousValue
        ? "up"
        : Number(value) < previousValue
        ? "down"
        : null
      : null;

  const trendColor =
    trend === "up" ? "teal" : trend === "down" ? "red" : "gray";
  const TrendIcon =
    trend === "up"
      ? IconTrendingUp
      : trend === "down"
      ? IconTrendingDown
      : null;

  const accent = theme.colors.teal[6];

  const cardContent = (
    <Paper
      p="lg"
      withBorder
      shadow={hovered ? "xl" : "sm"}
      radius="lg"
      ref={ref}
      role="group"
      tabIndex={0}
      aria-label={`Metric: ${title}, value ${value}`}
      className={`metric-card ${hovered ? "metric-hovered" : ""}`}
    >
      <Stack gap="xs" align="center">
        <Group gap="xs" align="center">
          <div
            className={`metric-icon ${hovered ? "metric-icon-hovered" : ""}`}
          >
            <span className="metric-icon-svg">
              <Icon size={18} stroke={1.5} />
            </span>
          </div>

          <Text
            size="xs"
            fw={600}
            tt="uppercase"
            c="dimmed"
            className={`metric-title ${hovered ? "metric-title-hovered" : ""}`}
          >
            {title}
          </Text>
        </Group>

        <Group gap="xs" align="center">
          <Text
            size="xl"
            fw={800}
            className={`metric-value ${hovered ? "metric-value-hovered" : ""}`}
          >
            {value}
          </Text>
          {TrendIcon && (
            <span
              className={`metric-trend ${
                trend === "up" ? "trend-up" : "trend-down"
              }`}
            >
              <TrendIcon size={16} />
            </span>
          )}
        </Group>
      </Stack>
    </Paper>
  );

  return tooltipContent ? (
    <Tooltip
      label={tooltipContent}
      position="top"
      withArrow
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
}
