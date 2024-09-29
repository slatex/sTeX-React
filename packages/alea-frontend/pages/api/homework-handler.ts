import { NextApiRequest, NextApiResponse } from 'next';

import { executeAndEndSet500OnError, executeDontEndSet500OnError } from './comment-utils';

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { homeworkName, homeworkDate, courseId, courseInstance, archive, filepath } = req.body;

  try {
    const result = await executeAndEndSet500OnError(
      'INSERT INTO homework (homeworkName, homeworkDate, courseId, courseInstance, archive, filepath) VALUES (?, ?, ?, ?, ?, ?)',
      [homeworkName, homeworkDate, courseId, courseInstance, archive, filepath],
      res
    );

    if (result) {
      res.status(200).json({ message: 'Homework added successfully!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error inserting homework' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;

  try {
    const results = await executeDontEndSet500OnError(
      'SELECT * FROM homework WHERE courseId = ? ORDER BY homeworkDate ASC',
      [courseId],
      res
    );
    if (results) {
      res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homework' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await handlePost(req, res);
  } else if (req.method === 'GET') {
    await handleGet(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
