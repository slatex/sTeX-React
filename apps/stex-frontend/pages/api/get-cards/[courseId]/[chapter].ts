import DRILLS, { DefInfo } from '../../../../definitions.preval';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

function simplify(defs: DefInfo[]) {
  return defs.map((def) => {
    return { uri: def.uri, isBad: def.isBad, htmlNode: def.htmlNode };
  });
}

export function removeBadDefs(defs?: DefInfo[]) {
  if (!defs) return undefined;
  return defs.filter((def) => !def.isBad);
}

export default async function handler(req, res) {
  const { chapter, courseId } = req.query;
  const courseInfo = DRILLS[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: `Course not found: [${courseId}]` });
    return;
  }
  let chapterInfo: DefInfo[] = removeBadDefs(courseInfo[chapter]);
  if (!chapterInfo && chapter !== 'all') {
    res.status(404).json({ error: `Chapter not found: [${chapter}]` });
    return;
  }
  if (!chapterInfo && chapter === 'all') {
    chapterInfo = [];
    for (const [chapter, defs] of Object.entries(courseInfo)) {
      if (!EXCLUDED_CHAPTERS.includes(chapter)) {
        chapterInfo.push(...removeBadDefs(defs));
      }
    }
  }

  res.status(200).json(simplify(chapterInfo));
}
