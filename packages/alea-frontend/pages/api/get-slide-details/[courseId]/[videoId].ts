import { NextApiRequest, NextApiResponse } from 'next';
import {
  CACHED_VIDEO_SLIDESMAP,
  populateVideoToSlidesMap,
} from '../../get-section-info/[courseId]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { courseId, videoId } = req.query;
  if (!courseId || !videoId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  if (!CACHED_VIDEO_SLIDESMAP[courseId as string]) {
    await populateVideoToSlidesMap();
  }

  const videoData = CACHED_VIDEO_SLIDESMAP[courseId as string]?.[videoId as string];
  if (!videoData || !videoData.extracted_content) return;

  return res.status(200).json(videoData.extracted_content);
}
