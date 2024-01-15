import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { Box, IconButton } from '@mui/material';
import {
  IS_SERVER,
  convertHtmlNodeToPlain,
  createHash,
  getChildrenOfBodyNode,
  getSectionInfo,
} from '@stex-react/utils';
import {
  MouseEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ContentFromUrl } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { ExpandableContextMenu } from './ExpandableContextMenu';
import { DocSectionContext } from './InfoSidebar';
import { SEPARATOR_inDocPath } from './collectIndexInfo';
import { useOnScreen } from './useOnScreen';
import { useRect } from './useRect';

const ExpandContext = createContext([] as string[]);
const STOP_EXPANSION_MARKER = 'STOP_EXPANSION';
function getInDocumentLink(childContext: string[]) {
  if (typeof window === 'undefined') return '';
  return (
    window.location.origin +
    window.location.pathname +
    '?inDocPath=' +
    childContext.join(SEPARATOR_inDocPath)
  );
}

export function ExpandableStaticContent({
  staticContent,
  title,
  defaultOpen = false,
}: {
  staticContent: any;
  title: any;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const changeState = (e: MouseEvent) => {
    e.stopPropagation();
    setIsOpen((v) => !v);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Box
          display="flex"
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          onClick={changeState}
        >
          <IconButton sx={{ color: 'gray', p: '0' }} onClick={changeState}>
            {isOpen ? (
              <IndeterminateCheckBoxOutlinedIcon sx={{ fontSize: '20px' }} />
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
            {title}
          </Box>
        </Box>
      </Box>
      <Box display={isOpen ? 'flex' : 'none'}>
        <Box
          minWidth="20px"
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
        <Box overflow="visible">{staticContent}</Box>
      </Box>
    </Box>
  );
}

export function ExpandableContent({
  contentUrl,
  htmlTitle,
  noFurtherExpansion = false,
}: {
  contentUrl: string;
  htmlTitle?: any;
  noFurtherExpansion?: boolean;
}) {
  const urlHash = createHash(getSectionInfo(contentUrl || ''));
  const parentContext = useContext(ExpandContext);
  const childContext = [...parentContext, urlHash];
  const [rendered, setRendered] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [wasSeen, setWasSeen] = useState(false);
  if (noFurtherExpansion) childContext.push(STOP_EXPANSION_MARKER);

  const contentRef = useRef<HTMLElement>();
  const rect = useRect(contentRef);
  const isVisible = useOnScreen(contentRef);
  const { docFragManager, addSectionLoc } = useContext(DocSectionContext);
  // Reference to the top-most box.

  const onRendered = useCallback(() => {
    setRendered(true);
    console.log('rendered', contentUrl);
  }, [contentUrl]);
  const onFetched = useCallback(() => {
    setFetched(true);
    console.log('fetched', contentUrl);
  }, [contentUrl]);

  useEffect(() => {
    if (!isVisible || wasSeen) return;
    if (docFragManager?.skipExpandLoc(contentUrl)) {
      console.log('skipping due to scroll: ' + contentUrl);
      return;
    }
    setWasSeen(true);
  }, [wasSeen, isVisible, docFragManager, contentUrl]);

  useEffect(() => {
    if (!contentUrl) return;
    docFragManager?.reportLoadedFragment(
      contentUrl,
      wasSeen,
      fetched,
      rendered,
      contentRef?.current
    );
  }, [wasSeen, fetched, rendered, docFragManager, contentUrl]); // Keep contentRef?.current here to make sure that the ref is reported when loaded.

  const positionFromTop =
    rect && !IS_SERVER ? rect.top + window.scrollY : undefined;

  useEffect(() => {
    if (contentUrl && positionFromTop)
      addSectionLoc({ contentUrl, positionFromTop });
  }, [contentUrl, positionFromTop, addSectionLoc]);

  if (parentContext.includes(STOP_EXPANSION_MARKER)) return null;
  const titleText = convertHtmlNodeToPlain(htmlTitle);
  const showMenu =
    noFurtherExpansion || (titleText && !titleText.startsWith('http'));

  return (
    <ErrorBoundary hidden={false}>
      <Box minHeight={!wasSeen ? '1000px' : undefined} ref={contentRef}>
        {showMenu && (
          <Box position="absolute" right="10px">
            <ExpandableContextMenu
              sectionLink={getInDocumentLink(childContext)}
              contentUrl={contentUrl}
            />
          </Box>
        )}

        {wasSeen ? (
          <Box display="flex">
            <Box overflow="visible">
              <ExpandContext.Provider value={childContext}>
                <ContentFromUrl
                  url={contentUrl}
                  modifyRendered={getChildrenOfBodyNode}
                  minLoadingHeight={'800px'}
                  onDataFetched={onFetched}
                  onRendered={onRendered}
                />
              </ExpandContext.Provider>
            </Box>
          </Box>
        ) : (
          <>Loading...</>
        )}
      </Box>
    </ErrorBoundary>
  );
}
