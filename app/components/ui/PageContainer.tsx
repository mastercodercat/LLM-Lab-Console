"use client";
import {
  Container,
  Stack,
  Title,
  Group,
  Paper,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  subtitle?: string;
  fluid?: boolean;
}

export function PageContainer({
  children,
  title,
  actions,
  subtitle,
  fluid = false,
}: PageContainerProps) {
  const theme = useMantineTheme();
  return (
    <Container size="xl" px={fluid ? 0 : "md"} fluid={fluid}>
      <Stack gap="xl">
        {(title || actions) && (
          <Paper
            p="md"
            withBorder
            radius="md"
            className="page-header"
            style={{ ["--page-teal" as any]: theme.colors.teal[6] }}
          >
            <Group
              justify="space-between"
              align={subtitle ? "flex-start" : "center"}
            >
              <Stack gap="xs">
                <Title order={2} className="page-title-letter">
                  {title}
                </Title>
                {subtitle && (
                  <Text size="sm" c="dimmed">
                    {subtitle}
                  </Text>
                )}
              </Stack>
              {actions && <Group gap="sm">{actions}</Group>}
            </Group>
          </Paper>
        )}
        {children}
      </Stack>
    </Container>
  );
}
