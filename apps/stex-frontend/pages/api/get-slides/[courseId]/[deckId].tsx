import { getSectionInfo } from '@stex-react/utils';
import { getOuterHTML, textContent } from 'domutils';
import * as htmlparser2 from 'htmlparser2';
import { TreeNode } from '../../../../ai-notes.preval';
import { AI_1_DECK_IDS } from '../../../../course_info/ai-1-notes';
import { Slide, SlideReturn, SlideType } from '../../../../shared/slides';
import {
  AI_ROOT_NODE,
  deckIdToNodeId,
  findNode,
  getFileContent,
  NodeId, nodeId, nodeIdToDeckId
} from '../../notesHelpers';

function FrameSlide(slideContent: any): Slide {
  return {
    slideContent: getOuterHTML(slideContent),
    slideType: SlideType.FRAME,
    autoExpand: false,
    preNotes: [],
    postNotes: [],
  };
}
function TextSlide(slideContent: any, titleElement?: any): Slide {
  let autoExpand = false;
  if (titleElement) {
    const titleText = textContent(titleElement);
    autoExpand = !titleText || titleText.startsWith('http');
  }
  return {
    slideContent: getOuterHTML(slideContent),
    slideType: SlideType.TEXT,
    autoExpand,
    preNotes: [],
    postNotes: [],
  };
}

function trimElements(elements: string[]) {
  /* TODO: remove whitespace elements at beginning and end. */
  return elements;
}

async function getSlidesForDocNodeAfterRef(
  node: any,
  isDoc: boolean,
  titleElement?: Element,
  afterThisRef?: NodeId
): Promise<SlideReturn> {
  //console.log(`docNodeAfter: ${afterThisRef?.filepath}`);
  const slides = [];
  let foundSection = !afterThisRef;
  let sectionHasEnded = false;

  if (!isDoc && node.attribs) {
    const property = node.attribs['property'];
    if (property === 'stex:frame' && foundSection) {
      return {
        slides: [FrameSlide(node)],
        foundSection,
        sectionHasEnded,
      };
    }

    const embedUrl = node.attribs['data-inputref-url'];

    if (embedUrl) {
      const { archive, filepath } = getSectionInfo(embedUrl);

      if (afterThisRef) {
        return {
          slides: [],
          foundSection:
            afterThisRef.archive === archive &&
            afterThisRef.filepath === filepath,
          sectionHasEnded: false,
        };
      }
      const nodeId = { archive, filepath };
      //console.log(`Fetching from: ${nodeId.filepath}`);
      const ret = await getSlidesForDocAfterRef(nodeId, node, undefined);
      if (AI_1_DECK_IDS.indexOf(nodeIdToDeckId(nodeId)) !== -1) {
        //console.log(`ended with ${nodeId.filepath}`);
        ret.sectionHasEnded = true;
      }
      return ret;
    }
  }
  const children = node.childNodes || [];
  const preNotes: string[] = [];
  //console.log(children.length);
  for (let i = 0, afterThisRef2 = afterThisRef; i < children.length; i++) {
    const child = children[i];
    //if (!(child instanceof Element)) {
    if (!child.attribs && !child.children) {
      //console.log(i);
      //console.log(child);
      continue;
    }
    const {
      slides: subSlides,
      foundSection: found,
      sectionHasEnded: sectionEnd,
    } = await getSlidesForDocNodeAfterRef(
      child,
      false,
      undefined,
      afterThisRef2
    );
    if (!afterThisRef2) {
      if (subSlides.length > 0) {
        subSlides[0].preNotes = [...preNotes, ...subSlides[0].preNotes];
        preNotes.length = 0;
      } else {
        preNotes.push(getOuterHTML(child));
      }
    }
    slides.push(...subSlides);
    if (found) {
      foundSection = true;
      afterThisRef2 = undefined;
    }
    if (sectionEnd) {
      sectionHasEnded = true;
      break;
    }
  }
  if (preNotes.length > 0 && slides.length > 0) {
    slides[slides.length - 1].postNotes.push(...preNotes);
  }
  const numFrameOrExpandableSlides = slides.filter(
    (s) => s.slideType === SlideType.FRAME || s.autoExpand
  ).length;
  if (
    !afterThisRef &&
    isDoc &&
    numFrameOrExpandableSlides === 0 &&
    !sectionHasEnded
  ) {
    // TODO: search for body, instead of relying it being the first child.
    const body = (node as any).childNodes[1];
    if (body) {
      if (body.tagName?.toUpperCase() === 'BODY') {
        body.tagName = 'div';
      }

      body.attribs['style'] = 'display: block;'; // was width:921.4425px
      body.attribs['class'] = 'text-frame';
      return {
        slides: [TextSlide(body, titleElement)],
        foundSection,
        sectionHasEnded,
      };
    }
  }
  return { slides, foundSection, sectionHasEnded };
}

async function getSlidesForDocAfterRef(
  curr: NodeId,
  title?: Element,
  afterThisRef?: NodeId
): Promise<SlideReturn> {
  //console.log(`slides from ${curr.filepath} after ${afterThisRef?.filepath}`);
  const data = await getFileContent(curr);
  const htmlDoc = htmlparser2.parseDocument(data);
  return await getSlidesForDocNodeAfterRef(htmlDoc, true, title, afterThisRef);
}

export default async function handler(req, res) {
  const { courseId, deckId: deckIdEncoded } = req.query;
  const deckId = decodeURIComponent(deckIdEncoded);
  if (courseId !== 'ai-1') {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }

  const lastSectionEndNode = deckIdToNodeId(deckId);
  const slides: Slide[] = [];
  const node = findNode(lastSectionEndNode, AI_ROOT_NODE);
  // console.log(node);
  if (!node) {
    const slideReturn = await getSlidesForDocAfterRef(nodeId(AI_ROOT_NODE));
    slides.push(...slideReturn.slides);
  }
  let ancestorElement: TreeNode | null = node;
  while (ancestorElement?.parent) {
    //console.log(ancestorElement);
    const slideReturn = await getSlidesForDocAfterRef(
      nodeId(ancestorElement.parent),
      undefined,
      nodeId(ancestorElement)
    );
    slides.push(...slideReturn.slides);
    if (slideReturn.sectionHasEnded) break;
    ancestorElement = ancestorElement.parent;
  }
  for (const slide of slides) {
    slide.preNotes = trimElements(slide.preNotes);
    slide.postNotes = trimElements(slide.postNotes);
  }
  //console.log(slides);

  return res.status(200).json(slides);
}
