import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const ACCESS_TOKEN_PREFIX = 'access_token=';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const resp = await axios.get(
    `https://lms.voll-ki.fau.de/fake-login?fake-id=${req.query.userId}`,
    {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 303; // default
      },
    }
  );
  let access_token = resp.headers['set-cookie']?.[0];
  access_token = access_token?.split(';')[0];
  if (access_token.startsWith(ACCESS_TOKEN_PREFIX))
    access_token = access_token.substring(ACCESS_TOKEN_PREFIX.length);

  res.status(200).json({ access_token });
}
