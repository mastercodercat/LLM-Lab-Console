"use client";

import { Raleway, Geist_Mono } from "next/font/google";
import {
  MantineProvider,
  ColorSchemeScript,
  AppShell,
  Burger,
  Group,
  ActionIcon,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { Sidebar } from "./components/Sidebar";
import "@mantine/core/styles.css";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();
  const [colorScheme, setColorScheme] = useLocalStorage<"light" | "dark">({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: "light" | "dark") =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <html lang="en" data-mantine-color-scheme={colorScheme}>
      <head>
        <ColorSchemeScript />
        <title>LLM Lab Console</title>
        <meta
          name="description"
          content="LLM Lab Console — run experiments, collect responses and metrics."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${raleway.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider
          theme={
            {
              colorScheme: colorScheme,
              primaryColor: "blue",
              fontFamily: "var(--font-raleway)",
              fontFamilyMonospace: "var(--font-raleway)",
              headings: {
                fontFamily: "var(--font-raleway)",
                fontWeight: "600",
              },
              components: {
                Paper: {
                  defaultProps: {
                    radius: "md",
                  },
                },
                Button: {
                  defaultProps: {
                    radius: "md",
                  },
                },
                Badge: {
                  defaultProps: {
                    radius: "md",
                  },
                },
              },
            } as any
          }
        >
          <Notifications />
          <AppShell
            header={{ height: { base: 60, sm: 0 } }}
            navbar={{
              width: { base: 250 },
              breakpoint: "sm",
              collapsed: { mobile: !opened },
            }}
            padding="md"
          >
            <AppShell.Header hiddenFrom="sm" p="md">
              <Group justify="space-between">
                <Burger opened={opened} onClick={toggle} size="sm" />
                <Group gap="xs">
                  <span>LLM Lab Console</span>
                </Group>
              </Group>
            </AppShell.Header>
            <Sidebar />
            <AppShell.Main>{children}</AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
