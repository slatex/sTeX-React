import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { Box, IconButton } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import {
  IS_MMT_VIEWER,
  contextParamsFromTopLevelDocUrl,
  getCustomTag,
  localStore,
} from '@stex-react/utils';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';
import { ElementType } from 'htmlparser2';
import { createContext, forwardRef, useContext, useState } from 'react';
import { ContentFromUrl } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { ExpandableContent } from './ExpandableContent';
import MathJaxHack from './MathJaxHack';
import { MathMLDisplay } from './MathMLDisplay';
import { OverlayDialog, isHoverON } from './OverlayDialog';
import { ServerLinksContext } from './stex-react-renderer';

export const CustomItemsContext = createContext<{
  items: { [tag: string]: JSX.Element };
}>({ items: {} });

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
    if (style && style[tag]) {
      delete style[tag];
    }
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

function isVisible(node: any) {
  if (node?.type === 'text' && (node as any)?.data?.trim().length === 0)
    return false;
  const visibilityAttrib = node?.attribs?.['stex:visible'];
  return node && visibilityAttrib !== 'false';
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

function isMMTLink(l: string) {
  if (!l?.length) return false;
  return l.startsWith('/:sTeX') || l.toLowerCase().startsWith('/stex');
}

function isMMTSrc(d: Element) {
  return d.name === 'img' && isMMTLink(d.attribs['src']);
}

function isMMTHref(d: Element) {
  return isMMTLink(d.attribs['href']);
}

function MMTHrefReplaced({ d }: { d: Element }) {
  const { mmtUrl } = useContext(ServerLinksContext);
  if (isMMTLink(d.attribs['href']))
    d.attribs['href'] = mmtUrl + d.attribs['href'];
  return <>{domToReact([d], { replace })}</>;
}

function isInMath(domNode?: any): boolean {
  if (!domNode) return false;
  const xlmns = domNode.attribs?.['xmlns'];
  if (xlmns === 'http://www.w3.org/1999/xhtml') return false;
  if (xlmns === 'http://www.w3.org/1998/Math/MathML') return true;
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

function MMTImage({ d }: { d: Element }) {
  const { mmtUrl } = useContext(ServerLinksContext);
  if (isMMTSrc(d)) d.attribs['src'] = mmtUrl + d.attribs['src'];
  return <>{domToReact([d], { replace })}</>;
}

function CustomReplacement({ tag }: { tag: string }) {
  const { items } = useContext(CustomItemsContext);
  if (!items[tag]) return <>Tag [{tag}] not found</>;
  return items[tag];
}

const replace = (d: DOMNode): any => {
  const domNode = getElement(d);

  if (!domNode) return;

  if (domNode.name === 'a') {
    const href = domNode.attribs['href'];
    if (href?.startsWith('https://fau.tv/clip/id/')) {
      return <FauClipWithLink href={href} />;
    }
  }

  if (isMMTSrc(domNode) && !IS_MMT_VIEWER) return <MMTImage d={domNode} />;

  const customTag = getCustomTag(domNode.attribs?.['id']);
  if (customTag) return <CustomReplacement tag={customTag} />;

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
  const hoverLink = isHoverON()
    ? domNode.attribs['data-overlay-link-hover']
    : false;
  const clickLink = domNode.attribs['data-overlay-link-click'];
  const hoverParent = domNode.attribs['data-highlight-parent'];
  if ((hoverLink || clickLink) && !domNode.attribs['processed']) {
    domNode.attribs['processed'] = 'first';
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
        contentUrl={clickLink}
        isMath={isMath}
        displayNode={(topLevelDocUrl: string) => (
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
                    topLevelDocUrl={topLevelDocUrl}
                    url={
                      hoverLink +
                      contextParamsFromTopLevelDocUrl(topLevelDocUrl)
                    }
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
        )}
      />
    );
  }

  if (hoverParent && !domNode.attribs['processed']) {
    domNode.attribs['processed'] = 'second';
    return <Highlightable domNode={domNode} highlightId={hoverParent} />;
  }

  const guidedTourPath = getGuidedTourPath(domNode.attribs?.['href']);
  if (guidedTourPath) {
    domNode.attribs['href'] = guidedTourPath;
    return;
  }
  if (isMMTHref(domNode) && !IS_MMT_VIEWER)
    return <MMTHrefReplaced d={domNode} />;

  if (domNode.attribs?.['class'] === 'inputref') {
    const inputRef = domNode.attribs['data-inputref-url'];
    return (
      <>
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

export function mmtHTMLToReact(html: string) {
  return parse(html, {
    replace: (d: any) => replace(d),
  });
}
