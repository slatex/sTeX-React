import {
  DocumentElementURI,
  TOCElem,
  getCourseInfo,
  getDefiniedaInSection,
  getDocumentSections,
  getProblemsForConcept,
  getProblemsForSection,
} from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

interface CourseCacheInfo {
  counts: Record<DocumentElementURI, number>;
  lastUpdatedTs_ms: number;
}

// Use global cache to persist between requests in dev/local
const globalCache = global as any;
if (!globalCache.COURSE_CACHE) {
  globalCache.COURSE_CACHE = new Map<string, CourseCacheInfo>();
}
const CACHE: Map<string, CourseCacheInfo> = globalCache.COURSE_CACHE;

function isCacheValid(cache: CourseCacheInfo) {
  const HOURS_6 = 1000 * 60 * 60 * 6;
  return Date.now() - cache.lastUpdatedTs_ms < HOURS_6;
}

function getCachedCourseProblemCounts(courseId: string) {
  const cache = CACHE.get(courseId);
  if (cache && isCacheValid(cache)) return cache.counts;
}

function collectSectionUris(toc: TOCElem[]): DocumentElementURI[] {
  const result: DocumentElementURI[] = [];
  for (const elem of toc) {
    if (elem.type === 'Section' && elem.uri) result.push(elem.uri);
    if ('children' in elem) result.push(...collectSectionUris(elem.children));
  }
  return result;
}


async function fetchProblemCounts(notesUri: string): Promise<Record<DocumentElementURI, number>> {
  const tocContent = (await getDocumentSections(notesUri))[1];
  const sectionUris = collectSectionUris(tocContent);

  const counts: Record<DocumentElementURI, number> = {};
  await Promise.all(
    sectionUris.map(async (uri) => {
      const problems = await getProblemsForSection(uri);
      counts[uri] = problems.length;
    })
  );

  return counts;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  let counts = getCachedCourseProblemCounts(courseId);
  if (!counts) {
    const courseInfo = (await getCourseInfo())[courseId];
    if (!courseInfo) return res.status(404).send(`Course not found: [${courseId}]`);
    const { notes } = courseInfo;
    counts = await fetchProblemCounts(notes);
    CACHE.set(courseId, { counts, lastUpdatedTs_ms: Date.now() });
  }

  res.status(200).json(counts as Record<DocumentElementURI, number>);
}
