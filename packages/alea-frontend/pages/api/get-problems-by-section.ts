import { NextApiRequest, NextApiResponse } from 'next';
import { getProblemsBySection } from './get-course-problem-counts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sectionUri = req.query.sectionUri as string;
  const problems = await getProblemsBySection(sectionUri);
  res.status(200).json(problems);
}
