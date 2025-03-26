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

export interface CourseCards {
  [sectionTitle: string]: {
    chapterTitle: string;
    id: string;
    uris: string[];
  };
}
interface TopLevelSection {
  id: string;
  uri: string;
  chapterTitle: string;
  sectionTitle: string;
}

function getChapterAndSections(
  toc: TOCElem,
  chapterTitle = '',
  parentUri?: string
): TopLevelSection[] {
  const sections: TopLevelSection[] = [];

  if (toc.type === 'Paragraph' || toc.type === 'Slide' || toc.children.length === 0) {
    return sections;
  }
  const currentUri = toc.type === 'Inputref' ? toc.uri : parentUri;
  const effectiveChapterTitle = chapterTitle || (toc.type === 'Section' ? toc.title : '');
  if (toc.type === 'Section') {
    sections.push({
      id: toc.id,
      uri: currentUri,
      chapterTitle: effectiveChapterTitle,
      sectionTitle: toc.title,
    });
  }
  for (const child of toc.children) {
    sections.push(...getChapterAndSections(child, effectiveChapterTitle, currentUri));
  }
  return sections;
}

export async function getCardsBySection(notesUri: string) {
  const docSections = await getDocumentSections(notesUri);
  const tocContent = docSections[1];
  const topLevelSections = tocContent.map((toc) => getChapterAndSections(toc)).flat();
  const courseCards: CourseCards = {};
  const promises = topLevelSections.map(({ uri }) => getDefiniedaInDoc(uri));
  const results = await Promise.all(promises);
  topLevelSections.forEach((section, index) => {
    const { chapterTitle, id, sectionTitle } = section;
    const cards = results[index];
    const parsedCards = JSON.parse(cards as string);
    const uris = parsedCards?.results?.bindings.map((card) => card.s.value);
    courseCards[sectionTitle] = { chapterTitle, id, uris };
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
