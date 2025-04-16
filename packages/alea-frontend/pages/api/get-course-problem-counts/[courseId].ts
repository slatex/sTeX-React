import {
  DocumentElementURI,
  TOCElem,
  getCourseInfo,
  getDefiniedaInDoc,
  getDocumentSections,
  getPracticeProblems,
} from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

interface CourseCacheInfo {
  counts: { [section: string]: number };
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
  if (cache && isCacheValid(cache)) {
    console.log('[CACHE HIT]', courseId);
    return cache.counts;
  }
  console.log('[CACHE MISS]', courseId);
  return null;
}

function collectSectionUris(toc: TOCElem[]): DocumentElementURI[] {
  const result: DocumentElementURI[] = [];
  for (const elem of toc) {
    if (elem.type === 'Section') {
      if (elem.uri) {
        result.push(elem.uri);
      }
      result.push(...collectSectionUris(elem.children));
    } else if (elem.type === 'SkippedSection' || elem.type === 'Inputref') {
      result.push(...collectSectionUris(elem.children));
    }
  }
  return result;
}

async function fetchProblemCounts(notesUri: string): Promise<{ [sectionUri: string]: number }> {
  const docSections = await getDocumentSections(notesUri);
  const tocContent = docSections[1];
  const sectionUris = collectSectionUris(tocContent);
  const sectionToConceptUris = await Promise.all(
    sectionUris.map(async (uri) => {
      const concepts = await getDefiniedaInDoc(uri);
      return { sectionUri: uri, conceptUris: concepts.map((item) => item.conceptUri) };
    })
  );

  const counts: { [sectionUri: string]: number } = {};

  for (const { sectionUri, conceptUris } of sectionToConceptUris) {
    const uniqueProblemUrls = new Set<string>();
    await Promise.all(
      conceptUris.map(async (conceptUri) => {
        const problems = await getPracticeProblems(conceptUri);
        problems.forEach((problem) => {
          uniqueProblemUrls.add(problem);
        });
      })
    );
    counts[sectionUri] = uniqueProblemUrls.size;
  }

  return counts;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  let counts = getCachedCourseProblemCounts(courseId);
  if (!counts) {
    const courseInfo = (await getCourseInfo())[courseId];
    if (!courseInfo) {
      res.status(404).json({ error: `Course not found: [${courseId}]` });
      return;
    }

    const { notes } = courseInfo;
    counts = await fetchProblemCounts(notes);
    CACHE.set(courseId, { counts, lastUpdatedTs_ms: Date.now() });
  }

  res.status(200).json(counts);
}
