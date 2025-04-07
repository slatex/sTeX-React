import { getCourseInfo } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { CACHED_SLIDES, getSlides } from './get-slides';

export async function getSlideCounts(courseId: string, res: NextApiResponse) {
  const courses = await getCourseInfo();
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }

  if (!CACHED_SLIDES[courseId]) {
    CACHED_SLIDES[courseId] = await getSlides(courseInfo.notes);
  }
  const data: { [sectionId: string]: number } = {};
  for (const [secId, slides] of Object.entries(CACHED_SLIDES[courseId])) {
    data[secId] = slides.length;
  }
  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  const slideCounts = await getSlideCounts(courseId, res);
  if (slideCounts) {
    return res.status(200).json(slideCounts);
  }
}
