import { NextApiRequest, NextApiResponse } from 'next';
import { CACHED_SLIDES, getSlides } from '../get-slides/[courseId]/[sectionIds]';
import { getCourseInfo } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  const courses = await getCourseInfo(process.env.NEXT_PUBLIC_MMT_URL);
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }
  //Todo alea-4
  // if (!CACHED_SLIDES[courseId]) {
  //   CACHED_SLIDES[courseId] = await getSlides({
  //     archive: courseInfo.notesArchive,
  //     filepath: courseInfo.notesFilepath,
  //   });
  // }
  const data: { [sectionId: string]: number } = {};
  for (const [secId, slides] of Object.entries(CACHED_SLIDES[courseId])) {
    data[secId] = slides.length;
  }

  return res.status(200).json(data);
}
