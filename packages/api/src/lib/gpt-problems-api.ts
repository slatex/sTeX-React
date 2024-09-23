import axios from 'axios';
import {
  CompletionEval,
  CreateGptProblemsRequest,
  CreateGptProblemsResponse,
  GptRun,
  Template,
} from './gpt-problems';
import { getAuthHeaders } from './lms';

export async function createGptQuestions(request: CreateGptProblemsRequest) {
  const resp = await axios.post(
    `/api/gpt-redirect?apiname=create-problems`,
    request,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as CreateGptProblemsResponse;
}

export async function getTemplates() {
  const resp = await axios.get(`/api/gpt-redirect?apiname=get-templates`, {
    headers: getAuthHeaders(),
  });
  return resp.data as Template[];
}

export async function getTemplateVersions(templateName: string) {
  const resp = await axios.get(
    `/api/gpt-redirect?apiname=get-template-versions/${templateName}`,
    { headers: getAuthHeaders() }
  );
  return resp.data as Template[];
}

export async function saveTemplate(template: Template) {
  const resp = await axios.post(
    `/api/gpt-redirect?apiname=save-template`,
    template,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as Template;
}

export async function getGptRuns() {
  const resp = await axios.get(`/api/gpt-redirect?apiname=get-runs`, {
    headers: getAuthHeaders(),
  });
  return resp.data as GptRun[];
}

export async function saveEval(evaluation: CompletionEval) {
  const resp = await axios.post(
    `/api/gpt-redirect?apiname=save-eval`,
    evaluation,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as GptRun;
}

export async function getEval(runId: string, completionIdx: number) {
  const resp = await axios.get(
    `/api/gpt-redirect?apiname=get-eval/${runId}/${completionIdx}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as CompletionEval;
}

export async function searchCourseNotes(query: string, courseId: string) {
  const resp = await axios.get(
    `/api/gpt-redirect?query=${query}&=course_id=${courseId}&apiname=query_metadata`,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data;
}
