import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import TourIcon from '@mui/icons-material/Tour';
import { Box, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import {
  BG_COLOR,
  getSectionInfo,
  IS_MMT_VIEWER,
  localStore,
} from '@stex-react/utils';
import parse, { DOMNode, domToReact, Element } from 'html-react-parser';
import { ElementType } from 'htmlparser2';
import Link from 'next/link';
import { createContext, forwardRef, useContext, useState } from 'react';
import { ContentFromUrl } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { ExpandableContent } from './ExpandableContent';
import MathJaxHack from './MathJaxHack';
import { MathMLDisplay } from './MathMLDisplay';
import { OverlayDialog } from './OverlayDialog';
import { SidebarButton } from './SidebarButton';

let SECTION_IDS: {
  [nodeId: string]: string;
} = {};

export function setSectionIds(v: { [nodeId: string]: string }) {
  SECTION_IDS = v;
}

function SectionIdHackObject({ inputRef }: { inputRef: string }) {
  const { archive, filepath } = getSectionInfo(inputRef);
  const nodeId = `${archive}||${filepath}`;
  const secId = SECTION_IDS[nodeId];
  if (!secId) return null;
  const isChapter = !secId?.includes('.');
  return (
    <span
      style={{
        fontSize: isChapter ? '36px' : '24px',
        background: BG_COLOR,
        fontWeight: 'bold',
        zIndex: '1',
        marginTop: isChapter ? '200px' : undefined,
        position: isChapter ? undefined : 'relative',
        bottom: isChapter ? undefined : '-72px',
        width: isChapter ? undefined : '52px',
      }}
    >
      {(isChapter ? 'Chapter ' : '') + secId}
    </span>
  );
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    margin: '0',
    padding: '0',
    backgroundColor: 'white',
  },
});

function getElement(domNode: DOMNode): Element | undefined {
  // (domNode instanceof Element) doesn't work.
  // Perhaps, there is some versioning issue. But we still use the type 'Element'
  // because it helps with code completion which seems to work fine so far.
  const type = domNode.type;
  if ([ElementType.Tag, ElementType.Script, ElementType.Style].includes(type)) {
    return domNode as Element;
  }
  return undefined;
}

function removeStyleTag(style: any, tag: string) {
  if (typeof style === 'object') {
    if (style[tag]) delete style[tag];
    return style;
  }
  if (!style || !style.indexOf || !tag) return style;

  const start = style.indexOf(tag);
  if (start === -1) return style;
  const end = style.indexOf(';', start + 1);
  if (end === -1) return style;
  return style.substring(0, start) + style.substring(end + 1);
}

function getStyleTag(style: string, tag: string) {
  if (typeof style === 'object') {
    if (style[tag]) delete style[tag];
    return '';
  }
  if (!style || !style.indexOf || !tag) return '';

  const start = style.indexOf(tag);
  if (start === -1) return style;
  const end = style.indexOf(';', start + 1);
  if (end === -1) return style;
  return style.substring(start + tag.length + 1, end).trim();
}

// HACK: Return only the appropriate XHTML from MMT.
function getChildrenOfBodyNode(htmlNode: JSX.Element) {
  const body = htmlNode?.props?.children?.[1];
  return body?.props?.children;
}

function isSidebar(node: Element) {
  return node?.attribs?.['class'] === 'sidebar';
}

function isVisible(node: any) {
  if (node?.type === 'text' && (node as any)?.data?.trim().length === 0)
    return false;
  const visibilityAttrib = node?.attribs?.['stex:visible'];
  return node && visibilityAttrib !== 'false';
}

function isLeafNode(node: Element) {
  if (!node) return false;
  if (!node.children?.length) return true;
  return node.name === 'paragraph' || isSidebar(node);
}

function getFirstDisplayNode(node: any): any {
  if (!node || !isVisible(node)) {
    return null;
  }
  if (isLeafNode(node)) return node;
  for (const child of node.children) {
    const first = getFirstDisplayNode(child as any);
    if (first) return first;
  }
  return null;
}

function getNextNode(domNode: Element) {
  let nextAncestor = null;
  let current: any = domNode;
  while (!nextAncestor && current) {
    nextAncestor = current.nextSibling;
    while (nextAncestor && !isVisible(nextAncestor)) {
      nextAncestor = nextAncestor.nextSibling;
    }
    current = current.parent;
  }
  if (!nextAncestor) return null;
  return getFirstDisplayNode(nextAncestor);
}

function collectNeighbours(domNode: Element) {
  const neighbours = [];
  let next = getNextNode(domNode);
  while (isSidebar(next)) {
    next.attribs['isattached'] = true;
    neighbours.push(next);
    next = getNextNode(next);
  }
  return neighbours;
}

function updateBackgroundColorAndCursorPointer(style: string, bgColor: string) {
  if (typeof style !== 'string') return style;
  if (style) {
    style = removeStyleTag(removeStyleTag(style, 'background-color'), 'cursor');
  }
  return (style || '') + ` background-color: ${bgColor}; cursor: pointer;`;
}

function getGuidedTourPath(href?: string) {
  // TODO: This is a lousy hack to check if guided tour and if not in MMT viewer.
  if (!IS_MMT_VIEWER && href?.startsWith('/:vollki?path=')) {
    const uri = href.substring('/:vollki?path='.length);
    return `/guided-tour/${encodeURIComponent(uri)}`;
  }
  return undefined;
}

function isInMath(domNode?: any): boolean {
  if (!domNode) return false;
  if (domNode.name === 'math') return true;
  return isInMath(domNode.parent);
}

export const HighlightContext = createContext({
  highlightedParentId: '',
  setHighlightedParentId: (_id: string) => {
    /**/
  },
});
function Highlightable({
  highlightId,
  domNode,
}: {
  highlightId: string;
  domNode: any;
}) {
  const isMath = isInMath(domNode);
  const { highlightedParentId, setHighlightedParentId } =
    useContext(HighlightContext);
  const backgroundColor =
    highlightedParentId === highlightId ? 'yellow' : 'unset';

  /*// Fix setStyleProp in node_modules\html-react-parser\lib\utilities.js
    function setStyleProp(style, props) {
      if (style === null || style === undefined || (typeof style !== 'string')) {
        return style;
      }
      try {
        props.style = styleToJS(style, styleToJSOptions);
      } catch (err) {
        props.style = {};
      }
    }
  */

  if (domNode.attribs) {
    // Needed because the highlight in the span is misaligned in case of math nodes.
    domNode.attribs.style = updateBackgroundColorAndCursorPointer(
      domNode.attribs.style,
      backgroundColor
    );
  }
  return isMath ? (
    /* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */
    <mrow
      onMouseOver={() => setHighlightedParentId(highlightId)}
      onMouseOut={() => setHighlightedParentId('')}
      style={{ backgroundColor, cursor: 'pointer' }}
    >
      {domToReact([domNode], { replace })}
      {/* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */}
    </mrow>
  ) : (
    <span
      onMouseOver={() => setHighlightedParentId(highlightId)}
      onMouseOut={() => setHighlightedParentId('')}
      style={{ backgroundColor, cursor: 'pointer' }}
    >
      {domToReact([domNode], { replace })}
    </span>
  );
}

function fixMtextNodes(d: DOMNode, indexInParent = 0) {
  const domNode = getElement(d);
  if (!domNode) return;
  if (domNode.name === 'mtext') {
    const mtext = domNode;
    const child = mtext.children?.[0] as Element;
    if (child?.attribs?.['xmlns'] === 'http://www.w3.org/1999/xhtml') {
      const semantics = new Element('semantics', {}, [
        new Element(
          'annotation-xml',
          { encoding: 'application/xhtml+xml' },
          mtext.childNodes
        ),
      ]);
      if (mtext.parent) mtext.parent.children[indexInParent] = semantics;
    }
  } else {
    for (const [idx, child] of domNode.children.entries()) {
      fixMtextNodes(child, idx);
    }
  }
}

function IframedFauClip({ clipId }: { clipId: string }) {
  const [expand, setExpand] = useState(false);

  if (!expand) {
    return (
      <IconButton onClick={() => setExpand(true)}>
        <PlayCircleFilledWhiteIcon />
      </IconButton>
    );
  }
  return (
    <Box width="95%" m="auto">
      <Box position="relative" pb="56.25%" my="5px">
        <iframe
          src={`https://www.fau.tv/clip/multistream/${clipId}`}
          frameBorder="0"
          allowFullScreen={true}
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }}
          title={`Clip ${clipId}`}
        ></iframe>
      </Box>
    </Box>
  );
}
function FauClipWithLink({ href }: { href: string }) {
  const clipId = href.substring('https://fau.tv/clip/id/'.length);
  return (
    <>
      <a href={href} target="_blank" rel="noreferrer" className="monospaced">
        {href}
      </a>
      <IframedFauClip clipId={clipId} />
    </>
  );
}

const replace = (d: DOMNode, skipSidebar = false): any => {
  const domNode = getElement(d);

  if (!domNode) return;

  if (domNode.name === 'a') {
    const href = domNode.attribs['href'];
    if (href?.startsWith('https://fau.tv/clip/id/')) {
      return <FauClipWithLink href={href} />;
    }
  }

  // Remove section numbers;
  if (
    !IS_MMT_VIEWER &&
    domNode.childNodes.length === 3 &&
    domNode.attribs['class'] === 'hbox' &&
    (domNode.childNodes[1] as any).childNodes?.[0]?.type === 'text' &&
    (domNode.childNodes[1] as any).childNodes?.[0]?.data === '1'
  ) {
    return <span>{'\xa0\xa0\xa0\u2015\xa0\xa0\xa0'}</span>;
  }

  // Remove slide numbers.
  if (
    !IS_MMT_VIEWER &&
    domNode.childNodes.length === 8 &&
    (domNode.childNodes[4] as any).attribs?.['class'] === 'HFill' &&
    (domNode.childNodes[6] as any).attribs?.['class'] === 'HFill' &&
    domNode.childNodes[5].type === 'text'
  ) {
    domNode.childNodes[5].data = '';
  }

  if (isSidebar(domNode)) {
    if (skipSidebar) return <></>;

    if (domNode.attribs?.['isattached']) {
      return <></>;
    }
    const renderedSideNodes = [domNode, ...collectNeighbours(domNode)].map(
      (node) => domToReact(node.children, { replace })
    );
    return (
      <Box height="0px">
        <div className="sidebarbuttonwrapper">
          <SidebarButton sidebarContents={renderedSideNodes} />
        </div>
      </Box>
    );
  }

  if (!isVisible(domNode)) return <></>;

  if (
    domNode.name === 'head' ||
    domNode.name === 'iframe' ||
    domNode.name === 'script'
  ) {
    return <></>;
  }
  if (!IS_MMT_VIEWER && !localStore?.getItem('no-responsive')) {
    // HACK: MMT will fix the 'CALC' issue soon
    const customStyle = domNode.attribs?.['style'];
    if (domNode.attribs?.['class'] === 'paragraph' && customStyle) {
      const rightM = getStyleTag(customStyle, 'margin-right');
      const leftM = getStyleTag(customStyle, 'margin-left');
      if (leftM?.endsWith('px') && leftM === rightM) {
        const width = getStyleTag(customStyle, 'width');
        if (width?.endsWith('%')) {
          const newWidth = `;width: calc(100% - ${2 * +leftM.slice(0, -2)}px)`;
          domNode.attribs['style'] =
            removeStyleTag(customStyle, 'width') + newWidth;
        }
      }
    }
  }
  const hoverLink = domNode.attribs['data-overlay-link-hover'];
  const clickLink = domNode.attribs['data-overlay-link-click'];
  const hoverParent = domNode.attribs['data-highlight-parent'];
  if ((hoverLink || clickLink) && !domNode.attribs['processed']) {
    domNode.attribs['processed'] = 'first';
    const dialogPath = clickLink;
    const isMath = isInMath(domNode);
    // eslint-disable-next-line react/display-name
    const WithHighlightable = forwardRef((props, ref) => {
      return isMath ? (
        /* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */
        <mrow
          {...props}
          style={{ display: 'inline', cursor: 'pointer' }}
          ref={ref as any}
        >
          <Highlightable domNode={domNode} highlightId={hoverParent} />
          {/* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */}
        </mrow>
      ) : (
        <div
          {...props}
          style={{ display: 'inline', cursor: 'pointer' }}
          ref={ref as any}
        >
          <Highlightable domNode={domNode} highlightId={hoverParent} />
        </div>
      );
    });
    return (
      <OverlayDialog
        contentUrl={dialogPath}
        isMath={isMath}
        displayNode={
          <NoMaxWidthTooltip
            title={
              hoverLink ? (
                <Box
                  maxWidth="600px"
                  color="black"
                  border="1px solid #CCC"
                  p="5px"
                  borderRadius="5px"
                  boxShadow="2px 7px 31px 8px rgba(0,0,0,0.33)"
                >
                  <ContentFromUrl
                    url={hoverLink}
                    modifyRendered={getChildrenOfBodyNode}
                  />
                </Box>
              ) : (
                <></>
              )
            }
          >
            {hoverParent ? (
              <WithHighlightable />
            ) : (
              (domToReact([domNode], { replace }) as any)
            )}
          </NoMaxWidthTooltip>
        }
      />
    );
  }

  if (hoverParent && !domNode.attribs['processed']) {
    domNode.attribs['processed'] = 'second';
    return <Highlightable domNode={domNode} highlightId={hoverParent} />;
  }

  // HACK: get url using attribs for the sidebar buttons.
  if (domNode.attribs['onclick']) {
    const rx = /stexMainOverlayOn\('(.*)'/g;
    const matches = rx.exec(domNode.attribs['onclick']);
    const path = matches?.[1];
    return (
      path && (
        <OverlayDialog
          contentUrl={path}
          displayNode={<>{domToReact([domNode])}</>}
          isMath={isInMath(domNode)}
        />
      )
    );
  }

  const guidedTourPath = getGuidedTourPath(domNode.attribs?.['href']);
  if (guidedTourPath) {
    return (
      <Link href={guidedTourPath} passHref>
        <Button sx={{ m: '5px' }} size="small" variant="contained">
          <TourIcon>&nbsp;</TourIcon>Guided Tour
        </Button>
      </Link>
    );
  }

  if (domNode.attribs?.['class'] === 'inputref') {
    const inputRef = domNode.attribs['data-inputref-url'];
    return (
      <>
        <SectionIdHackObject inputRef={inputRef} />
        <ExpandableContent
          htmlTitle={domNode}
          contentUrl={inputRef}
          title={domToReact(domNode.children, { replace }) as any}
        />
        &nbsp;
      </>
    );
  }
  if (domNode.name === 'math') {
    if (
      typeof MathMLElement === 'function' &&
      !localStore?.getItem('forceMathJax')
    ) {
      return;
    }
    if ((domNode.parent as any)?.name === 'mjx-assistive-mml') return <></>;
    if (!domNode.attribs['processed']) {
      domNode.attribs['processed'] = 'true';
      fixMtextNodes(domNode);
      return (
        <>
          <ErrorBoundary hidden={false}>
            <MathMLDisplay mathMLDomNode={domNode} />
          </ErrorBoundary>
          <MathJaxHack>{domToReact([domNode])}</MathJaxHack>
        </>
      );
    }
  }

  const collapsibleDefaultState = domNode.attribs['data-collapsible'];
  if (collapsibleDefaultState) {
    const defaultOpen = collapsibleDefaultState === 'true';
    const titleNodes = domNode.children.filter(
      (child) => !!(child as any).attribs?.['data-collapse-title']
    );
    const bodyNodes = domNode.children.filter(
      (child) => !!(child as any).attribs?.['data-collapse-body']
    );
    return (
      <ExpandableContent
        htmlTitle={titleNodes}
        title={domToReact(titleNodes, { replace }) as any}
        defaultOpen={defaultOpen}
        staticContent={domToReact(bodyNodes, { replace }) as any}
      />
    );
  }
  return;
};

export function mmtHTMLToReact(html: string, skipSidebar = false) {
  return parse(html, {
    replace: (d: any) => replace(d, skipSidebar),
  });
}
