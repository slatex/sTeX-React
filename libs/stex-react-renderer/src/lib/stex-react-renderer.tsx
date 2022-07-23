import { Box, Drawer, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { ContentDashboard } from './ContentDashboard';
import { ContentFromUrl } from './ContentFromUrl';
import MathJaxContext from './MathJaxContext';
import { mmtHTMLToReact } from './mmtParser';
import { TourDisplay } from './TourDisplay';
import ListIcon from '@mui/icons-material/List';

export const BG_COLOR = 'hsl(210, 20%, 98%)';
const W = typeof window === 'undefined' ? undefined : window;

export function StexReactRenderer({
  contentUrl,
  topOffset = 0,
}: {
  contentUrl: string;
  topOffset?: number;
}) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [windowSize, setWindowSize] = useState(0);
  useEffect(() => {
    function handleResize() {
      setWindowSize(W?.innerWidth || 0);
    }
    setWindowSize(W?.innerWidth || 0);
    W?.addEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Drawer
        anchor="left"
        // 800 is the size 'md'
        open={windowSize < 800 && showDashboard}
        onClose={() => setShowDashboard(false)}
      >
        <ContentDashboard
          onClose={() => setShowDashboard(false)}
          topOffset={topOffset}
        />
      </Drawer>

      {showDashboard ? (
        <Box display={{ xs: 'none', md: 'block' }}>
          <ContentDashboard
            onClose={() => setShowDashboard(false)}
            topOffset={topOffset}
          />
        </Box>
      ) : (
        <IconButton
          onClick={() => setShowDashboard(true)}
          sx={{ position: 'fixed', top: `${topOffset + 2}px`, left: '5px' }}
        >
          <ListIcon />
        </IconButton>
      )}

      <Box  display="flex" px="10px" bgcolor={BG_COLOR}>
        {showDashboard && (
          <Box flex="0 0 300px" display={{ xs: 'none', md: 'block' }}></Box>
        )}
        <Box maxWidth="520px" m="0 auto">
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={(bodyNode) => bodyNode?.props?.children}
          />
        </Box>
      </Box>
    </>
  );
}

export { ContentFromUrl, mmtHTMLToReact, MathJaxContext, TourDisplay };
