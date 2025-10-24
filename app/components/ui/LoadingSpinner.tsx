"use client";
import { useEffect } from "react";
import {
  Center,
  Loader,
  Text,
  Stack,
  Transition,
  useMantineTheme,
} from "@mantine/core";

interface LoadingSpinnerProps {
  text?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullscreen?: boolean;
  withBackground?: boolean;
}

export function LoadingSpinner({
  text = "Loading...",
  size = "md",
  fullscreen = false,
  withBackground = false,
}: LoadingSpinnerProps) {
  const theme = useMantineTheme();
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("llm-lab-pulse-style")) return;
    const style = document.createElement("style");
    style.id = "llm-lab-pulse-style";
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const content = (
    <Stack gap="sm" align="center" className="spinner-stack">
      <div
        className="spinner-box"
        style={{
          ["--spinner-teal" as PropertyKey]: theme.colors.teal[6],
          ["--spinner-violet" as PropertyKey]: theme.colors.violet[6],
        }}
      >
        <Loader
          size={size}
          color={theme.colors.violet[6]}
          className="spinner-loader"
        />
      </div>
      {text && (
        <Text size={size} c="dimmed" className="spinner-text">
          {text}
        </Text>
      )}
    </Stack>
  );

  if (fullscreen) {
    return (
      <Transition mounted={true} transition="fade" duration={400}>
        {(styles) => (
          <Center
            className="spinner-fullscreen"
            style={styles}
            data-backdrop={withBackground}
          >
            {content}
          </Center>
        )}
      </Transition>
    );
  }

  return <Center py="xl">{content}</Center>;
}

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `;
  document.head.appendChild(style);
}
