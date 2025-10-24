"use client";

import { Paper, Text } from "@mantine/core";
import { ExportButtons } from "./ExportButtons";

export function ExportButtonsWrapper({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  return (
    <Paper p="md" withBorder>
      <Text size="sm" c="dimmed">
        {timestamp.toLocaleString()}
      </Text>
      <ExportButtons id={id} />
    </Paper>
  );
}
