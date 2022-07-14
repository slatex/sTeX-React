import axios, { AxiosRequestHeaders } from 'axios';
const CONTENT_ISSUES_GITLAB_PERSONAL_ACCESS_TOKEN = 'TODO';
const STEX_REACT_PERSONAL_ACCESS_TOKEN = 'TODO';

const THREE_BACKTICKS = '```';

export interface SectionInfo {
  url: string;
  archive?: string;
  filepath?: string;
  source?: string;
}

export enum IssueType {
  ERROR = 'ERROR',
  SUGGESTION = 'SUGGESTION',
}

export enum IssueCategory {
  CONTENT = 'CONTENT',
  DISPLAY = 'DISPLAY',
}

function createSectionHierarchy(context: SectionInfo[]) {
  if (!context?.length) return '';
  let returnVal =
    '### The selected text was in the following section hierarchy:\n\n';
  if (context.length > 1) returnVal += '**_INNERMOST SECTION FIRST_**\n\n';

  returnVal += context
    .map(
      (sectionInfo, idx) =>
        `${idx + 1}. GitLab: ${sectionInfo.source}<br/>FetchURL: ${
          sectionInfo.url
        }`
    )
    .join('\n\n');
  return returnVal;
}

function createIssueBody(
  type: IssueType,
  desc: string,
  selectedText: string,
  context: SectionInfo[]
) {
  const sectionHierarchy = createSectionHierarchy(context);

  return `A content ${type.toString()} was logged by a user at the following url:

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

function getNewIssueUrl(category: IssueCategory, projectId: string) {
  if (category === IssueCategory.CONTENT) {
    return `https://gl.mathhub.info/api/v4/projects/${encodeURIComponent(
      projectId
    )}/issues`;
  }
  return 'https://api.github.com/repos/slatex/sTeX-React/issues';
}

function createIssueData(
  type: IssueType,
  category: IssueCategory,
  desc: string,
  selectedText: string,
  context: SectionInfo[],
  title?: string
) {
  const filepath = context?.[0]?.filepath || 'sTeX file';
  const body = createIssueBody(type, desc, selectedText, context);
  return {
    title: title || `${type.toString()} in ${filepath}`,
    ...(category === IssueCategory.DISPLAY ? { body } : { description: body }),
  };
}
function getHeaders(category: IssueCategory): AxiosRequestHeaders {
  if (category === IssueCategory.CONTENT) {
    return {
      'PRIVATE-TOKEN': CONTENT_ISSUES_GITLAB_PERSONAL_ACCESS_TOKEN,
    };
  } else {
    return { Authorization: `token ${STEX_REACT_PERSONAL_ACCESS_TOKEN}` };
  }
}

export async function createNewIssue(
  type: IssueType,
  category: IssueCategory,
  desc: string,
  selectedText: string,
  context: SectionInfo[],
  title?: string
) {
  const projectId = context?.[0]?.archive || 'sTeX/meta-inf';
  const data = createIssueData(
    type,
    category,
    desc,
    selectedText,
    context,
    title
  );
  const headers = getHeaders(category);
  try {
    const createNewIssueUrl = getNewIssueUrl(category, projectId);
    const response = await axios.post(createNewIssueUrl, data, { headers });
    return response.data['web_url'] || response.data['html_url'];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function issuesUrlList(context: SectionInfo[]) {
  const projectId = context?.[0]?.archive;
  if (!projectId) return 'https://github.com/slatex/sTeX-React/issues';
  return `https://gl.mathhub.info/${projectId}/-/issues`;
}
