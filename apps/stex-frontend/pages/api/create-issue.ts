import axios, { AxiosRequestHeaders } from 'axios';

function getHeaders(category: string): AxiosRequestHeaders {
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

  console.log(body.createNewIssueUrl);
  console.log(body.data);
  console.log(body.category);
  const headers = getHeaders(body.category);
  console.log(headers);

  const response = await axios.post(body.createNewIssueUrl, body.data, {
    headers,
  });
  res
    .status(200)
    .json({ issue_url: response.data['web_url'] || response.data['html_url'] });
}
