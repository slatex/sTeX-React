import { getUriSmileys, SmileyCognitiveValues } from '@stex-react/api';
import { getSectionInfo } from '@stex-react/utils';
import axios from 'axios';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

export const COURSE_ROOTS = {
  'ai-1': '/:sTeX/document?archive=MiKoMH/AI&filepath=course/notes/notes1.xhtml',
  'ai-2': '/:sTeX/document?archive=MiKoMH/AI&filepath=course/notes/notes2.xhtml',
  'iwgs-1': '/:sTeX/document?archive=MiKoMH/IWGS&filepath=course/notes/notes-part1.xhtml',
  'iwgs-2': '/:sTeX/document?archive=MiKoMH/IWGS&filepath=course/notes/notes-part2.xhtml',
  lbs: '/:sTeX/document?archive=MiKoMH/LBS&filepath=course/notes/notes.xhtml',
  krmt: '/:sTeX/document?archive=MiKoMH/KRMT&filepath=course/notes/notes.xhtml',
};

export interface CardsWithSmileys {
  uri: string;
  smileys: SmileyCognitiveValues;
}

export default async function handler(req, res) {
  const { courseId } = req.query;
  const Authorization = req.headers.authorization;
  const courseRoot = COURSE_ROOTS[courseId];
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
