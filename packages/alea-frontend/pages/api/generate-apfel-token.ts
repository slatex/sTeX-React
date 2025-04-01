import { sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, time } = req.body;
  if (!userId) return;
  const payload = {
    userId,
    time,
  };
  const secretKey = process.env.APFEL_PRIVATE_KEY;
  const options = { expiresIn: '365D' as any };
  try {
    const token = sign(payload, secretKey, options);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error generating token' });
  }
}
