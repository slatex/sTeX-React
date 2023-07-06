import axios, { RawAxiosRequestHeaders } from 'axios';
import { sendAlert } from './add-comment';

function getHeaders(category: string): RawAxiosRequestHeaders {
  if (category === 'CONTENT') {
    return {
      'PRIVATE-TOKEN': process.env['CONTENT_ISSUES_GITLAB_PAT'] as string,
    };
  } else {
    return { Authorization: `token ${process.env['STEX_REACT_PAT']}` };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(404);
  const body = req.body;

  const headers = getHeaders(body.category);

  const response = await axios.post(body.createNewIssueUrl, body.data, {
    headers,
  });
  const issue_url = response.data['web_url'] || response.data['html_url'];
  res.status(200).json({ issue_url });
  await sendAlert(`A user-reported issue was created at ${issue_url}`);
}
