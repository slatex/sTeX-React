import {
  COURSES_INFO,
  CURRENT_TERM,
  CourseInfo,
  FileLocation,
  createCourseInfo,
  localStore,
} from '@stex-react/utils';
import axios from 'axios';

///////////////////
// :sTeX/query/problems
///////////////////

/*
https://stexmmt.mathhub.info/:sTeX/query/problems
Without parameters, it will return all problems as standard SPARQL json with 
  1. the path of the problem
  2. the path of the objective symbol 
  3. the cognitive dimension

with a ?path= query parameter, it will return the list of problems with that 
particular path as objective

with both ?path=...&dimension=, it will also filter by dimension, e.g.:
https://stexmmt.mathhub.info/:sTeX/query/problems?path=http://mathhub.info/smglom/csp/mod?constraint-network?constraint%20network or
https://stexmmt.mathhub.info/:sTeX/query/problems?path=http://mathhub.info/smglom/csp/mod?constraint-network?constraint%20network&dimension=understand

if it has arguments archive/filePath as in other places, it will return an
array of objects with fields "path" and "problems", the former being a definiendum
and the second the list of problems with that definiendum as objective.
*/
export async function getProblemIdsForConcept(
  mmtUrl: string,
  conceptUri: string
) {
  const url = `${mmtUrl}/:sTeX/query/problems?path=${conceptUri}`;
  const resp = await axios.get(url);
  const problemIds = resp.data as string[];
  if (!problemIds?.length) return [];
  console.log(problemIds);
  console.log([...new Set(problemIds)]);
  return [...new Set(problemIds)];
}

export async function getProblemIdsForFile(
  mmtUrl: string,
  archive: string,
  filepath: string
) {
  const url = `${mmtUrl}/:sTeX/query/problems?archive=${archive}&filepath=${filepath}`;
  const resp = await axios.get(url);
  const infoByFile = resp.data as { path: string; problems: string[] }[];
  if (!infoByFile?.length) return [];
  const problemIds = new Set<string>();
  for (const { problems } of infoByFile) {
    problems.forEach(problemIds.add, problemIds);
  }
  return [...problemIds];
}

///////////////////
// :sTeX/loraw
///////////////////
export async function getProblemShtml(mmtUrl: string, problemId: string) {
  const url = `${mmtUrl}/:sTeX/loraw?${problemId}`;
  const resp = await axios.get(url);
  return resp.data as string;
}

///////////////////
// :sTeX/sections
///////////////////
export interface SectionsAPIData {
  archive?: string;
  filepath?: string;

  title?: string;
  id?: string;

  ids?: string[];
  children: SectionsAPIData[];
}

export function getAncestors(
  archive: string,
  filepath: string,
  sectionData: SectionsAPIData | undefined,
  ancestors: SectionsAPIData[] = []
): SectionsAPIData[] | undefined {
  if (!sectionData) return undefined;

  if (sectionData.archive === archive && sectionData.filepath === filepath) {
    return [...ancestors, sectionData];
  }
  for (const child of sectionData.children) {
    const foundAncestors = getAncestors(archive, filepath, child, [
      ...ancestors,
      sectionData,
    ]);
    if (foundAncestors?.length) return foundAncestors;
  }
  return undefined;
}

export function findFileNode(
  archive: string,
  filepath: string,
  sectionData: SectionsAPIData | undefined
): SectionsAPIData | undefined {
  if (!sectionData) return;
  if (sectionData.archive === archive && sectionData.filepath === filepath) {
    return sectionData;
  }
  for (const child of sectionData.children) {
    const foundNode = findFileNode(archive, filepath, child);
    if (foundNode) return foundNode;
  }
  return undefined;
}

export function hasSectionChild(node?: SectionsAPIData) {
  return node?.children?.some((child) => isSection(child));
}

export function is2ndLevelSection(
  archive: string,
  filepath: string,
  sectionData: SectionsAPIData
) {
  if(!localStore?.getItem('section-quiz')) return false; 
  const ancestors = getAncestors(archive, filepath, sectionData);
  if (!ancestors?.length) return false;
  if (!hasSectionChild(ancestors[ancestors.length - 1])) return false;
  return ancestors.filter(isSection).length <= 2;
}

export function isFile(data: SectionsAPIData) {
  return data.archive && data.filepath ? true : false;
}
export function isSection(data: SectionsAPIData) {
  return !isFile(data);
}
export async function getDocumentSections(
  mmtUrl: string,
  archive: string,
  filepath: string
) {
  if (!mmtUrl) return {} as SectionsAPIData;
  const resp = await axios.get(
    `${mmtUrl}/:sTeX/sections?archive=${archive}&filepath=${filepath}`
  );
  return resp.data as SectionsAPIData;
}

///////////////////////
// :sTeX/browser?menu
///////////////////////
export interface FileNode {
  label: string;

  // TODO: remove the link field after mmt removes it.
  link?: string;
  archive?: string;
  filepath?: string;

  children?: FileNode[];

  // This field is populated by frontend.
  autoOpen?: boolean;
}

// TODO: remove this function after mmt populates archive and filepath.
function populateArchiveAndFilepath(nodes?: FileNode[]) {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.link?.includes('xhtml')) {
      const match = /archive=([^&]+)&filepath=([^"]+xhtml)/g.exec(node.link);
      node.archive = match?.[1];
      node.filepath = match?.[2];
    }
    if (node.children) populateArchiveAndFilepath(node.children);
  }
}

let CACHED_DOCUMENT_TREE: FileNode[] | undefined = undefined;
export async function getDocumentTree(mmtUrl: string) {
  if (mmtUrl === null || mmtUrl === undefined) return [];
  if (!CACHED_DOCUMENT_TREE) {
    const resp = await axios.get(`${mmtUrl}/:sTeX/browser?menu`);
    CACHED_DOCUMENT_TREE = resp.data as FileNode[];
    populateArchiveAndFilepath(CACHED_DOCUMENT_TREE);
  }
  return CACHED_DOCUMENT_TREE;
}

//////////////////
// /:sTeX/docidx
//////////////////
export enum DocIdxType {
  course = 'course',
  library = 'library',
  book = 'book',
}
export interface Person {
  name: string;
}
export interface Instance {
  semester: string;
  instructor: string;
}
export interface DocIdx {
  type: DocIdxType;
  archive: string;
  title: string;

  // for type course
  landing?: string;
  acronym?: string;
  instructors?: Person[];
  institution?: string;
  notes?: string;
  slides?: string;
  thumbnail?: string;
  instances?: Instance[];
  quizzes?: boolean;

  // for type library
  teaser?: string;

  // for type book
  authors?: Person[];
  file?: string;
}

let CACHED_DOCIDX: DocIdx[] | undefined = undefined;
export async function getDocIdx(mmtUrl: string) {
  if (!mmtUrl) return [];
  if (!CACHED_DOCIDX) {
    console.log('getting docidx');
    const resp = await axios.get(`${mmtUrl}/:sTeX/docidx`);
    CACHED_DOCIDX = resp.data as DocIdx[];
  }
  return CACHED_DOCIDX;
}

export async function getCourseInfo(mmtUrl: string) {
  return COURSES_INFO;
  /*try {
    const docIdx = await getDocIdx(mmtUrl);
    const courseInfo: { [courseId: string]: CourseInfo } = {};
    for (const doc of docIdx) {
      if (doc.type !== DocIdxType.course) continue;
      if (!doc.acronym || !doc.landing || !doc.notes) continue;
      doc.acronym = doc.acronym.toLowerCase();

      const isCurrent = doc.instances?.some((i) => i.semester === CURRENT_TERM);

      courseInfo[doc.acronym] = createCourseInfo(
        doc.acronym,
        doc.title,
        doc.archive,
        doc.notes,
        doc.landing,
        isCurrent,
        doc.quizzes ?? false
      );
    }
    if (Object.keys(courseInfo).length === 0) {
      console.log('courseInfo is empty');
      return COURSES_INFO;
    }
    return courseInfo;
  } catch (err) {
    console.log(err);
    return COURSES_INFO;
  }*/
}

export async function getCourseId(
  mmtUrl: string,
  { archive, filepath }: FileLocation
) {
  const courses = await getCourseInfo(mmtUrl);
  for (const [courseId, info] of Object.entries(courses)) {
    if (archive === info.notesArchive && filepath === info.notesFilepath)
      return courseId;
  }
  return undefined;
}

/////////////////////
// :sTeX/definienda
/////////////////////
export interface DefiniendaItem {
  id: string;

  // These are the URIs of the symbols.
  symbols: string[];
}

// Gets list of symbols defined in a document. Includes nested docs.
export async function getDefiniedaInDoc(
  mmtUrl: string,
  archive: string,
  filepath: string
) {
  const resp = await axios.get(
    `${mmtUrl}/:sTeX/definienda?archive=${archive}&filepath=${filepath}`
  );
  return resp.data as DefiniendaItem[];
}

export async function getUriFragment(URI: string) {
  const resp = await axios.get(
    `https://stexmmt.mathhub.info//:sTeX/fragment?${URI}`
  );
  return resp.data as string;
}
