import axios from 'axios';
import {
    CreateGptQuestionsRequest,
    CreateGptQuestionsResponse,
    Template
} from './gpt-questions';
import { getAuthHeaders } from './lms';

export async function createGptQuestions(
  gptUrl: string,
  request: CreateGptQuestionsRequest
) {
  const resp = await axios.post(`${gptUrl}/api/create-questions`, request, {
    headers: getAuthHeaders(),
  });
  return resp.data as CreateGptQuestionsResponse;
}

export async function getTemplates(gptUrl: string) {
  const resp = await axios.get(`${gptUrl}/api/get-templates`, {
    headers: getAuthHeaders(),
  });
  return resp.data as Template[];
}

export async function saveTemplate(gptUrl: string, template: Template) {
  const resp = await axios.post(`${gptUrl}/api/save-template`, template, {
    headers: getAuthHeaders(),
  });
  return resp.data as Template;
}
