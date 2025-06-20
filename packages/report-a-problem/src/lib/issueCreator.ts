import { FTML } from '@kwarc/ftml-viewer';
import { getAuthHeaders, getSourceUrl } from '@stex-react/api';
import { extractRepoAndFilepath as extractProjectAndFilepath } from '@stex-react/utils';
import axios from 'axios';

const THREE_BACKTICKS = '```';

export enum IssueType {
  ERROR = 'ERROR',
  SUGGESTION = 'SUGGESTION',
}

export enum IssueCategory {
  CONTENT = 'CONTENT',
  DISPLAY = 'DISPLAY',
}
export interface SelectionContext {
  fragmentUri: FTML.URI;
  fragmentKind: 'Section' | 'Paragraph' | 'Slide';
  source?: string;
}
async function addSources(context: SelectionContext[]): Promise<SelectionContext[]> {
  return await Promise.all(
    context.map((item) => getSourceUrl(item.fragmentUri).then((source) => ({ ...item, source })))
  );
}

async function createSectionHierarchy(context: SelectionContext[]) {
  if (!context?.length) return '';
  let returnVal = '### The selected text was in the following section hierarchy:\n\n';
  if (context.length > 1) returnVal += '**_INNERMOST SECTION FIRST_**\n\n';

  returnVal += context
    .map(
      (contextItem, idx) =>
        `${idx + 1}. (${contextItem.fragmentKind}) GitLab: ${contextItem.source}<br/>Uri: ${
          contextItem.fragmentUri
        } `
    )
    .join('\n\n');

  return returnVal;
}

async function createIssueBody(
  type: IssueType,
  desc: string,
  selectedText: string,
  userName: string,
  context: SelectionContext[]
) {
  const sectionHierarchy = await createSectionHierarchy(context);
  const user = userName || 'a user';

  return `A content ${type.toString()} was logged by "${user}" at the following url:

${window.location.href}

## The issue as described by the user:
${THREE_BACKTICKS}
${desc.replace(/```/g, '"""')}
${THREE_BACKTICKS}

## The text highlighted while reporting this issue:
${THREE_BACKTICKS}
${selectedText.replace(/```/g, '"""')}
${THREE_BACKTICKS}

${sectionHierarchy}`;
}

function getNewIssueUrl(category: IssueCategory, projectId: string , context: SelectionContext[]) {
  if (category === IssueCategory.CONTENT && context?.length > 0) {
    return `https://gl.mathhub.info/api/v4/projects/${encodeURIComponent(projectId)}/issues`;
  }
  return 'https://api.github.com/repos/slatex/sTeX-React/issues';
}

async function createIssueData(
  type: IssueType,
  category: IssueCategory,
  desc: string,
  selectedText: string,
  context: SelectionContext[],
  userName: string,
  title?: string
) {
  const { filepath } = extractProjectAndFilepath(context[0]?.source);
  const body = await createIssueBody(type, desc, selectedText, userName, context);
  return {
    title: title || `User reported ${type.toString()} ${filepath}`,
    ...(category === IssueCategory.DISPLAY
      ? { body, labels: ['user-reported'] }
      : { description: body }),
  };
}
export async function createNewIssue(
  type: IssueType,
  category: IssueCategory,
  desc: string,
  selectedText: string,
  context: SelectionContext[],
  userName: string,
  title?: string
) {
  const withSourceContext = await addSources(context);
  const { project } = extractProjectAndFilepath(withSourceContext[0]?.source);
  const projectId = project || 'sTeX/meta-inf';
  const data = await createIssueData(
    type,
    category,
    desc,
    selectedText,
    withSourceContext,
    userName,
    title
  );
  try {
    const createNewIssueUrl = getNewIssueUrl(category, projectId, context);
    const response = await axios.post(
      '/api/create-issue',
      {
        data,
        type,
        createNewIssueUrl,
        category: category.toString(),
      },
      { headers: getAuthHeaders() }
    );
    return response.data['issue_url'];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function issuesUrlList(context: SelectionContext[]) {
  const { project } = extractProjectAndFilepath(context?.[0]?.source);
  if (!project) return 'https://github.com/slatex/sTeX-React/issues';
  return `https://gl.mathhub.info/${project}/-/issues`;
}
