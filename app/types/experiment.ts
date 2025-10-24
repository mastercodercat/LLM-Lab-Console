export interface ParameterSet {
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  seed?: number;
}
