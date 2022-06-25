import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import { ButtonAndDialog } from './ButtonAndDialog';
import { ContentFromUrl } from './ContentFromUrl';
import HTMLReactParser, {
  DOMNode,
  domToReact,
  Element,
} from 'html-react-parser';
import { forwardRef, createContext, useContext } from 'react';
import { OverlayDialog } from './OverlayDialog';

const IS_SERVER = typeof window === 'undefined';
export const BASE_URL = (IS_SERVER ? null : (window as any).BASE_URL) ?? 'https://overleaf.beta.vollki.kwarc.info';
export const localStore = IS_SERVER ? undefined : localStorage;

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    backgroundColor: '#616161',
  },
});

function removeStyleTag(style: string, tag: string) {
  const start = style.indexOf(tag);
  if (start === -1) return style;
  const end = style.indexOf(';', start + 1);
  if (end === -1) return style;
  return style.substring(0, start) + style.substring(end + 1);
}

// HACK: Return only the appropriate XHTML from MMT.
function getChildrenOfBodyNode(htmlNode: JSX.Element) {
  const body = htmlNode?.props?.children?.[1];
  return body?.props?.children;
}

function isSidebar(node: Element) {
  return node?.attribs?.['class'] === 'sidebar';
}

function isVisible(node: Element) {
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

function getFirstDisplayNode(node: Element): any {
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

function assignShiftParam(domNode: Element, param = 0) {
  domNode.attribs['shiftparam'] = `${param}`;
  const next = getNextNode(domNode);
  if (isSidebar(next)) assignShiftParam(next, param + 1);
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
  const { highlightedParentId, setHighlightedParentId } =
    useContext(HighlightContext);
  const backgroundColor =
    highlightedParentId === highlightId ? 'yellow' : undefined;
  return (
    <span
      onMouseOver={() => setHighlightedParentId(highlightId)}
      onMouseOut={() => setHighlightedParentId('')}
      style={{ backgroundColor, cursor: 'pointer' }}
    >
      {domToReact([domNode], { replace })}
    </span>
  );
}

const replace = (domNode: DOMNode, skipSidebar = false) => {
  if (!(domNode instanceof Element)) return;

  if (domNode.attribs?.['class'] === 'sidebar') {
    if (skipSidebar) return <></>;

    if (!domNode.attribs?.['shiftparam']) {
      assignShiftParam(domNode);
    }
    const shift = Number(domNode.attribs?.['shiftparam']) * 40;
    return (
      <>
        <Box
          height="0px"
          maxWidth="300px"
          display={{ xs: 'none', md: 'block' }}
        >
          <div className="sidebarexpanded" style={{ marginTop: `${shift}px` }}>
            {domToReact(domNode.children, { replace })}
          </div>
        </Box>
        <Box height="0px" display={{ xs: 'block', md: 'none' }}>
          <div
            className="sidebarbuttonwrapper"
            style={{ marginTop: `${shift}px` }}
          >
            <ButtonAndDialog
              content={domToReact(domNode.children, { replace })}
            />
          </div>
        </Box>
      </>
    );
  }

  if (!isVisible(domNode)) return <></>;

  const previous = domNode.previousSibling as any;
  if (
    previous?.attribs?.class === 'sidebar' &&
    domNode.attribs?.['class'] !== 'sidebar'
  ) {
    //if(domNode.attribs?.['style']) domNode.attribs['style']+=";margin-top: -20px;";
    //else domNode.attribs['style'] ="margin-top: -20px;";
  }
  if (
    domNode.name === 'head' ||
    domNode.name === 'iframe' ||
    domNode.name === 'script'
  ) {
    return <></>;
  }
  if (!localStore?.getItem('no-responsive')) {
    // HACK: Make MMT return appropriate (X)HTML for responsive page.
    if (domNode.attribs?.['class'] === 'body') {
      domNode.attribs['style'] = removeStyleTag(
        removeStyleTag(domNode.attribs?.['style'], 'padding-left'),
        'padding-right'
      );
    }

    if (domNode.attribs?.['style']) {
      domNode.attribs['style'] = removeStyleTag(
        removeStyleTag(domNode.attribs?.['style'], 'min-width'),
        'width'
      );
    }
  }

  const hoverLink = domNode.attribs['data-overlay-link-hover'];
  const clickLink = domNode.attribs['data-overlay-link-click'];
  const hoverParent = domNode.attribs['data-highlight-parent'];
  if ((hoverLink || clickLink) && !domNode.attribs['processed']) {
    domNode.attribs['processed'] = 'first';
    const tooltipPath = BASE_URL + hoverLink;
    const dialogPath = BASE_URL + clickLink;
    // eslint-disable-next-line react/display-name
    const WithHighlightable = forwardRef((props, ref) => {
      return (
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
        displayNode={
          <NoMaxWidthTooltip
            title={
              <div style={{ minWidth: '300px', maxWidth: '600px' }}>
                <ContentFromUrl
                  url={tooltipPath}
                  modifyRendered={(n) => getChildrenOfBodyNode(n)}
                />
              </div>
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
    const path = BASE_URL + matches?.[1];
    return (
      <OverlayDialog
        contentUrl={path}
        displayNode={<>{domToReact([domNode])}</>}
      />
    );
  }
  return;
};

export function mmtHTMLToReact(html: string, skipSidebar = false) {
  return HTMLReactParser(html, {
    replace: (d: any) => replace(d, skipSidebar),
  });
}
