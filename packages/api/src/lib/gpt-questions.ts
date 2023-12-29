export interface VariableAssignment {
  // special keys:
  // To be documented.
  key: string;
  value: string;
}

export interface Template {
  templateName: string;
  version: string;
  updateMessage: string;

  templateStrs: string[];
  defaultAssignment: VariableAssignment[];
  updater: string;
  updateTime: string;
}

export type PostProcessingStep = 'JSON_TO_STEX' | 'REMOVE_NEWLINES';

export interface CreateGptQuestionsRequest {
  dryRun: boolean;
  templateName: string;
  templateVersion: string;
  templateStrs: string[];
  assignments: VariableAssignment[];
  postProcessingSteps: PostProcessingStep[];
}

export interface GptCompletionData {
  multiAssignment?: VariableAssignment[];
  actualPrompts: string[];
  response: string;
  usage: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
    cost_USD: number;
  };
}

export interface CreateGptQuestionsResponse {
  runId: string;
  runTime: string;
  runner: string;
  completions: GptCompletionData[];
}
