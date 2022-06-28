import { Box, IconButton } from '@mui/material';
import { useState } from 'react';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
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
      <Box display="flex" alignItems="center">
        <IconButton
          sx={{ p: '4px 4px 4px 0' }}
          size="small"
          onClick={() => {
            setOpenAtLeastOnce(true);
            setIsOpen((v) => !v);
          }}
        >
          {isOpen ? (
            <IndeterminateCheckBoxOutlinedIcon />
          ) : (
            <AddBoxOutlinedIcon />
          )}
        </IconButton>
        <Box>
          <b style={{ fontSize: 'large' }}>{title}</b>
        </Box>
      </Box>

      {openAtLeastOnce && (
        <Box hidden={!isOpen} ml="4px" pl="7px" borderLeft="1px solid #DDD">
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
