import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { Box, IconButton } from '@mui/material';
import { convertHtmlNodeToPlain, simpleHash } from '@stex-react/utils';
import { useRouter } from 'next/router';
import {
  createContext,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { reportContext } from './collectIndexInfo';
import { ContentFromUrl } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { ExpandableContextMenu } from './ExpandableContextMenu';

const SEPARATOR_inDocPath = '.';
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

function getToOpenContentHash(inDocPath: string) {
  if (!inDocPath?.length) return [];
  return inDocPath.split(SEPARATOR_inDocPath);
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
  // TODO: hash should be of the content URI (archive, filepath). Not the full url.
  const urlHash = simpleHash(contentUrl);
  const [openAtLeastOnce, setOpenAtLeastOnce] = useState(defaultOpen);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const router = useRouter();
  const parentContext = useContext(ExpandContext);
  const childContext = [...parentContext, urlHash];

  const titleText = convertHtmlNodeToPlain(htmlTitle);
  const autoExpand = !titleText || titleText.startsWith('http');

  // Reference to the top most Box.
  const contentRef = useRef<HTMLInputElement>(null);
  reportContext(childContext, titleText);

  useEffect(() => {
    const inDocPath = router?.query?.['inDocPath'] as string;
    const toOpenContentHash = getToOpenContentHash(inDocPath);
    // Oversimplied logic of openDueToUrl: Should check if parents match too.
    const openDueToUrl = toOpenContentHash.includes(urlHash);
    if (openDueToUrl) {
      setIsOpen(true);
      setOpenAtLeastOnce(true);
      if (toOpenContentHash.at(-1) === urlHash) {
        setTimeout(
          () => contentRef.current?.scrollIntoView({ behavior: 'smooth' }),
          200
        );
      }
    }
  }, [router?.isReady, router?.query, urlHash]);

  const changeState = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenAtLeastOnce(true);
    setIsOpen((v) => !v);
  };

  if (autoExpand) {
    return (
      <ErrorBoundary hidden={false}>
        {contentUrl ? (
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={(bodyNode) => bodyNode?.props?.children}
          />
        ) : (
          { staticContent }
        )}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary hidden={false}>
      <Box m="4px 0" ref={contentRef}>
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

        {openAtLeastOnce && (
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
            <Box>
              {contentUrl ? (
                <ExpandContext.Provider value={childContext}>
                  <ContentFromUrl
                    url={contentUrl}
                    modifyRendered={(bodyNode) => bodyNode?.props?.children}
                  />
                </ExpandContext.Provider>
              ) : (
                staticContent
              )}
            </Box>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
}
