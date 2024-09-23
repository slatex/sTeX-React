

export enum TemplateTypes {
  CONTEXT_BASED = 'CONTEXT_BASED',
  FROM_SAMPLE_PROBLEM = 'FROM_SAMPLE_PROBLEM',
  FROM_MORE_EXAMPLES = 'FROM_MORE_EXAMPLES',
  FROM_CONCEPT_COMPARISON = 'FROM_CONCEPT_COMPARISON',
  REMOVE_AMBIGUITY = 'REMOVE_AMBIGUITY',
  FIX_REFERENCES = 'FIX_REFERENCES',
  FIX_DISTRACTORS = 'FIX_DISTRACTORS',
}

export enum GptResponseFormat {
  JSON_FORMAT = 'JSON_FORMAT',
  LATEX_FORMST = 'LATEX_FORMAT',
}


export interface VariableAssignment {
  // special keys:
  // To be documented.
  key: string;
  value: string;
}
export const defaultAssignment: VariableAssignment[] = [
  { key: 'CONCEPT', value: 'Minimax Algorithm' },
  { key: 'COURSE', value: 'AI' },
  { key: 'COMPETENCY', value: 'understand' },
];

export interface Template {
  templateType:string;
  templateName: string;
  templateVersion: string;
  templateId:number;
  updateMessage: string;
  templateStr: string[];
  defaultAssignments: VariableAssignment[];
  updater: string;
  updated_time: string;
  gptResponseFormat:string;
  
}

export interface GenerationObj {
  generationId:number;
  templateId:number;
  gptResponse:string;
  createdAt:string;
  promptText:string;
  assignment:VariableAssignment[];

}
export interface GenerationHistory {
  generationId:number;
  templateId:number;
  gptResponse:string;
  createdAt:string;
  promptText:string[];
  assignment:VariableAssignment[];

}
export interface CreateGptProblemsRequest {
  templateName: string;
  templateVersion: string;
  templateId:number,
  templateStr: string[];
  assignments: VariableAssignment[];
}



export interface CreateGptProblemsResponse {
  message:string;
  generationObj:GenerationObj;

}

export interface TemplateData {
  templateName: string;
  templateVersion: string;
}

export interface ClickedButtons {
  [key: number]: 'More Problems' | 'Add References' | 'Edit' | 'Fix Distractor' | 'Remove Ambiguity' | undefined;
}

export interface Problem {
  id: number;
  question: string;
  correctAnswer: string;
  options: string[];
  type: string; 
}


export interface VersionData {
  assignment: VariableAssignment[];
  id: number;
  modificationType: string; 
  question: string; 
  templateId: number;
  type: string; 
  updateTime: string; 
  version: number;
}

export interface ResponseData {
  assignments: VariableAssignment[];
  createdAt: string; 
  extractQuestion: boolean;
  generationId: number;
  gptResponse: string; 
  promptStr: string;
  templateId: number;
}

