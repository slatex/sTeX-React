import { Box } from '@mui/material';
import { CommentButton } from '@stex-react/comments';
import { createContext } from 'react';
import { DocFragManager } from './DocFragManager';

export const DocSectionContext = createContext({
  docFragManager: undefined as DocFragManager | undefined,
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
  sectionLocs,
}: {
  contentUrl: string;
  topOffset: number;
  sectionLocs: { [contentUrl: string]: number };
}) {
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
