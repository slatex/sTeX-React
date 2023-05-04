export interface CourseInfo {
  courseName: string;

  notesArchive: string;
  notesFilepath: string;
  notesLink: string;
  imageLink: string;
  courseHome: string;
  cardsLink: string;
  slidesLink?: string;
}

export function getSlidesLink(courseId: string) {
  return `/course-view/${courseId}`;
}

export function getCardsLink(courseId: string) {
  return `/flash-cards/${courseId}`;
}

export function getCourseHome(courseId: string) {
  return `/course-home/${courseId}`;
}

export function getNotesLink(archive: string, filepath: string) {
  //   :sTeX/document?archive=problems/maai-test&filepath=mathliteracy/prob/problem003.xhtml
  const path = `:sTeX/document?archive=${archive}&filepath=${filepath}`;
  return '/browser/' + encodeURIComponent(path);
}

export const COURSES_INFO: { [courseId: string]: CourseInfo } = {
  'ai-1': {
    courseName: 'Artifical Intelligence - I',
    imageLink: '/ai-1.jpg',

    notesArchive: 'MiKoMH/AI',
    notesFilepath: 'course/notes/notes1.xhtml',
    courseHome: getCourseHome('ai-1'),
    notesLink: getNotesLink('MiKoMH/AI', 'course/notes/notes1.xhtml'),
    cardsLink: getCardsLink('ai-1'),
    // slidesLink: getSlidesLink('ai-1'),
  },
  'ai-2': {
    courseName: 'Artifical Intelligence - II',
    imageLink: '/ai-2.jpg',

    notesArchive: 'MiKoMH/AI',
    notesFilepath: 'course/notes/notes2.xhtml',
    courseHome: getCourseHome('ai-2'),
    notesLink: getNotesLink('MiKoMH/AI', 'course/notes/notes2.xhtml'),
    cardsLink: getCardsLink('ai-2'),
    // slidesLink: getSlidesLink('ai-2'),
  },
  'iwgs-1': {
    courseName: 'IWGS - I',
    imageLink: '/iwgs-1.jpg',

    notesArchive: 'MiKoMH/IWGS',
    notesFilepath: 'course/notes/notes-part1.xhtml',
    courseHome: getCourseHome('iwgs-1'),
    notesLink: getNotesLink('MiKoMH/IWGS', 'course/notes/notes-part1.xhtml'),
    cardsLink: getCardsLink('iwgs-1'),
    // slidesLink: getSlidesLink('iwgs-1'),
  },
  'iwgs-2': {
    courseName: 'IWGS - II',
    imageLink: '/iwgs-2.jpg',

    notesArchive: 'MiKoMH/IWGS',
    notesFilepath: 'course/notes/notes-part2.xhtml',
    courseHome: getCourseHome('iwgs-2'),
    notesLink: getNotesLink('MiKoMH/IWGS', 'course/notes/notes-part2.xhtml'),
    cardsLink: getCardsLink('iwgs-2'),
    // slidesLink: getSlidesLink('iwgs-2'),
  },
  krmt: {
    courseName: 'Knowledge Representation for Mathematical Theories',
    imageLink: '/krmt.png',

    notesArchive: 'MiKoMH/KRMT',
    notesFilepath: 'course/notes/notes.xhtml',
    courseHome: getCourseHome('krmt'),
    notesLink: getNotesLink('MiKoMH/KRMT', 'course/notes/notes.xhtml'),
    cardsLink: getCardsLink('krmt'),
    // slidesLink: getSlidesLink('krmt'),
  },
  lbs: {
    courseName: 'Logic-based Natural Language Semantics',
    imageLink: '/lbs.jpg',

    notesArchive: 'MiKoMH/LBS',
    notesFilepath: 'course/notes/notes.xhtml',
    courseHome: getCourseHome('lbs'),
    notesLink: getNotesLink('MiKoMH/LBS', 'course/notes/notes.xhtml'),
    cardsLink: getCardsLink('lbs'),
    // slidesLink: getSlidesLink('lbs'),
  },
};

export function getCourseId({
  archive,
  filepath,
}: {
  archive: string;
  filepath: string;
}) {
  for (const [courseId, info] of Object.entries(COURSES_INFO)) {
    if (archive === info.notesArchive && filepath === info.notesFilepath)
      return courseId;
  }
  return undefined;
}

export interface CoverageSnap {
  timestamp_ms: number;
  sectionName: string;
}

export interface CoverageTimeline {
  [courseId: string]: CoverageSnap[];
}
