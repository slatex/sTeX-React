import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { Box, IconButton } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import {
  ViewEvent,
  generateApfelToken,
  getAncestors,
  getUserInfo,
  getUserInformation,
  isLoggedIn,
  lastFileNode,
  reportEvent,
} from '@stex-react/api';
import { PROBLEM_PARSED_MARKER, getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import {
  IS_MMT_VIEWER,
  XhtmlContentUrl,
  getCustomTag,
  localStore,
  urlWithContextParams,
} from '@stex-react/utils';
import CodeMirror from '@uiw/react-codemirror';
import { getOuterHTML } from 'domutils';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';
import { ElementType } from 'htmlparser2';
import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { ContentFromUrl } from './ContentFromUrl';
import { DisplayContext, DisplayReason } from './ContentWithHightlight';
import { ErrorBoundary } from './ErrorBoundary';
import { ExpandableContent, ExpandableStaticContent } from './ExpandableContent';
import { DocSectionContext } from './InfoSidebar';
import { InlineProblemDisplay } from './InlineProblemDisplay';
import MathJaxHack from './MathJaxHack';
import { MathMLDisplay } from './MathMLDisplay';
import { OverlayDialog, isHoverON } from './OverlayDialog';
import SectionReview from './SectionReview';
import TrafficLightIndicator from './TrafficLightIndicator';
import { langSelector } from './helper/langSelector';
import { ServerLinksContext } from './stex-react-renderer';
import { useOnScreen } from './useOnScreen';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const APFEL_TOKEN = 'apfel-token';
export const CustomItemsContext = createContext<{
  items: { [tag: string]: JSX.Element };
}>({ items: {} });

interface PositionData {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  conceptName: string;
  conceptRenderedName: string;
  uri: string;
}

export const PositionContext = createContext<{
  addPosition: (position: PositionData) => void;
  isRecording: boolean;
  setIsRecording: (state: boolean) => void;
}>(null as any);

const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    (deviceId = uuidv4().substring(0, 8)), localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};
const getRecordingId = () => {
  let recordingId = sessionStorage.getItem('recordingId');
  if (!recordingId) {
    recordingId = new Date().toISOString();
    sessionStorage.setItem('recordingId', recordingId);
  }
  return recordingId;
};
export const PositionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const addPosition = (position: PositionData) => {
    setPositions((prev) => {
      const isDuplicate = prev.some(
        (p) =>
          p.top === position.top &&
          p.left === position.left &&
          p.width === position.width &&
          p.height === position.height &&
          p.conceptName === position.conceptName &&
          p.uri === position.uri
      );

      if (!isDuplicate) {
        return [...prev, position];
      }
      return prev;
    });
  };

  useEffect(() => {
    if (positions.length === 0 || !isRecording) return;

    const timer = setTimeout(() => {
      const browserCurrentTime = new Date().toISOString();
      const pageUrl = window.location.href;
      const deviceId = getDeviceId();
      const recordingId = getRecordingId();
      const payload = {
        deviceId,
        recordingId,
        browserCurrentTime,
        pageUrl,
        positions,
      };

      axios
        .post('/api/get-uri-positions', payload)
        .then(() => console.log('Data sent successfully'))
        .catch((error) => console.error('Error sending data', error));

      setPositions([]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [positions, isRecording]);

  return (
    <PositionContext.Provider value={{ addPosition, isRecording, setIsRecording }}>
      {children}
    </PositionContext.Provider>
  );
};

export const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    margin: '0',
    padding: '0',
    backgroundColor: 'white',
  },
});

function ConceptTrackingContainer({ children }: { children: any }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { addPosition } = useContext(PositionContext);

  useEffect(() => {
    const sendPositionData = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const overlayLink =
        ref.current
          .querySelector('.symcomp.group-highlight.rustex-contents')
          ?.getAttribute('data-overlay-link-click') || '';
      const cleanedOverlayUri = overlayLink.split('/:sTeX/declaration?')[1] || '';

      const definitionUri =
        ref.current
          .querySelector('.definiendum.group-highlight.hasoverlay-parent.rustex-contents')
          ?.getAttribute('data-definiendum-uri') || '';
      const uri = cleanedOverlayUri || definitionUri || '';
      const conceptName = uri.substring(uri.lastIndexOf('?') + 1).split('&')[0] || '';
      const conceptRenderedName = ref.current.textContent || '';
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const positionData = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        conceptName,
        conceptRenderedName,
        uri,
      };

      addPosition(positionData);
    };

    sendPositionData();
    const intervalId = setInterval(sendPositionData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div ref={ref} style={{ display: 'inline' }}>
      {children}
    </div>
  );
}
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
  if (node?.type === 'text' && (node as any)?.data?.trim().length === 0) return false;
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
    return `/guided-tour2/${encodeURIComponent(uri)}`;
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
  if (isMMTLink(d.attribs['href'])) d.attribs['href'] = mmtUrl + d.attribs['href'];
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
function Highlightable({ highlightId, domNode }: { highlightId: string; domNode: any }) {
  const isMath = isInMath(domNode);
  const { highlightedParentId, setHighlightedParentId } = useContext(HighlightContext);
  const backgroundColor = highlightedParentId === highlightId ? 'yellow' : 'unset';

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
        new Element('annotation-xml', { encoding: 'application/xhtml+xml' }, mtext.childNodes),
      ]);
      if (mtext.parent) mtext.parent.children[indexInParent] = semantics;
    }
  } else {
    for (const [idx, child] of domNode.children.entries()) {
      fixMtextNodes(child as any, idx);
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

function SectionTitleDisplay({ d }: { d: Element }) {
  const [showLight, setShowLight] = useState<boolean>(false);
  useEffect(() => {
    if (!isLoggedIn()) return;
    getUserInformation().then((res) => {
      setShowLight(res?.showTrafficLight ?? false);
    });
  }, []);
  const { docFragManager } = useContext(DocSectionContext);
  const id = (d.parent as Element)?.attribs?.['id'];
  const ancestors = getAncestors(undefined, undefined, id, docFragManager?.docSections);
  const actualSectionTitle = <>{domToReact([d])}</>;
  if (!ancestors) return <>{actualSectionTitle}</>;
  const fileParent = lastFileNode(ancestors);
  if (!fileParent?.archive || !fileParent?.filepath) return actualSectionTitle;
  const { archive, filepath } = fileParent;
  return (
    <>
      {actualSectionTitle}
      {showLight ? <TrafficLightIndicator contentUrl={XhtmlContentUrl(archive, filepath)} /> : null}
    </>
  );
}

function SectionDisplay({ d }: { d: Element }) {
  const [showSectionReview, setShowSectionReview] = useState<boolean>(false);
  useEffect(() => {
    if (!isLoggedIn()) return;
    getUserInformation().then((res) => {
      setShowSectionReview(res?.showSectionReview ?? false);
    });
  }, []);
  const { docFragManager } = useContext(DocSectionContext);

  const id = d.attribs['id'];
  const ancestors = getAncestors(undefined, undefined, id, docFragManager?.docSections);
  const actualSection = <>{domToReact([d], { replace })}</>;
  if (!ancestors) return <>{actualSection}</>;
  const sectionNode = ancestors[ancestors?.length - 1];
  const fileParent = lastFileNode(ancestors);
  if (!fileParent?.archive || !fileParent?.filepath) return actualSection;
  const { archive, filepath } = fileParent;

  return (
    <>
      {actualSection}
      {showSectionReview ? (
        <SectionReview
          contentUrl={XhtmlContentUrl(archive, filepath)}
          sectionTitle={sectionNode.title ?? ''}
        />
      ) : null}
    </>
  );
}

function SlideShowComponent({ domNode }: { domNode: Element }) {
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  return (
    <Box border="1px solid #CCC" borderRadius="3px">
      <Slide
        transitionDuration={0}
        indicators={true}
        duration={3000}
        onChange={(from, to) => {
          if (to !== (from + 1) % domNode.childNodes.length) {
            setIsManualUpdate(true);
          }
        }}
        autoplay={!isManualUpdate}
      >
        {domNode.childNodes.map((childNode, idx) => (
          <Box key={idx}>{domToReact([childNode as any], { replace })}</Box>
        ))}
      </Slide>
    </Box>
  );
}

function CustomReplacement({ tag }: { tag: string }) {
  const { items } = useContext(CustomItemsContext);
  if (!items[tag]) return <>Tag [{tag}] not found</>;
  return items[tag];
}

function hoverUrlToUri(url: string) {
  const regex = /\/fragment\?(.*?)(?:&|$)/;
  const match = regex.exec(url);

  if (match && match[1]) return match[1];
  console.log(`Concept ID not found in the URL: [${url}]`);
  return url;
}

const HOVER_STACK: { URI: string; timestamp_ms: number }[] = [];

function addToHoverStack(url?: string) {
  if (!url?.length) return;
  const timestamp_ms = Date.now();
  const URI = hoverUrlToUri(url);
  HOVER_STACK.push({ URI, timestamp_ms });
}

function removeFromHoverStack(url?: string) {
  if (!url?.length) return;
  const timestamp_ms = Date.now();
  const URI = hoverUrlToUri(url);
  const lastElement = HOVER_STACK.length > 0 ? HOVER_STACK[HOVER_STACK.length - 1] : undefined;
  if (URI !== lastElement?.URI) {
    console.error(
      `Something went wrong. The URI to be removed is not the last one in the stack.
      Stack: ${JSON.stringify(HOVER_STACK)}
      Relevant: [${lastElement?.URI}]
      URI to be removed: [${URI}]`
    );
    HOVER_STACK.splice(0, HOVER_STACK.length);
    return;
  }
  const hoverDuration_ms = timestamp_ms - HOVER_STACK[HOVER_STACK.length - 1].timestamp_ms;

  HOVER_STACK.splice(HOVER_STACK.length - 1, 1);
  if (hoverDuration_ms > 500)
    reportEvent({
      type: 'view',
      concept: URI,
      payload: `Hovered for ${hoverDuration_ms}ms`,
    } as ViewEvent);
}

export function Definiendum({ node }: { node: Element }) {
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  const [reported, setReported] = useState(false);
  const { displayReason } = useContext(DisplayContext);
  const latestReason = displayReason?.length > 0 ? displayReason.at(-1) : undefined;
  const URI = node.attribs['data-definiendum-uri'];

  useEffect(() => {
    if (!isVisible || reported || !latestReason) return;
    if (latestReason === DisplayReason.HOVER || latestReason === DisplayReason.ON_CLICK_DIALOG) {
      // These have their own separate events.
      return;
    }
    reportEvent({
      type: 'view',
      concept: URI,
      payload: `Definiendum was read: [${latestReason}]`,
    } as ViewEvent);
    setReported(true);
  }, [reported, isVisible, latestReason, URI]);
  return (
    <Box ref={ref} display="inline">
      {domToReact([node], { replace })}
    </Box>
  );
}

const ApfelHrefWithToken = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const [updatedHref, setUpdatedHref] = useState(href);
  useEffect(() => {
    const updateHrefWithToken = async () => {
      const userInfo = await getUserInfo();
      if (!userInfo) return;
      let token = localStore?.getItem(APFEL_TOKEN);

      if (!token) {
        const tokenResponse = await generateApfelToken(userInfo.userId, Date.now());
        token = tokenResponse.token;
        localStore?.setItem(APFEL_TOKEN, token as string);
      }

      if (token) {
        const url = new URL(href);
        url.searchParams.set(APFEL_TOKEN, token);
        setUpdatedHref(url.toString());
      }
    };
    updateHrefWithToken();
  }, [href]);

  return <a href={updatedHref}>{children}</a>;
};

export const replace = (d: DOMNode): any => {
  const domNode = getElement(d);
  const conceptTracking = localStorage.getItem('concept-tracking') === 'true';

  if (!domNode) return;

  if (domNode.name === 'a') {
    const href = domNode.attribs['href'];
    if (href?.startsWith('https://fau.tv/clip/id/')) {
      return <FauClipWithLink href={href} />;
    }
  }

  if (isMMTSrc(domNode) && !IS_MMT_VIEWER) return <MMTImage d={domNode} />;

  const nodeId = domNode.attribs?.['id'];
  const customTag = getCustomTag(nodeId);
  if (customTag) return <CustomReplacement tag={customTag} />;

  const sectionProcessed = domNode.attribs?.['section-processed'];
  // TODO: 'data-with-bindings' check is hacky and brittle
  if (nodeId && domNode.attribs?.['data-with-bindings'] && !sectionProcessed) {
    domNode.attribs['section-processed'] = 'true';
    return <SectionDisplay d={domNode} />;
  }

  if (domNode.attribs['class']?.includes('shtml-sectitle')) {
    return <SectionTitleDisplay d={domNode} />;
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

  if (!isVisible(domNode)) return <></>;

  if (domNode.name === 'code') {
    const codeContent = domNode.children
      .map((child) => (child.type === 'text' ? child.data : ' '))
      .join('');
    return (
      <CodeMirror
        value={codeContent.trim()}
        theme="dark"
        extensions={[langSelector(domNode.attribs['language'])]}
      />
    );
  }

  if (domNode.name === 'a') {
    const href = domNode.attribs['href'];
    if (
      href?.startsWith('https://apple.alea.education/') ||
      href?.startsWith('https://apfel.alea.education/')
    ) {
      return (
        <ApfelHrefWithToken href={href}>
          {domToReact(domNode.children as any[], { replace })}
        </ApfelHrefWithToken>
      );
    }
  }

  if (domNode.name === 'head' || domNode.name === 'iframe' || domNode.name === 'script') {
    return <></>;
  }

  if (domNode.attribs?.['data-slideshow']) {
    return <SlideShowComponent domNode={domNode} />;
  }

  const isProblem = domNode.attribs?.['data-problem'] === 'true';
  const problemProcessed = domNode.attribs?.[PROBLEM_PARSED_MARKER];
  if (isProblem && !problemProcessed) {
    const problem = getProblem(hackAwayProblemId(getOuterHTML(domNode)), '');
    return <InlineProblemDisplay problem={problem} />;
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
          domNode.attribs['style'] = removeStyleTag(customStyle, 'width') + newWidth;
        }
      }
    }
  }

  const definiendumProcessed = domNode.attribs?.['definiendum-processed'];
  const definiendaUri = domNode.attribs?.['data-definiendum-uri'];
  if (definiendaUri && !definiendumProcessed) {
    domNode.attribs['definiendum-processed'] = 'true';
    return (
      <>
        {conceptTracking ? (
          <ConceptTrackingContainer>
            <Definiendum node={domNode} />
          </ConceptTrackingContainer>
        ) : (
          <Definiendum node={domNode} />
        )}
      </>
    );
  }
  const hoverLink = isHoverON() ? domNode.attribs['data-overlay-link-hover'] : undefined;
  const clickLink = domNode.attribs['data-overlay-link-click'];
  const hoverParent = domNode.attribs['data-highlight-parent'];
  if ((hoverLink || clickLink) && !domNode.attribs['processed']) {
    domNode.attribs['processed'] = 'first';
    const isMath = isInMath(domNode);
    // eslint-disable-next-line react/display-name
    const WithHighlightable = forwardRef((props, ref) => {
      return isMath ? (
        /* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */
        <mrow {...props} style={{ display: 'inline', cursor: 'pointer' }} ref={ref as any}>
          <Highlightable domNode={domNode} highlightId={hoverParent} />
          {/* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */}
        </mrow>
      ) : (
        <div {...props} style={{ display: 'inline', cursor: 'pointer' }} ref={ref as any}>
          <Highlightable domNode={domNode} highlightId={hoverParent} />
        </div>
      );
    });

    return (
      <OverlayDialog
        contentUrl={clickLink}
        isMath={isMath}
        displayNode={(topLevelDocUrl: string, locale) => (
          <NoMaxWidthTooltip
            onOpen={() => addToHoverStack(hoverLink)}
            onClose={() => removeFromHoverStack(hoverLink)}
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
                    displayReason={DisplayReason.HOVER}
                    topLevelDocUrl={topLevelDocUrl}
                    url={urlWithContextParams(hoverLink, locale, topLevelDocUrl)}
                    modifyRendered={getChildrenOfBodyNode}
                  />
                </Box>
              ) : (
                <></>
              )
            }
          >
            {conceptTracking ? (
              <ConceptTrackingContainer>
                {hoverParent ? <WithHighlightable /> : (domToReact([domNode], { replace }) as any)}
              </ConceptTrackingContainer>
            ) : hoverParent ? (
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
  if (isMMTHref(domNode) && !IS_MMT_VIEWER) return <MMTHrefReplaced d={domNode} />;

  if (domNode.attribs?.['class'] === 'inputref') {
    const inputRef = domNode.attribs['data-inputref-url'];
    return (
      <>
        <ExpandableContent htmlTitle={domNode} contentUrl={inputRef} />
        &nbsp;
      </>
    );
  }
  if (domNode.name === 'math') {
    if (typeof MathMLElement === 'function' && !localStore?.getItem('forceMathJax')) {
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
      <ExpandableStaticContent
        title={domToReact(titleNodes as any[], { replace }) as any}
        defaultOpen={defaultOpen}
        staticContent={domToReact(bodyNodes as any[], { replace }) as any}
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
