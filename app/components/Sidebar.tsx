"use client";
import { AppShell, Stack, Title, Button, rem, Group } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconTestPipe,
  IconReportAnalytics,
  IconFlask,
} from "@tabler/icons-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppShell.Navbar p="md">
      <Stack>
        <Group gap="xs" mb="xl" hiddenFrom="sm" visibleFrom="xs">
          <IconTestPipe size={24} />
          <Title order={2} size="h3">
            LLM Console
          </Title>
        </Group>
        <Group gap="xs" mb="xl" visibleFrom="sm">
          <IconTestPipe size={28} />
          <Title order={2}>LLM Console</Title>
        </Group>
        <Button
          variant={pathname === "/" ? "filled" : "light"}
          onClick={() => router.push("/")}
          fullWidth
          leftSection={<IconFlask size={20} />}
        >
          Experiment
        </Button>
        <Button
          variant={pathname === "/reports" ? "filled" : "light"}
          onClick={() => router.push("/reports")}
          fullWidth
          leftSection={<IconReportAnalytics size={20} />}
        >
          Reports
        </Button>
      </Stack>
    </AppShell.Navbar>
  );
}
