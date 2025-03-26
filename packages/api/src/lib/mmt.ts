import {
  COURSES_INFO,
  CURRENT_TERM,
  CourseInfo,
  FileLocation,
  convertHtmlStringToPlain,
  createCourseInfo,
} from '@stex-react/utils';
import axios from 'axios';
import { ArchiveIndex, Institution } from './flams-types';
import { FLAMSServer } from './flams';

const FLAMS_SERVER_URL = 'https://mmt.beta.vollki.kwarc.info';
const server = new FLAMSServer(FLAMS_SERVER_URL);

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
export async function getProblemIdsForConcept(mmtUrl: string, conceptUri: string) {
  const url = `${mmtUrl}/:sTeX/query/problems?path=${conceptUri}`;
  const resp = await axios.get(url);
  const problemIds = resp.data as string[];
  if (!problemIds?.length) return [];
  return [...new Set(problemIds)];
}

export async function getProblemIdsForFile(mmtUrl: string, archive: string, filepath: string) {
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
export async function getLearningObjectShtml(mmtUrl: string, objectId: string) {
  const url = `${mmtUrl}/:sTeX/loraw?${objectId}`;
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
  archive: string | undefined,
  filepath: string | undefined,
  sectionId: string | undefined,
  sectionData: SectionsAPIData | undefined,
  ancestors: SectionsAPIData[] = []
): SectionsAPIData[] | undefined {
  if (!sectionData || !sectionId) return undefined;

  if (archive && filepath && sectionData.archive === archive && sectionData.filepath === filepath) {
    return [...ancestors, sectionData];
  }
  if (sectionId && sectionData.id === sectionId) {
    return [...ancestors, sectionData];
  }
  for (const child of sectionData.children || []) {
    const foundAncestors = getAncestors(archive, filepath, sectionId, child, [
      ...ancestors,
      sectionData,
    ]);
    if (foundAncestors?.length) return foundAncestors;
  }
  return undefined;
}

export function lastFileNode(ancestors: SectionsAPIData[] | undefined) {
  if (!ancestors?.length) return undefined;
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (isFile(ancestors[i])) return ancestors[i];
  }
  return undefined;
}

export function getCoveredSections(
  startSecNameExcl: string,
  endSecNameIncl: string,
  sectionData: SectionsAPIData | undefined,
  started = false
): {
  started: boolean;
  ended: boolean;
  fullyCovered: boolean;
  coveredSectionIds: string[];
} {
  const wasStartedForMe = started;
  if (!sectionData) return { started, ended: true, coveredSectionIds: [], fullyCovered: false };

  const isSec = isSection(sectionData);
  let iAmEnding = false;
  if (isSec) {
    const sectionName = convertHtmlStringToPlain(sectionData.title || '');
    if (sectionName === startSecNameExcl) started = true;
    iAmEnding = sectionName === endSecNameIncl;
  }

  let allChildrenCovered = true;
  const coveredSectionIds: string[] = [];
  for (const child of sectionData.children || []) {
    const cResp = getCoveredSections(startSecNameExcl, endSecNameIncl, child, started);
    if (!cResp.fullyCovered) allChildrenCovered = false;
    coveredSectionIds.push(...cResp.coveredSectionIds);

    if (cResp.started) started = true;
    if (cResp.ended) {
      return {
        started,
        ended: true,
        fullyCovered: false,
        coveredSectionIds,
      };
    }
  }

  const fullyCovered = allChildrenCovered && wasStartedForMe;
  if (sectionData.id && fullyCovered) coveredSectionIds.push(sectionData.id);
  return { started, ended: iAmEnding, fullyCovered, coveredSectionIds };
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
  for (const child of sectionData.children || []) {
    const foundNode = findFileNode(archive, filepath, child);
    if (foundNode) return foundNode;
  }
  return undefined;
}

export function hasSectionChild(node?: SectionsAPIData) {
  return node?.children?.some((child) => isSection(child));
}

export function isFile(data: SectionsAPIData) {
  return data.archive && data.filepath ? true : false;
}
export function isSection(data: SectionsAPIData) {
  return !isFile(data);
}
export async function getDocumentSections(notesUri: string) {
  const resp = await server.contentToc({ uri: notesUri });
  return resp;
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
  university = 'university',
}
export interface Person {
  name: string;
}

let CACHED_ARCHIVE_INDEX: ArchiveIndex[] | undefined = undefined;
let CACHED_INSTITUTION_INDEX: Institution[] | undefined = undefined;

export async function getDocIdx(institution?: string) {
  if (!CACHED_ARCHIVE_INDEX) {
    const res = await server.index();
    if (res) {
      CACHED_INSTITUTION_INDEX = res[0] as Institution[];
      CACHED_ARCHIVE_INDEX = res[1] as ArchiveIndex[];
      CACHED_ARCHIVE_INDEX.forEach((doc) => {
        if (doc.type === 'course') {
          doc.instances = doc.instances?.map((i) => ({
            ...i,
            semester: i.semester.replace('/', '-'),
          }));
        }
      });
    }
  }
  const archiveIndex = CACHED_ARCHIVE_INDEX || [];
  const institutionIndex = CACHED_INSTITUTION_INDEX || [];

  if (!institution) {
    return [...archiveIndex, ...institutionIndex];
  }

  const filteredArchiveIndex = archiveIndex.filter(
    (doc) => doc.type === 'course' && doc.institution === institution
  );

  return [...filteredArchiveIndex, ...institutionIndex];
}

export async function getCourseInfo(institution?: string) {
  /*  const filtered = { ...COURSES_INFO };

  // Don't show Luka's course on production.
  if (process.env['NEXT_PUBLIC_SITE_VERSION'] === 'production') {
    delete filtered['f29fa1'];
  }
  return filtered;*/
  try {
    const docIdx = await getDocIdx(institution);
    const courseInfo: { [courseId: string]: CourseInfo } = {};
    for (const doc of docIdx) {
      if (doc.type !== DocIdxType.course) continue;
      if (!doc.acronym || !doc.landing || !doc.notes) continue;
      doc.acronym = doc.acronym.toLowerCase();

      const isCurrent = doc.instances?.some((i) => i.semester === CURRENT_TERM);

      courseInfo[doc.acronym] = createCourseInfo(
        doc.acronym,
        doc.title,
        doc.notes,
        doc.landing,
        isCurrent,
        ['lbs', 'ai-1', 'iwgs-1'].includes(doc.acronym) ? true : doc.quizzes ?? false,
        doc.institution,
        doc.instances,
        doc.instructors,
        doc.teaser,
        doc.slides
      );
    }
    return courseInfo;
  } catch (err) {
    console.log(err);
    return COURSES_INFO;
  }
}

// export async function getCourseId(
//   mmtUrl: string,
//   institution: string,
//   { archive, filepath }: FileLocation
// ) {
//   const courses = await getCourseInfo(institution);
//   for (const [courseId, info] of Object.entries(courses)) {
//     if (archive === info.notesArchive && filepath === info.notesFilepath) return courseId;
//   }
//   return undefined;
// }

/////////////////////
// :sTeX/definienda
/////////////////////
export interface DefiniendaItem {
  id: string;

  // These are the URIs of the symbols.
  symbols: string[];
}

// Gets list of symbols defined in a document. Includes nested docs.
export async function getDefiniedaInDoc(uri: string) {
  const query = `SELECT DISTINCT ?s WHERE { <${uri}> (ulo:contains|dc:hasPart)* ?q. ?q ulo:defines ?s.}`;
  const resp = await axios.post(
    `${FLAMS_SERVER_URL}/api/backend/query`,
    { query },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return resp.data as SparqlResponse;
}

export async function getUriFragment(URI: string) {
  const resp = await axios.get(`https://stexmmt.mathhub.info//:sTeX/fragment?${URI}`);
  return resp.data as string;
}

export function conceptUriToName(uri: string) {
  if (!uri) return uri;
  const lastIndex = uri.lastIndexOf('?');
  return uri.substring(lastIndex + 1);
}
//////////////////
// :query/sparql
//////////////////

export const ALL_LO_TYPES = [
  'para', // synomym: symdoc
  'definition',
  'problem',
  'example',
  'statement', // synomym: assertion
] as const;
export type LoType = (typeof ALL_LO_TYPES)[number];
export interface SparqlResponse {
  head?: {
    vars: string[];
  };
  results?: {
    bindings: Record<string, { type: string; value: string }>[];
  };
}
export async function sparqlQuery(mmtUrl: string, query: string) {
  const resp = await axios.post(`${mmtUrl}/:query/sparql`, query, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return resp.data as SparqlResponse;
}

function getSparlQueryForDependencies(archive: string, filepath: string) {
  const lastDot = filepath.lastIndexOf('.');
  filepath = filepath.slice(0, lastDot) + '.omdoc';
  const omdoc = `http://mathhub.info/${archive}/${filepath}`;
  return `SELECT DISTINCT ?x WHERE {
  <${omdoc}#> (<http://mathhub.info/ulo#crossrefs>|<http://mathhub.info/ulo#specifies>|<http://mathhub.info/ulo#contains>|<http://mathhub.info/ulo#has-language-module>)+/<http://mathhub.info/ulo#crossrefs> ?x .
  ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://mathhub.info/ulo#constant> .
  MINUS {
    <${omdoc}#> (<http://mathhub.info/ulo#crossrefs>|<http://mathhub.info/ulo#specifies>|<http://mathhub.info/ulo#contains>|<http://mathhub.info/ulo#has-language-module>)+/(<http://mathhub.info/ulo#defines>|^<http://mathhub.info/ulo#docref>) ?x .
  }.
}`;
}
export async function getSectionDependencies(mmtUrl: string, archive: string, filepath: string) {
  const query = getSparlQueryForDependencies(archive, filepath);
  const sparqlResponse = await sparqlQuery(mmtUrl, query);

  const dependencies: string[] = [];
  for (const binding of sparqlResponse.results?.bindings || []) {
    dependencies.push(binding['x'].value);
  }
  return dependencies;
}

export const ALL_DIM_CONCEPT_PAIR = ['objective', 'precondition'] as const;
export const ALL_NON_DIM_CONCEPT = ['crossrefs', 'specifies', 'defines', 'example-for'] as const;
export const ALL_LO_RELATION_TYPES = [...ALL_DIM_CONCEPT_PAIR, ...ALL_NON_DIM_CONCEPT] as const;

export type LoRelationToDimAndConceptPair = (typeof ALL_DIM_CONCEPT_PAIR)[number];
export type LoRelationToNonDimConcept = (typeof ALL_NON_DIM_CONCEPT)[number];
export type AllLoRelationTypes = (typeof ALL_LO_RELATION_TYPES)[number];

export const getSparqlQueryForLoRelationToDimAndConceptPair = (uri: string) => {
  if (!uri) {
    console.error('URI is absent');
    return;
  }
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX ulo: <http://mathhub.info/ulo#>

                SELECT ?learningObject ?relation ?obj1 (GROUP_CONCAT(CONCAT(STR(?relType), "=", STR(?obj2)); SEPARATOR="; ") AS ?relatedData)
                WHERE {
                        ?learningObject ?relation ?obj1 .
                        ?obj1 ?relType ?obj2 .
                        FILTER(!CONTAINS(STR(?obj2), "?term")).
                        FILTER(!CONTAINS(STR(?obj2), "?REF")).
                        FILTER(CONTAINS(STR(?learningObject), "${encodeURI(uri)}")).
                        VALUES ?relation {
                                ulo:precondition
                                ulo:objective 
                                }
                      }
                GROUP BY ?learningObject ?relation ?obj1 `;
  return query;
};

export const getSparqlQueryForLoRelationToNonDimConcept = (uri: string) => {
  if (!uri) {
    console.error('URI is absent');
    return;
  }
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX ulo: <http://mathhub.info/ulo#>

                SELECT ?learningObject ?relation ?obj1
                WHERE {
                        ?learningObject ?relation ?obj1 .
                        FILTER(!CONTAINS(STR(?obj1), "?term")).
                        FILTER(!CONTAINS(STR(?obj1), "?REF")).
                         FILTER(CONTAINS(STR(?learningObject), "${encodeURI(uri)}")).
                         VALUES ?relation {
                                   ulo:crossrefs
                                   ulo:specifies
                                   ulo:defines
                                   ulo:example-for
                                   } 
                              }`;
  return query;
};
export const getProblemObject = async (mmtUrl: string, problemIdPrefix: string) => {
  if (!problemIdPrefix) {
    console.error('Problem ID prefix is required');
    return null;
  }
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ulo: <http://mathhub.info/ulo#>

    SELECT DISTINCT ?learningObject
    WHERE {
      ?learningObject rdf:type ulo:problem .
      FILTER(CONTAINS(STR(?learningObject), "${encodeURI(problemIdPrefix)}"))
    }
  `;

  try {
    const res = await sparqlQuery(mmtUrl, query);
    return res.results?.bindings[0]?.['learningObject']?.value ?? null;
  } catch (error) {
    console.error('Error executing SPARQL query:', error);
    throw error;
  }
};

export function getSparlQueryForNonDimConcepts() {
  return `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ulo: <http://mathhub.info/ulo#>

SELECT DISTINCT ?x
WHERE {
  ?lo ?type ?x.
  ?lo rdf:type ?loType.

  FILTER(!CONTAINS(STR(?x), "?term")).
  FILTER(!CONTAINS(STR(?x), "?REF")).
  FILTER(?type IN (ulo:crossrefs, ulo:defines, ulo:example-for, ulo:specifies)).
  FILTER(?loType IN (ulo:definition, ulo:problem, ulo:example, ulo:para, ulo:statement)).
}
`;
}

export function getSparlQueryForDimConcepts() {
  return `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
PREFIX ulo: <http://mathhub.info/ulo#>

SELECT DISTINCT ?x
WHERE {
?lo ?type ?b.
?b ulo:crossrefs ?x.
?lo rdf:type ?loType .

 FILTER(!CONTAINS(STR(?x), "?term")).
 FILTER(!CONTAINS(STR(?x), "?REF")).
  FILTER(?type IN (ulo:objective ,ulo:precondition )).
  FILTER(?loType IN (ulo:definition, ulo:problem, ulo:example, ulo:para, ulo:statement)).
}
`;
}

export function getSparqlQueryForLoString(loString: string, loTypes?: LoType[]) {
  if (!loString || !loString.trim()) return;
  const loTypesConditions =
    loTypes && loTypes.length > 0
      ? loTypes.map((loType) => `ulo:${loType}`).join(', ')
      : 'ulo:definition, ulo:problem, ulo:example, ulo:para, ulo:statement';
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ulo: <http://mathhub.info/ulo#>
    PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
    SELECT DISTINCT ?lo ?type (SHA256(STR(?lo)) AS ?hash)
    WHERE {
      ?lo rdf:type ?type .
      FILTER(?type IN (${loTypesConditions})).
      FILTER(CONTAINS(LCASE(STR(?lo)), "${encodeURI(loString)}")).
      FILTER(!CONTAINS(STR(?lo), "?term")).
      FILTER(!CONTAINS(STR(?lo), "?REF")).
    }
    ORDER BY ?hash
    LIMIT 300`;
  return query;
}
export function getSparqlQueryForNonDimConceptsAsLoRelation(
  conceptUris: string[],
  relations: LoRelationToNonDimConcept[],
  loTypes?: LoType[],
  loString?: string
) {
  if (!conceptUris?.length && (!loString || !loString.trim())) return;
  const uriConditions = conceptUris?.length
    ? conceptUris.map((uri) => `CONTAINS(STR(?obj1), "${encodeURI(uri)}")`).join(' || ')
    : 'false';
  const relationConditions = relations.map((relation) => `ulo:${relation}`).join(' ');
  const loTypesConditions =
    loTypes && loTypes.length > 0
      ? loTypes.map((loType) => `ulo:${loType}`).join(', ')
      : 'ulo:definition, ulo:problem, ulo:example, ulo:para, ulo:statement';
  const loStringFilter = loString
    ? `FILTER(CONTAINS(LCASE(STR(?lo)), "${encodeURI(loString)}")).`
    : '';

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ulo: <http://mathhub.info/ulo#>

    SELECT DISTINCT ?lo ?type
    WHERE {
      {
        ?lo ?relation ?obj1 .
        FILTER(
          ${uriConditions}
        )
        VALUES ?relation {
          ${relationConditions}
        }
      }

      ?lo rdf:type ?type .
      FILTER(?type IN (${loTypesConditions})).
      ${loStringFilter}
      FILTER(!CONTAINS(STR(?lo), "?term")).
      FILTER(!CONTAINS(STR(?lo), "?REF")).

    }LIMIT 300
  `;

  return query;
}

export function getSparqlQueryForDimConceptsAsLoRelation(
  conceptUris: string[],
  relations: LoRelationToDimAndConceptPair[],
  loTypes?: LoType[],
  loString?: string
) {
  if (!conceptUris?.length && (!loString || !loString.trim())) return;
  const uriConditions = conceptUris?.length
    ? conceptUris.map((uri) => `CONTAINS(STR(?obj1),"${encodeURI(uri)}")`).join(' || ')
    : 'false';
  const relationConditions = relations.map((relation) => `ulo:${relation}`).join(' ');
  const loTypesConditions =
    loTypes && loTypes.length > 0
      ? loTypes.map((loType) => `ulo:${loType}`).join(', ')
      : 'ulo:definition, ulo:problem, ulo:example, ulo:para, ulo:statement';
  const loStringFilter = loString
    ? `FILTER(CONTAINS(LCASE(STR(?lo)), "${encodeURI(loString)}")).`
    : '';
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ulo: <http://mathhub.info/ulo#>

SELECT ?lo ?type
WHERE {
?lo ?relation  ?bn.
?bn ?re2 ?obj1.
 FILTER(${uriConditions}
    )
  VALUES ?relation {
          ${relationConditions}
        } 
    ?lo rdf:type ?type .
      FILTER(?type IN (${loTypesConditions})).
      ${loStringFilter}
  FILTER(!CONTAINS(STR(?lo), "?term")).
  FILTER(!CONTAINS(STR(?lo), "?REF")).
}LIMIT 300
`;

  return query;
}
