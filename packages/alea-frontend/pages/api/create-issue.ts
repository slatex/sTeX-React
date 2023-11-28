import { NotificationType } from '@stex-react/api';
import axios, { RawAxiosRequestHeaders } from 'axios';
import { sendAlert } from './add-comment';
import {
  getUserId,
  sendNotification
} from './comment-utils';

function getHeaders(category: string): RawAxiosRequestHeaders {
  if (category === 'CONTENT') {
    return {
      'PRIVATE-TOKEN': process.env['CONTENT_ISSUES_GITLAB_PAT'] as string,
    };
  } else {
    return { Authorization: `token ${process.env['STEX_REACT_PAT']}` };
  }
}

async function sendReportNotifications(
  userId: string | null = null,
  link: string,
  type: string
) {
  if (type === 'SUGGESTION') {
    await sendNotification(
      userId,
      'You provided a suggestion',
      '',
      'Du hast einen Vorschlag gemacht',
      '',
      NotificationType.SUGGESTION,
      link
    );
  } else {
    await sendNotification(
      userId,
      'You Reported a Problem',
      '',
      'Sie haben ein Problem gemeldet',
      '',
      NotificationType.REPORT_PROBLEM,
      link
    );
  }
}
export default async function handler(req, res) {
  const userId = await getUserId(req);
  if (req.method !== 'POST') return res.status(404);
  const body = req.body;

  const headers = getHeaders(body.category);

  const response = await axios.post(body.createNewIssueUrl, body.data, {
    headers,
  });
  const issue_url = response.data['web_url'] || response.data['html_url'];
  res.status(200).json({ issue_url });
  await sendAlert(`A user-reported issue was created at ${issue_url}`);
  await sendReportNotifications(userId, issue_url, body.type);
}
