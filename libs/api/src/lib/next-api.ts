import { SmileyCognitiveValues } from './lms';

export interface CardsWithSmileys {
  uri: string;
  smileys: SmileyCognitiveValues;
  chapterTitle: string;
  sectionTitle: string;
}

export interface SectionInfo {
  id: string;
  level: number /* top level nodes have level 0 */;
  title: string;
  clipId?: string;
  timestamp_ms?: number;

  children: SectionInfo[];
}
