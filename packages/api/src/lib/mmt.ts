import {
  COURSES_INFO,
  CURRENT_TERM,
  CourseInfo,
  createCourseInfo,
  getParamFromUri,
} from '@stex-react/utils';
import axios from 'axios';
import { FLAMSServer } from './flams';
import { ArchiveIndex, Institution, ProblemResponse, SolutionData } from './flams-types';
const server = new FLAMSServer(process.env['NEXT_PUBLIC_FLAMS_URL']!);

///////////////////
// :sTeX/loraw
///////////////////
export async function getLearningObjectShtml(mmtUrl: string, objectId: string) {
  const url = `${mmtUrl}/:sTeX/loraw?${objectId}`;
  const resp = await axios.get(url);
  return resp.data as string;
}

export async function getDocumentSections(notesUri: string) {
  return (await server.contentToc({ uri: notesUri })) ?? [[], []];
}

export async function getFTMLQuiz(uri: string) {
  return await server.quiz({ uri });
}

export async function batchGrade(submissions: [SolutionData[],(ProblemResponse | undefined)[]][]
) {
  return await server.batchGrade(...submissions);
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

export async function getSectionSlides(sectionUri: string) {
  return await server.slides({ uri: sectionUri });
}

export async function getSourceUrl(uri: string) {
  return await server.sourceFile({ uri });
}

export function getFTMLForConceptView(conceptUri: string) {
  const name = getParamFromUri(conceptUri, 's') ?? conceptUri;
  return `<span data-ftml-term="OMID" data-ftml-head="${conceptUri}" data-ftml-comp>${name}</span>`;
}

/////////////////////
// :sTeX/definienda
/////////////////////
export interface ConceptAndDefinition {
  conceptUri: string;
  definitionUri: string;
}

// Gets list of concepts and their definition in a section.
export async function getDefiniedaInSection(uri: string): Promise<ConceptAndDefinition[]> {
  const query = `SELECT DISTINCT ?q ?s WHERE { <${uri}> (ulo:contains|dc:hasPart)* ?q. ?q ulo:defines ?s.}`;

  const sparqlResponse = await getQueryResults(query);
  return (
    sparqlResponse?.results?.bindings.map((card) => ({
      conceptUri: card['s'].value,
      definitionUri: card['q'].value,
    })) || []
  );
}

export async function getProblemsForConcept(conceptUri: string) {
  const learningObjects = await server.learningObjects({ uri: conceptUri }, true);
  if (!learningObjects) return [];
  return learningObjects.filter((obj) => obj[1].type === 'Problem').map((obj) => obj[0]);
}

export async function getProblemsForSection(sectionUri: string): Promise<string[]> {
  const concepts = await getDefiniedaInSection(sectionUri);
  const conceptUris = concepts.map((item) => item.conceptUri);
  const uniqueProblemUrls = new Set<string>();
  await Promise.all(
    conceptUris.map(async (conceptUri) => {
      const problems = await getProblemsForConcept(conceptUri);
      problems.forEach((problem) => {
        uniqueProblemUrls.add(problem);
      });
    })
  );
  return Array.from(uniqueProblemUrls);
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

async function getQueryResults(query: string) {
  try {
    const resp = await axios.post(
      `${process.env['NEXT_PUBLIC_FLAMS_URL']}/api/backend/query`,
      { query },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    return JSON.parse(resp.data) as SparqlResponse;
  } catch (error) {
    console.error('Error executing SPARQL query:', error);
    throw error;
  }
}

export async function getSectionDependencies(sectionUri: string) {
  const query = `SELECT DISTINCT ?s WHERE {
  <${sectionUri}> (ulo:contains|dc:hasPart)* ?p.
  ?p ulo:crossrefs ?s.
  MINUS {
    <${sectionUri}> (ulo:contains|dc:hasPart)* ?p.
    ?p ulo:defines ?s.
  }
}`;
  const sparqlResponse = await getQueryResults(query);

  const dependencies: string[] = [];
  for (const binding of sparqlResponse.results?.bindings || []) {
    dependencies.push(binding['s'].value);
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
