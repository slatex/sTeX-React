import { AI_1_COURSE_SECTIONS } from '../../../course_info/ai-1-notes';
import {
  CourseInfo,
  CourseSection,
  DeckAndVideoInfo,
} from '../../../shared/slides';
import { getTitle } from '../notesHelpers';

const COURSE_INFO_CACHE = new Map<string, CourseInfo>();

export default async function handler(req, res) {
  const { courseId } = req.query;

  if (COURSE_INFO_CACHE.has(courseId)) {
    return res.status(200).json(COURSE_INFO_CACHE.get(courseId));
  }

  if (courseId !== 'ai-1') {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }
  const sections: CourseSection[] = [];
  for (const [sectionTitle, deckList] of Object.entries(AI_1_COURSE_SECTIONS)) {
    const decks: DeckAndVideoInfo[] = [];
    for (const deckId of Object.keys(deckList)) {
      const { secNo, clipId, timestampSec } = deckList[deckId];
      const titleAsHtml = getTitle(deckId);
      decks.push({ secNo, clipId, timestampSec, deckId, titleAsHtml });
    }
    sections.push({ sectionTitle, decks });
  }
  COURSE_INFO_CACHE.set(courseId, { courseId, sections });

  res.status(200).json({ courseId, sections });
}
