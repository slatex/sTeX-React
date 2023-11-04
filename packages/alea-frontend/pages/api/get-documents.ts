import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from './comment-utils';
import { XhtmlContentUrl } from '@stex-react/utils';
import { fetchDocument } from './prefetchHelper';
import { GetDocumentsRequest } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;

  const docs = (req.body as GetDocumentsRequest)?.docs;
  if (!docs?.length) {
    res.status(400).json({ message: 'Nothing to fetch' });
    return;
  }
  const urls = docs.map((doc) => XhtmlContentUrl(doc.archive, doc.filepath));
  const promises = urls.map((url) =>
    fetchDocument(process.env.NEXT_PUBLIC_MMT_URL, url)
  );
  try {
    Promise.all(promises).then((results) => {
      res.status(200).json(results);
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error fetching docs' });
  }
}
