import { FileLocation } from '@stex-react/utils';
import { SmileyCognitiveValues } from './lmp';

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
  clipInfo?: {
    [slideIndex: number]: ClipInfo[];
  };
  timestamp_ms?: number;

  children: SectionInfo[];
}

export enum SlideType {
  FRAME = 'FRAME',
  TEXT = 'TEXT',
}

export interface Slide extends FileLocation {
  slideContent: string;
  slideType: SlideType;
  autoExpand: boolean;
  preNotes: string[];
  postNotes: string[];
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
  sectionId?: string;
  title?: string;
  slideIndex?: number;
  thumbnail?: string;
  slideContent?: string;
  ocr_slide_content?: string;
}
