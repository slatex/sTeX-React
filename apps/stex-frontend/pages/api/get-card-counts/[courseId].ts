import DRILLS from '../../../definitions.preval';
import { EXCLUDED_CHAPTERS } from '../get-cards/[courseId]/[chapter]';

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=3600'
  );
  const { courseId } = req.query;
  const courseInfo = DRILLS[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: `Course not found: [${courseId}]` });
    return;
  }
  if ('all' in courseInfo) {
    res.status(200).json([{ chapter: 'all', count: courseInfo['all'].length }]);
    return;
  }
  const chapCounts = Object.entries(courseInfo)
    .filter(([chapter, _]) => !EXCLUDED_CHAPTERS.includes(chapter))
    .map(([chapter, defs]) => {
      return { chapter, count: defs.length };
    });

  const totalDefs = chapCounts.reduce((p, c) => p + c.count, 0);
  chapCounts.push({ chapter: 'all', count: totalDefs });

  res.status(200).json(chapCounts);
}
