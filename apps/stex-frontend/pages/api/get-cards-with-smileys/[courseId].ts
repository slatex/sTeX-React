import { getUriSmileys, SmileyCognitiveValues } from '@stex-react/api';
import DRILLS, { DefInfo } from '../../../definitions.preval';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

export function removeBadDefs(defs?: DefInfo[]) {
  if (!defs) return undefined;
  return defs.filter((def) => !def.isBad);
}
export interface CardsWithSmileys extends DefInfo, SmileyCognitiveValues {}

export default async function handler(req, res) {
  const { courseId } = req.query;
  const Authorization = req.headers.authorization;

  const courseInfo = DRILLS[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: `Course not found: [${courseId}]` });
    return;
  }
  const uris = [];
  for (const [chapter, defs] of Object.entries(courseInfo)) {
    if (!EXCLUDED_CHAPTERS.includes(chapter)) {
      const goodDefs = removeBadDefs(defs);
      courseInfo[chapter] = removeBadDefs(goodDefs);
      uris.push(...goodDefs.map((def) => def.uri));
    }
  }

  const smileyValues = Authorization
    ? await getUriSmileys(uris, { Authorization })
    : undefined;

  console.log(`Got ${uris.length} uri smileys`);
  const uriMap = new Map<string, SmileyCognitiveValues>();
  for (let idx = 0; idx < uris.length; idx++) {
    const uri = uris[idx];
    const smileyValue = smileyValues?.[idx] || {};
    uriMap.set(uri, smileyValue);
  }
  const output: CardsWithSmileys[] = [];
  for (const [chapter, defs] of Object.entries(courseInfo)) {
    if (!EXCLUDED_CHAPTERS.includes(chapter)) {
      for (const def of defs) {
        if (def.isBad) continue;
        const smileyInfo = uriMap.get(def.uri);
        output.push({ ...def, ...smileyInfo });
      }
    }
  }

  res.status(200).json(output);
}
