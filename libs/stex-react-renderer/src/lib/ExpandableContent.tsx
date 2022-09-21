import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { Box, IconButton } from '@mui/material';
import {
  convertHtmlNodeToPlain,
  getChildrenOfBodyNode,
  getSectionInfo,
  simpleHash,
} from '@stex-react/utils';
import {
  createContext,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { reportIndexInfo, SEPARATOR_inDocPath } from './collectIndexInfo';
import { ContentFromUrl } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { RenderOptions } from './RendererDisplayOptions';
import { useOnScreen } from './useOnScreen';

const ExpandContext = createContext([] as string[]);
function getInDocumentLink(childContext: string[]) {
  if (typeof window === 'undefined') return '';
  return (
    window.location.origin +
    window.location.pathname +
    '?inDocPath=' +
    childContext.join(SEPARATOR_inDocPath)
  );
}

function createHash({ archive = '', filepath = '' }) {
  return simpleHash(`${archive}||${filepath}`);
}

export function ExpandableContent({
  contentUrl,
  staticContent,
  defaultOpen = false,
  title,
  htmlTitle,
}: {
  contentUrl?: string;
  staticContent?: any;
  defaultOpen?: boolean;
  title: any;
  htmlTitle: any;
}) {
  const urlHash = createHash(getSectionInfo(contentUrl || ''));
  const [openAtLeastOnce, setOpenAtLeastOnce] = useState(defaultOpen);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const parentContext = useContext(ExpandContext);
  const childContext = [...parentContext, urlHash];

  const titleText = convertHtmlNodeToPlain(htmlTitle);
  const autoExpand = !titleText || titleText.startsWith('http');
  const {
    renderOptions: { expandOnScroll, allowFolding },
  } = useContext(RenderOptions);

  // Reference to the top-most box.
  const contentRef = useRef<HTMLElement>();
  const isVisible = useOnScreen(contentRef);
  useEffect(() => {
    if (expandOnScroll && isVisible && !openAtLeastOnce) {
      setIsOpen(true);
      setOpenAtLeastOnce(true);
    }
  }, [expandOnScroll, openAtLeastOnce, isVisible]);

  useEffect(() => {
    reportIndexInfo(childContext, titleText, contentRef?.current);
  }, [childContext, titleText, contentRef?.current]); // Keep contentRef?.current here to make sure that the ref is reported when loaded.

  const changeState = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenAtLeastOnce(true);
    setIsOpen((v) => !v);
  };

  if (autoExpand) {
    return (
      <ErrorBoundary hidden={false}>
        {contentUrl ? (
          <Box ref={contentRef}>
            <ContentFromUrl
              url={contentUrl}
              modifyRendered={getChildrenOfBodyNode}
              minLoadingHeight={expandOnScroll ? '1000px' : undefined}
            />
          </Box>
        ) : (
          { staticContent }
        )}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary hidden={false}>
      <Box
        m="4px 0"
        ref={contentRef}
        minHeight={!openAtLeastOnce && expandOnScroll ? '1000px' : undefined}
      >
        {!allowFolding ? (
          contentUrl && (
            <Box position="absolute" right="10px">
              <ExpandableContextMenu
                sectionLink={getInDocumentLink(childContext)}
                contentUrl={contentUrl}
              />
            </Box>
          )
        ) : (
          <Box display="flex" justifyContent="space-between">
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: 'pointer' }}
              onClick={changeState}
            >
              <IconButton sx={{ color: 'gray', p: '0' }} onClick={changeState}>
                {isOpen ? (
                  <IndeterminateCheckBoxOutlinedIcon
                    sx={{ fontSize: '20px' }}
                  />
                ) : (
                  <AddBoxOutlinedIcon sx={{ fontSize: '20px' }} />
                )}
              </IconButton>
              <Box
                sx={{
                  '& > *:hover': { background: '#DDD' },
                  width: 'fit-content',
                  px: '4px',
                  ml: '-2px',
                  borderRadius: '5px',
                }}
              >
                {contentUrl ? (
                  <b style={{ fontSize: 'large' }}>{title}</b>
                ) : (
                  title
                )}
              </Box>
            </Box>
            {contentUrl && (
              <ExpandableContextMenu
                sectionLink={getInDocumentLink(childContext)}
                contentUrl={contentUrl}
              />
            )}
          </Box>
        )}

        {openAtLeastOnce ? (
          <Box display={isOpen ? 'flex' : 'none'}>
            <Box
              minWidth="20px"
              display={allowFolding ? undefined : 'none'}
              sx={{
                cursor: 'pointer',
                '&:hover *': { borderLeft: '1px solid #333' },
              }}
              onClick={changeState}
            >
              <Box width="0" m="auto" borderLeft="1px solid #CCC" height="100%">
                &nbsp;
              </Box>
            </Box>
            <Box overflow="auto">
              {contentUrl ? (
                <ExpandContext.Provider value={childContext}>
                  <ContentFromUrl
                    url={contentUrl}
                    modifyRendered={getChildrenOfBodyNode}
                    minLoadingHeight={expandOnScroll ? '800px' : undefined}
                  />
                </ExpandContext.Provider>
              ) : (
                staticContent
              )}
            </Box>
          </Box>
        ) : (
          expandOnScroll && <>Loading...</>
        )}
      </Box>
    </ErrorBoundary>
  );
}
