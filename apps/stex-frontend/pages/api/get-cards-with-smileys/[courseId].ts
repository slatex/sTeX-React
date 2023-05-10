import {
  getDocumentSections,
  getUriSmileys,
  SectionsAPIData,
  SmileyCognitiveValues,
} from '@stex-react/api';
import {
  COURSES_INFO
} from '@stex-react/utils';
import axios from 'axios';

export const EXCLUDED_CHAPTERS = ['Preface', 'Administrativa', 'Resources'];
const CARDS_CACHE: { [courseId: string]: CourseCards } = {};
export interface CardsWithSmileys {
  uri: string;
  smileys: SmileyCognitiveValues;
  chapterTitle: string;
  sectionTitle: string;
}

export interface CourseCards {
  [sectionTitle: string]: {
    chapterTitle: string;
    id: string;
    uris: string[];
  };
}
interface TopLevelSection {
  id: string;

  archive: string;
  filepath: string;

  chapterTitle: string;
  sectionTitle: string;
}

function getSections(
  chapterTitle: string,
  data: SectionsAPIData,
  parentArchive: string | undefined,
  parentFilePath: string | undefined
): TopLevelSection[] {
  const { archive, filepath, title, id } = data;
  if (title?.length) {
    return [
      {
        id,
        archive: parentArchive,
        filepath: parentFilePath,
        chapterTitle,
        sectionTitle: title,
      },
    ];
  }
  if (archive?.length && filepath?.length) {
    parentArchive = archive;
    parentFilePath = filepath;
  }
  const sections: TopLevelSection[] = [];
  for (const c of data.children || []) {
    sections.push(
      ...getSections(chapterTitle, c, parentArchive, parentFilePath)
    );
  }
  return sections;
}

function getChapterAndSections(data: SectionsAPIData): TopLevelSection[] {
  const { title } = data;
  const sections: TopLevelSection[] = [];
  if (title?.length) {
    for (const c of data.children || []) {
      sections.push(...getSections(title, c, undefined, undefined));
    }
    return sections;
  }

  for (const c of data.children || []) {
    sections.push(...getChapterAndSections(c));
  }
  return sections;
}

export async function getCardsBySection(archive: string, filepath: string) {
  const docSections = await getDocumentSections(
    process.env.NEXT_PUBLIC_MMT_URL,
    archive,
    filepath
  );
  const topLevelSections = getChapterAndSections(docSections);
  const courseCards: CourseCards = {};
  for (const section of topLevelSections) {
    const { archive, filepath, chapterTitle, id } = section;

    const resp = await axios.get(
      `${process.env.NEXT_PUBLIC_MMT_URL}/:sTeX/definienda?archive=${archive}&filepath=${filepath}`
    );
    const cards: { id: string; symbols: string[] }[] = resp.data;
    const uris = cards.map((c) => c.symbols).flat();
    courseCards[section.sectionTitle] = { chapterTitle, id, uris };
  }
  return courseCards;
}

export default async function handler(req, res) {
  const { courseId } = req.query;
  const Authorization = req.headers.authorization;
  const courseInfo = COURSES_INFO[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: `Course not found: [${courseId}]` });
    return;
  }
  const { notesArchive: archive, notesFilepath: filepath } = courseInfo;
  if (!CARDS_CACHE[courseId]) {
    CARDS_CACHE[courseId] = await getCardsBySection(archive, filepath);
  }
  const cards = CARDS_CACHE[courseId];

  const uris = [];
  for (const chapter of Object.keys(cards)) {
    uris.push(...cards[chapter].uris);
  }

  const smileyValues = Authorization
    ? await getUriSmileys(uris, { Authorization })
    : new Map();

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
