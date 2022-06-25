import { Box, LinearProgress } from '@mui/material';
import { useState } from 'react';

export function IFrameWithProgress({
  src,
  width,
  height,
}: {
  src: string;
  width: string;
  height: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <Box>
      <iframe
        title={src}
        width={width}
        height={height}
        src={src}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && <LinearProgress />}
    </Box>
  );
}
