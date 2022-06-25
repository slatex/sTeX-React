import { Box } from '@mui/material';
import { ContentFromUrl } from './ContentFromUrl';
import { mmtHTMLToReact } from './mmtParser';

export const BG_COLOR = 'hsl(210, 20%, 98%)';

export function StexReactRenderer({ contentUrl }: { contentUrl: string }) {
  return (
    <Box display="flex">
      <Box flexGrow={1} flexBasis={600} bgcolor={BG_COLOR}>
        <Box p="0 10px 0 40px" maxWidth="520px" m="0 auto" bgcolor={BG_COLOR}>
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={(bodyNode) => bodyNode?.props?.children}
          />
        </Box>
      </Box>
      <Box
        flexBasis={300}
        display={{ xs: 'none', md: 'block' }}
        bgcolor={BG_COLOR}
      ></Box>
    </Box>
  );
}

export { ContentFromUrl, mmtHTMLToReact };
