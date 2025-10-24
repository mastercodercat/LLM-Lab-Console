"use client";
import { useState } from "react";
import { Container, Title, Space } from "@mantine/core";
import { ExperimentForm } from "./ExperimentForm";
import { ResultsDisplay } from "./ResultsDisplay";
import { ExperimentResponse } from "../types";
import { ParameterSet } from "../types/experiment";

export function ExperimentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<ExperimentResponse[]>([]);

  const handleExperiment = async (
    prompt: string,
    parameterSets: ParameterSet[]
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/experiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, parameterSets }),
      });

      const data = await response.json();
      if (response.ok) {
        setResponses(data.responses);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Failed to run experiment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      experiments: responses,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-experiment-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container p={{ base: "xs", sm: "md", lg: "xl" }}>
      <Title order={2}>Run Experiment</Title>
      <Space h="xl" />
      <ExperimentForm onSubmit={handleExperiment} isLoading={isLoading} />
      <Space h="xl" />
      <ResultsDisplay responses={responses} onExport={handleExport} />
    </Container>
  );
}
