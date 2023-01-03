import {
  FileLocation,
  getSectionInfo,
  stringToFileLoc,
} from '@stex-react/utils';
import { getOuterHTML, textContent } from 'domutils';
import * as htmlparser2 from 'htmlparser2';
import { TreeNode } from '../../../../../notes-trees.preval';
import { Slide, SlideReturn, SlideType } from '../../../../../shared/types';
import {
  findNode,
  getCourseRootNode,
  getFileContent,
  getText,
  previousNode,
} from '../../../notesHelpers';

function FrameSlide(slideContent: any, nodeId: FileLocation): Slide {
  return {
    slideContent: getOuterHTML(slideContent),
    slideType: SlideType.FRAME,
    autoExpand: false,
    preNotes: [],
    postNotes: [],
    archive: nodeId.archive,
    filepath: nodeId.filepath,
  };
}

function TextSlide(
  slideContent: any,
  nodeId: FileLocation,
  titleElement?: any
): Slide {
  let autoExpand = false;
  if (titleElement) {
    const titleText = textContent(titleElement);
    autoExpand = !titleText.trim().length || titleText.startsWith('http');
  }
  return {
    slideContent: getOuterHTML(slideContent),
    slideType: SlideType.TEXT,
    autoExpand,
    preNotes: [],
    postNotes: [],
    archive: nodeId.archive,
    filepath: nodeId.filepath,
  };
}

function trimElements(elements: string[]) {
  const filtered = [] as string[];
  let state = 'START';
  const buffer = [] as string[];

  for (const elementStr of elements) {
    const trimmed = getText(elementStr)
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // nbsp type elements
      .trim();
    const isSpace = trimmed.length === 0;
    if (isSpace) {
      if (state !== 'START') {
        buffer.push(elementStr);
      }
    } else {
      if (state === 'START') state = 'STARTED';
      filtered.push(...buffer, elementStr);
      buffer.length = 0;
    }
  }
  return filtered;
}

async function getSlidesForDocNodeAfterRef(
  nodeId: FileLocation,
  node: any,
  isDoc: string,
  endWith: FileLocation,
  titleElement?: Element,
  afterThisRef?: FileLocation
): Promise<SlideReturn> {
  //console.log(`docNodeAfter: ${afterThisRef?.filepath}`);
  const slides = [];
  let foundSection = !afterThisRef;
  let sectionHasEnded = false;

  if (!isDoc && node.attribs) {
    const property = node.attribs['property'];
    if (property === 'stex:frame' && foundSection) {
      return {
        slides: [FrameSlide(node, nodeId)],
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
      // console.log(`Found: ${nodeId.filepath}`);
      const ret = await getSlidesForDocAfterRef(
        nodeId,
        endWith,
        node,
        undefined
      );
      if (endWith.archive === archive && endWith.filepath === filepath) {
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
      nodeId,
      child,
      undefined,
      endWith,
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
    (s) => s.slideType === SlideType.FRAME || !s.autoExpand
  ).length;
  if (
    isDoc &&
    !afterThisRef &&
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
        slides: [TextSlide(body, nodeId, titleElement)],
        foundSection,
        sectionHasEnded,
      };
    }
  }
  return { slides, foundSection, sectionHasEnded };
}

async function getSlidesForDocAfterRef(
  curr: FileLocation,
  endWith: FileLocation,
  title?: Element,
  afterThisRef?: FileLocation
): Promise<SlideReturn> {
  //console.log(`slides from ${curr.filepath} after ${afterThisRef?.filepath}`);
  const data = await getFileContent(curr, process.env.NEXT_PUBLIC_MMT_URL);
  const htmlDoc = htmlparser2.parseDocument(data);

  return await getSlidesForDocNodeAfterRef(
    curr,
    htmlDoc,
    curr.filepath,
    endWith,
    title,
    afterThisRef
  );
}

const CACHED_SLIDES = new Map<string, Slide[]>();

//
// startWith: This function returns the content after the end of the node
// just before the node specified by 'startWith'.
// This means that it not only includes content from the slide specified by
// 'startWith' but also the content between predecessor node of 'startWith' and
// 'startWith'. Thus, the start can be said to be 'inclusive++' :D
//
// endWith: The functions returns the content till the end of the node just
// before the node specified by 'endWith'. Notably, the content in between
// 'endWith' and its predecessor is not included.
// Thus the end can said to be 'exclusive--' :D
export default async function handler(req, res) {
  const {
    courseId,
    startWith: startWithEncoded,
    endWith: endWithEncoded,
  } = req.query;
  const startWithStrNodeId = decodeURIComponent(startWithEncoded);
  const endWithStrNodeId = decodeURIComponent(endWithEncoded);
  const courseRootNode = getCourseRootNode(courseId);
  if (!courseRootNode) {
    res.status(404).json({ error: `[${courseId}] Course not found!` });
    return;
  }
  const cacheKey = `${courseId}||${startWithStrNodeId}||${endWithStrNodeId}`;
  const cached = CACHED_SLIDES.get(cacheKey);
  if (cached) {
    res.status(200).json(cached);
    return;
  }
  const slides: Slide[] = [];
  const startNode = findNode(
    stringToFileLoc(startWithStrNodeId),
    courseRootNode
  );
  if (!startNode) {
    res.status(400).json({ error: `Not found: ${startWithEncoded}` });
    return;
  }
  const exclusiveStartNode = previousNode(startNode);

  const inclusiveEndNode = previousNode(
    findNode(stringToFileLoc(endWithStrNodeId), courseRootNode)
  );
  if (!inclusiveEndNode) {
    res
      .status(500)
      .json({ error: `Ending node ${endWithStrNodeId} not found.` });
    return;
  }

  console.log(
    `${startNode.filepath} --> (${exclusiveStartNode?.archive}||${
      exclusiveStartNode?.filepath || 'initial'
    },
    ${inclusiveEndNode?.archive}||${inclusiveEndNode?.filepath}]`
  );

  if (!exclusiveStartNode) {
    const slideReturn = await getSlidesForDocAfterRef(
      courseRootNode,
      inclusiveEndNode
    );
    slides.push(...slideReturn.slides);
  }
  let ancestorElement: TreeNode | null = exclusiveStartNode;
  while (ancestorElement?.parent) {
    console.log(
      `big loop: ${ancestorElement.parent.filepath} after ${ancestorElement.filepath}`
    );
    const slideReturn = await getSlidesForDocAfterRef(
      ancestorElement.parent,
      inclusiveEndNode,
      undefined,
      ancestorElement
    );
    slides.push(...slideReturn.slides);
    if (slideReturn.sectionHasEnded) break;
    ancestorElement = ancestorElement.parent;
    // fix properly using sectionhasended. this is a hack.
    if (ancestorElement.filepath === inclusiveEndNode.filepath) break;
  }
  for (const slide of slides) {
    slide.preNotes = trimElements(slide.preNotes);
    slide.postNotes = trimElements(slide.postNotes);
  }
  CACHED_SLIDES.set(cacheKey, slides);

  return res.status(200).json(slides);
}
