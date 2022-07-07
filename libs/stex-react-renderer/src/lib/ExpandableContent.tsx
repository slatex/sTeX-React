import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { Box, IconButton, Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import {
  createContext,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ContentFromUrl } from './ContentFromUrl';

const ExpandContext = createContext([] as string[]);
function hash(str: string) {
  if (str?.length === 0) return '0';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

function getInDocumentLink(childContext: string[]) {
  if (typeof window === 'undefined') return '';
  return (
    window.location.origin +
    window.location.pathname +
    '?inDocPath=' +
    childContext.join('|')
  );
}
function getToOpenContentHash(inDocPath: string) {
  if (!inDocPath?.length) return [];
  return inDocPath.split('|');
}

export function ExpandableContent({
  contentUrl,
  title,
}: {
  contentUrl: string;
  title: any;
}) {
  const router = useRouter();
  const toOpenContentHash = getToOpenContentHash(
    router.query['inDocPath'] as string
  );

  const urlHash = hash(contentUrl);
  // Oversimplied logic of isDefaultOpen: Should check if parents match too.
  const isDefaultOpen = toOpenContentHash.includes(urlHash);
  const [openAtLeastOnce, setOpenAtLeastOnce] = useState(isDefaultOpen);
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const parentContext = useContext(ExpandContext);
  const childContext = [...parentContext, urlHash];

  const [snackBarOpen, setSnackbarOpen] = useState(false);

  // Reference to the top most Box.
  const contentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (isDefaultOpen)
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [router.isReady, isDefaultOpen]);

  const changeState = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenAtLeastOnce(true);
    setIsOpen((v) => !v);
  };

  return (
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
            <b style={{ fontSize: 'large' }}>{title}</b>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={() => {
            const link = getInDocumentLink(childContext);
            navigator.clipboard.writeText(link);
            setSnackbarOpen(true);
          }}
        >
          <LinkIcon />
        </IconButton>
      </Box>

      {/*Snackbar only displayed on copy link button click.*/}
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Link Copied to Clipboard"
      />

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
            <ExpandContext.Provider value={childContext}>
              <ContentFromUrl
                url={contentUrl}
                modifyRendered={(bodyNode) => bodyNode?.props?.children}
              />
            </ExpandContext.Provider>
          </Box>
        </Box>
      )}
    </Box>
  );
}
