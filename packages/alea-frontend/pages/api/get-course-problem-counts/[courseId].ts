import {
    SectionsAPIData,
    getCourseInfo,
    getDocumentSections,
    getProblemIdsForFile,
    lastFileNode
} from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];

interface CourseCacheInfo {
  counts: { [section: string]: number };
  lastUpdatedTs_ms: number;
}

function isCacheValid(cache: CourseCacheInfo) {
  const HOURS_6 = 1000 * 60 * 60 * 6;
  return Date.now() - cache.lastUpdatedTs_ms < HOURS_6;
}

const CACHE = new Map<string, CourseCacheInfo>();

function getCachedCourseProblemCounts(courseId: string) {
  const cache = CACHE.get(courseId);
  if (cache && isCacheValid(cache)) {
    return cache.counts;
  }
}

function getAllSectionInfo(
  node: SectionsAPIData,
  ancestors: SectionsAPIData[]
) {
  if (!node) return [];
  const sections: { sectionId: string; parent?: SectionsAPIData }[] = [];
  for (const c of node.children) {
    sections.push(...getAllSectionInfo(c, [...ancestors, node]));
  }
  const sectionParentFile = lastFileNode(ancestors);
  if (node.id && sectionParentFile) {
    sections.push({ sectionId: node.id, parent: sectionParentFile });
  }
  return sections;
}

async function fetchProblemCounts(archive: string, filepath: string) {
  const mmtUrl = process.env.NEXT_PUBLIC_MMT_URL;
  const docSections = await getDocumentSections(mmtUrl, archive, filepath);
  const sections = getAllSectionInfo(docSections, []);
  const promises = sections.map(({ parent }) =>
    getProblemIdsForFile(mmtUrl, parent.archive, parent.filepath)
  );
  const problemIds = await Promise.all(promises);

  const problemCounts: { [section: string]: number } = {};
  for (let i = 0; i < sections.length; i++) {
    problemCounts[sections[i].sectionId] = problemIds[i].length;
  }
  return problemCounts;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = req.query.courseId as string;
  let counts = getCachedCourseProblemCounts(courseId);

  if (!counts) {
    const courseInfo = (await getCourseInfo(process.env.NEXT_PUBLIC_MMT_URL))[
      courseId
    ];
    if (!courseInfo) {
      res.status(404).json({ error: `Course not found: [${courseId}]` });
      return;
    }
    const { notesArchive: archive, notesFilepath: filepath } = courseInfo;
    counts = await fetchProblemCounts(archive, filepath);
    CACHE.set(courseId, { counts, lastUpdatedTs_ms: Date.now() });
  }

  res.status(200).json(counts);
}
