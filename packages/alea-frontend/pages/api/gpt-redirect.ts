import axios, { Method } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method, body, headers } = req;
    const { apiname } = req.query; // The URL to forward the request to

    if (!apiname || typeof apiname !== 'string') {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const axiosConfig = {
      method: method as Method,
      url: `${process.env.NEXT_PUBLIC_GPT_URL}/api/${apiname}` as string,
      headers,
      data: body,
    };

    const response = await axios(axiosConfig);
    const responseData = response.data;

    return res.status(response.status).json(responseData);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
