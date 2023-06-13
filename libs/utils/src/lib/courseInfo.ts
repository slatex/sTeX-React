export interface CourseInfo {
  courseName: string;

  notesArchive: string;
  notesFilepath: string;
  landingFilepath: string;
  notesLink: string;
  imageLink: string;
  courseHome: string;
  cardsLink: string;
  slidesLink: string;
  forumLink: string;
}

export function getSlidesLink(courseId: string) {
  return `/course-view/${courseId}`;
}

export function getForumLink(courseId: string) {
  return `/forum/${courseId}`;
}

export function getCardsLink(courseId: string) {
  return `/flash-cards/${courseId}`;
}

export function getCourseHome(courseId: string) {
  return `/course-home/${courseId}`;
}

export function getNotesLink(courseId: string) {
  return `/course-notes/${courseId}`;
}

export const CURRENT_TERM = 'SS23';

function createCourseInfo(
  courseId: string,
  courseName: string,
  notesArchive: string,
  notesFilepath: string,
  landingFilepath: string
): CourseInfo {
  return {
    courseName,
    imageLink: `/${courseId}.jpg`,
    notesArchive,
    notesFilepath,
    courseHome: getCourseHome(courseId),
    notesLink: getNotesLink(courseId),
    cardsLink: getCardsLink(courseId),
    slidesLink: getSlidesLink(courseId),
    forumLink: getForumLink(courseId),
    landingFilepath

  };
}
export const COURSES_INFO: { [courseId: string]: CourseInfo } = {
  'ai-1': createCourseInfo(
    'ai-1',
    'Artifical Intelligence - I',
    'MiKoMH/AI',
    'course/notes/notes1.xhtml',
    'course/notes/coursepage1',
  ),
  'ai-2': createCourseInfo(
    'ai-2',
    'Artifical Intelligence - II',
    'MiKoMH/AI',
    'course/notes/notes2.xhtml',
    'course/notes/coursepage2'
  ),
  'iwgs-1': createCourseInfo(
    'iwgs-1',
    'IWGS - I',
    'MiKoMH/IWGS',
    'course/notes/notes-part1.xhtml',
    'course/notes/coursepage1'
  ),
  'iwgs-2': createCourseInfo(
    'iwgs-2',
    'IWGS - II',
    'MiKoMH/IWGS',
    'course/notes/notes-part2.xhtml',
    'course/notes/coursepage2'
  ),
  krmt: createCourseInfo(
    'krmt',
    'Knowledge Representation for Mathematical Theories',
    'MiKoMH/KRMT',
    'course/notes/notes.xhtml',
    'course/notes/coursepage'
  ),
  lbs: createCourseInfo(
    'lbs',
    'Logic-based Natural Language Semantics',
    'MiKoMH/LBS',
    'course/notes/notes.xhtml',
    'course/notes/coursepage'
  ),
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
  clipId?: string; // https://fau.tv/clip/id/{clipId}
}

export interface CoverageTimeline {
  [courseId: string]: CoverageSnap[];
}
