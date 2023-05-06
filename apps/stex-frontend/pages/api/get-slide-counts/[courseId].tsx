import { COURSES_INFO } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CACHED_SLIDES,
  getSlides,
} from '../get-slides/[courseId]/[sectionIds]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = req.query.courseId as string;
  const courseInfo = COURSES_INFO[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }
  if (!CACHED_SLIDES[courseId]) {
    CACHED_SLIDES[courseId] = await getSlides({
      archive: courseInfo.notesArchive,
      filepath: courseInfo.notesFilepath,
    });
  }
  const data: { [sectionId: string]: number } = {};
  for (const [secId, slides] of Object.entries(CACHED_SLIDES[courseId])) {
    data[secId] = slides.length;
  }

  return res.status(200).json(data);
}
