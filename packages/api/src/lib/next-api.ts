import { SlideElement } from './ftml-viewer-base';
import { SmileyCognitiveValues } from './lmp';
import axios from 'axios';

export interface CardsWithSmileys {
  conceptUri: string;
  definitionUri: string;
  smileys: SmileyCognitiveValues;
  chapterTitle: string;
  sectionTitle: string;
}

export interface SectionInfo {
  id: string;
  uri: string;
  level: number /* top level nodes have level 0 */;
  title: string;
  clipId?: string;
  clipInfo?: {
    [slideUri: string]: ClipInfo[];
  };
  timestamp_ms?: number;

  children: SectionInfo[];
}

export enum SlideType {
  FRAME = 'FRAME',
  TEXT = 'TEXT',
}

export interface Slide {
  slideType: SlideType;
  paragraphs?: Extract<SlideElement, { type: 'Paragraph' }>[];
  slide?: Extract<SlideElement, { type: 'Slide' }>;
  preNotes: Extract<SlideElement, { type: 'Paragraph' }>[];
  postNotes: Extract<SlideElement, { type: 'Paragraph' }>[];
  sectionId: string;
}

export interface ClipDetails {
  r360?: string;
  r720?: string;
  r1080?: string;
  sub?: string;
}

export interface SlideClipInfo {
  clipId: string;
  startTimeSec?: number;
  endTimeSec?: number;
}

export interface ClipInfo {
  video_id: string;
  start_time?: number;
  end_time?: number;
}
export interface ClipMetaData {
  start_time?: number;
  end_time?: number;
  sectionId?: string;
  sectionTitle?: string;
  sectionUri?: string;
  slideUri?: string;
  slideContent?: string;
  slideHtml?: string;
  ocr_slide_content?: string;
}

export interface GetSlidesResponse {
  [sectionId: string]: Slide[];
}

export async function getSlides(courseId: string, sectionId: string): Promise<Slide[]> {
  const response = await axios.get<GetSlidesResponse>('/api/get-slides', {
    params: { courseId, sectionIds: sectionId }
  });
  return response.data[sectionId] || [];
}
