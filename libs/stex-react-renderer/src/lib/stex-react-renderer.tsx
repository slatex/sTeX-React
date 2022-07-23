import { Box } from '@mui/material';
import { ContentFromUrl } from './ContentFromUrl';
import MathJaxContext from './MathJaxContext';
import { mmtHTMLToReact } from './mmtParser';
import { TourDisplay } from './TourDisplay';

export const BG_COLOR = 'hsl(210, 20%, 98%)';

export function StexReactRenderer({ contentUrl }: { contentUrl: string }) {
  return (
    <Box px="10px" bgcolor={BG_COLOR}>
      <Box maxWidth="520px" m="0 auto">
        <ContentFromUrl
          url={contentUrl}
          modifyRendered={(bodyNode) => bodyNode?.props?.children}
        />
      </Box>
    </Box>
  );
}

export { ContentFromUrl, mmtHTMLToReact, MathJaxContext, TourDisplay };
