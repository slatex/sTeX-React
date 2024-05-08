import { Box } from '@mui/material';
import { Window } from '@stex-react/utils';
import { ReactNode, useEffect, useRef, useState } from 'react';

export function DocumentWidthSetter({
  children,
  forceWidthUpdate,
}: {
  children: ReactNode;
  forceWidthUpdate?: any;
}) {
  const [contentWidth, setContentWidth] = useState(600);
  const outerBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      const outerWidth = outerBox?.current?.clientWidth;
      if (!outerWidth) return;
      const spacePadding = 10;
      setContentWidth(Math.min(outerWidth - spacePadding, 900));
    }
    handleResize();
    Window?.addEventListener('resize', handleResize);
    return () => Window?.removeEventListener('resize', handleResize);
  }, [forceWidthUpdate]);

  return (
    <Box
      ref={outerBox}
      {...({ style: { '--document-width': `${contentWidth}px` } } as any)}
    >
      {children}
    </Box>
  );
}
