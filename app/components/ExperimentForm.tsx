import { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Paper,
  Title,
  Stack,
  Text,
  RangeSlider,
  Group,
  Box,
} from "@mantine/core";

interface ExperimentFormProps {
  onSubmit: (prompt: string, parameterSets: any[]) => void;
  isLoading: boolean;
}

export function ExperimentForm({ onSubmit, isLoading }: ExperimentFormProps) {
  const [prompt, setPrompt] = useState("");
  const [temperatureRange, setTemperatureRange] = useState<[number, number]>([
    0.3, 0.7,
  ]);
  const [topPRange, setTopPRange] = useState<[number, number]>([0.3, 0.7]);
  const [maxTokens, setMaxTokens] = useState<number>(100);
  const [steps, setSteps] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [tMin, tMax] = temperatureRange;
    const [pMin, pMax] = topPRange;

    const safeSteps = Math.max(2, Math.min(10, Math.floor(steps) || 2)); // avoid divide by zero
    const parameterSets = [];

    for (let i = 0; i < safeSteps; i++) {
      const frac = safeSteps === 1 ? 0 : i / (safeSteps - 1);
      const t = tMin + (tMax - tMin) * frac;
      const p = pMin + (pMax - pMin) * frac;
      parameterSets.push({
        temperature: Number(t.toFixed(2)),
        topP: Number(pMax),
        maxTokens: Math.max(1, Math.floor(maxTokens) || 1),
      });
    }
    for (let i = 0; i < safeSteps; i++) {
      const frac = safeSteps === 1 ? 0 : i / (safeSteps - 1);
      const p = pMin + (pMax - pMin) * frac;
      parameterSets.push({
        temperature: Number(tMax.toFixed(2)),
        topP: Number(p),
        maxTokens: Math.max(1, Math.floor(maxTokens) || 1),
      });
    }

    onSubmit(prompt, parameterSets);
  };

  return (
    <Paper p="md" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>Experiment Configuration</Title>

          <TextInput
            label="Prompt"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            required
            minLength={10}
          />

          <Text size="sm" fw={500}>
            Temperature Range
          </Text>
          <Box w="100%">
            <RangeSlider
              min={0}
              max={2}
              minRange={0.2}
              step={0.1}
              value={temperatureRange}
              onChange={setTemperatureRange}
              label={null}
            />
          </Box>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Min: {temperatureRange[0].toFixed(2)}
            </Text>
            <Text size="xs" c="dimmed">
              Max: {temperatureRange[1].toFixed(2)}
            </Text>
          </Group>

          <Text size="sm" fw={500}>
            Top P Range
          </Text>
          <Box w="100%">
            <RangeSlider
              min={0}
              max={1}
              minRange={0.2}
              step={0.05}
              value={topPRange}
              onChange={setTopPRange}
              label={null}
            />
          </Box>
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Min: {topPRange[0].toFixed(2)}
            </Text>
            <Text size="xs" c="dimmed">
              Max: {topPRange[1].toFixed(2)}
            </Text>
          </Group>

          <NumberInput
            label="Max Tokens"
            value={maxTokens}
            onChange={(v) => setMaxTokens(Number(v) || 0)}
            min={1}
            step={50}
            allowDecimal={false}
          />

          <NumberInput
            label="Number of Steps"
            value={steps}
            onChange={(v) => setSteps(Number(v) || 2)}
            min={2}
            max={10}
            allowDecimal={false}
          />

          <Button
            type="submit"
            loading={isLoading}
            disabled={!prompt || isLoading}
          >
            Run Experiment
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
