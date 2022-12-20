import { Box } from '@mui/material';
import { CommentButton } from '@stex-react/comments';
import { createContext, useContext } from 'react';

export const DocSectionContext = createContext({
  sectionLocs: {},
  addSectionLoc: (_sec: {
    contentUrl: string;
    positionFromTop: number;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }) => {},
});

export function InfoSidebar({
  contentUrl,
  topOffset,
}: {
  contentUrl: string;
  topOffset: number;
}) {
  const { sectionLocs } = useContext(DocSectionContext);
  return (
    <Box width="40px" position="relative">
      <CommentButton url={contentUrl} />
      {Object.entries(sectionLocs || {}).map((v) => (
        <Box
          key={v[0]}
          position="absolute"
          top={`${(v[1] as number) - topOffset}px`}
        >
          <CommentButton url={v[0] as string} />
        </Box>
      ))}
    </Box>
  );
}
