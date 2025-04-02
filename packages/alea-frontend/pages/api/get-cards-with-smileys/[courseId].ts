import {
  CardsWithSmileys,
  getCourseInfo,
  getDefiniedaInDoc,
  getDocumentSections,
  getUriSmileys,
  TOCElem,
} from '@stex-react/api';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];
const CARDS_CACHE: { [courseId: string]: CourseCards } = {};

interface CourseCards {
  [sectionTitle: string]: {
    chapterTitle: string;
    sectionUri: string;
    uris: string[];
  };
}
interface TopLevelSection {
  uri: string;
  chapterTitle: string;
  sectionTitle: string;
}

function getChapterAndSections(toc: TOCElem, chapterTitle = ''): TopLevelSection[] {
  if (toc.type === 'Paragraph' || toc.type === 'Slide') {
    return [];
  }
  if (toc.type === 'Section' && chapterTitle) {
    return [
      {
        uri: toc.uri,
        chapterTitle: chapterTitle,
        sectionTitle: toc.title,
      },
    ];
  } else {
    if (!chapterTitle) {
      if (toc.type === 'Section') chapterTitle = toc.title;
      else if (toc.type === 'SkippedSection') chapterTitle = 'Untitled';
    }
    const sections: TopLevelSection[] = [];
    for (const child of toc.children) {
      sections.push(...getChapterAndSections(child, chapterTitle));
    }

    return sections;
  }
}

export async function getCardsBySection(notesUri: string) {
  const docSections = await getDocumentSections(notesUri);
  const tocContent = docSections[1];
  const topLevelSections = tocContent.map((toc) => getChapterAndSections(toc)).flat();
  const courseCards: CourseCards = {};
  const cardsBySection = await Promise.all(
    topLevelSections.map(({ uri }) => getDefiniedaInDoc(uri))
  );
  topLevelSections.forEach((section, index) => {
    const { chapterTitle, uri, sectionTitle } = section;
    courseCards[sectionTitle] = { chapterTitle, sectionUri: uri, uris: cardsBySection[index] };
  });
  return courseCards;
}

export default async function handler(req, res) {
  const { courseId } = req.query;
  const Authorization = req.headers.authorization;
  const courses = await getCourseInfo();
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: `Course not found: [${courseId}]` });
    return;
  }

  if (!CARDS_CACHE[courseId]) {
    CARDS_CACHE[courseId] = await getCardsBySection(courseInfo.notes);
  }
  const cards = CARDS_CACHE[courseId];

  const uris = [];
  for (const chapter of Object.keys(cards)) {
    uris.push(...(cards[chapter]?.uris || []));
  }
  const smileyValues = Authorization ? await getUriSmileys(uris, { Authorization }) : new Map();

  const output: CardsWithSmileys[] = [];
  for (const sectionTitle of Object.keys(cards)) {
    const { chapterTitle, uris } = cards[sectionTitle];
    for (const uri of uris) {
      const smileys = smileyValues.get(uri) || {};
      output.push({ uri, chapterTitle, sectionTitle, smileys });
    }
  }

  res.status(200).json(output);
}
