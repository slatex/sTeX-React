import { NextApiRequest, NextApiResponse } from 'next';
import { executeQueryAndEnd } from './comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure that the request is a POST request
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }

  console.log({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_COMMENTS_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

  // Dummy values for testing
  const content = "This is a test comment."; // Example comment content
  const userId = "test_user_123";           // Dummy user ID
  const userName = "John Doe";               // Dummy user name
  const userEmail = "john.doe@example.com";  // Dummy user email

  // Insert a comment into the database
  const result = await executeQueryAndEnd(
    'INSERT INTO comments (statement, isDeleted, userId, userName, userEmail) VALUES (?, ?, ?, ?, ?)',
    [content, 0, userId, userName, userEmail] // Use the dummy values here
  );

  // Check for errors
  if (result['error']) {
    res.status(500).json({ message: 'Database Error', error: result['error'] });
    return;
  }

  // If successful, send a response
  res.status(200).json({ message: 'Comment inserted successfully!' });
}
