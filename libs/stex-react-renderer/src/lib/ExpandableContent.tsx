import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box } from '@mui/material';
import { useState } from 'react';
import { ContentFromUrl } from './ContentFromUrl';

export function ExpandableContent({
  contentUrl,
  title,
}: {
  contentUrl: string;
  title: any;
}) {
  const [openAtLeastOnce, setOpenAtLeastOnce] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box m="4px 0">
      <Box
        display="flex"
        alignItems="center"
        onClick={() => {
          setOpenAtLeastOnce(true);
          setIsOpen((v) => !v);
        }}
        sx={{
          '&:hover': { background: '#DDD' },
          cursor: 'pointer',
          width: 'fit-content',
          paddingRight: '6px',
          borderRadius: '5px',
        }}
      >
        <Box sx={{ color: 'gray', marginBottom: '-3px' }}>
          {isOpen ? (
            <KeyboardArrowDownIcon sx={{ fontSize: '20px' }} />
          ) : (
            <KeyboardArrowRightIcon sx={{ fontSize: '20px' }} />
          )}
        </Box>
        <Box>
          <b style={{ fontSize: 'large' }}>{title}</b>
        </Box>
      </Box>

      {openAtLeastOnce && (
        <Box hidden={!isOpen} ml="9px" pl="10px" borderLeft="1px solid #DDD">
          {/*The extra margin consumed by each layer is equal to (ml+pl) above */}
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={(bodyNode) => bodyNode?.props?.children}
          />
        </Box>
      )}
    </Box>
  );
}
