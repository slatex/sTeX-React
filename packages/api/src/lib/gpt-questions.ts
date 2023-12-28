export interface VariableAssignment {
  // special keys:
  // To be documented.
  key: string;
  value: string;
}

export interface Template {
  templateName: string;
  templateStrs: string[];
  defaultAssignment: VariableAssignment[];
}

export type PostProcessingStep = 'JSON_TO_STEX' | 'REMOVE_NEWLINES';

export interface CreateGptQuestionsRequest {
  dryRun: boolean;
  templateStrs: string[];
  assignments: VariableAssignment[];
  postProcessingSteps: PostProcessingStep[];
}

export interface CreateGptQuestionsResponse {
  actualPrompts: string[];
  response: string;
  usage: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
    cost_USD: number;
  };
}
