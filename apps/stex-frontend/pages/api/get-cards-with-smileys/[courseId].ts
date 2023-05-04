import { getUriSmileys, SmileyCognitiveValues } from '@stex-react/api';
import { getSectionInfo, COURSES_INFO } from '@stex-react/utils';
import axios from 'axios';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

export interface CardsWithSmileys {
  uri: string;
  smileys: SmileyCognitiveValues;
}

export default async function handler(req, res) {
  const { courseId } = req.query;
  const Authorization = req.headers.authorization;
  const courseRoot = COURSES_INFO[courseId].notesLink;
  if (!courseRoot) {
    res.status(404).json({ error: `Course not found: [${courseId}]` });
    return;
  }
  const { archive, filepath } = getSectionInfo(courseRoot);

  const resp = await axios.get(
    `${process.env.NEXT_PUBLIC_MMT_URL}/:sTeX/definienda?archive=${archive}&filepath=${filepath}`
  );
  const cards: { id: string; symbols: string[] }[] = resp.data;

  const uris = [];
  for (const e of cards) {
    for (const uri of e.symbols) {
      uris.push(uri);
    }
  }

  const smileyValues = Authorization
    ? await getUriSmileys(uris, { Authorization })
    : undefined;

  console.log(`Got ${uris.length} uri smileys`);
  const output: CardsWithSmileys[] = [];
  for (let idx = 0; idx < uris.length; idx++) {
    const uri = uris[idx];
    const smileys = smileyValues?.[idx] || {};
    output.push({ uri, smileys });
  }

  res.status(200).json(output);
}
