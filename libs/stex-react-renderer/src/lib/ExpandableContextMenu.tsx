import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import { useState } from 'react';
import { getSectionInfo } from '@stex-react/utils';

export function ExpandableContextMenu({
  sectionLink,
  contentUrl,
}: {
  sectionLink?: string;
  contentUrl: string;
}) {
  // menu crap start
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // menu crap end

  const [snackBarOpen, setSnackbarOpen] = useState(false);

  const sourceUrl = getSectionInfo(contentUrl).source;

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>

      {/*Snackbar only displayed on copy link button click.*/}
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Link Copied to Clipboard"
      />
      <Menu
        id="comment-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        {sectionLink && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(sectionLink);
              setSnackbarOpen(true);
              handleClose();
            }}
          >
            <LinkIcon />
            &nbsp;Copy Section Link
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          sx={{ p: '0' }}
        >
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', padding: '6px 16px', width: '100%' }}
          >
            <IntegrationInstructionsIcon />
            &nbsp;View Source&nbsp;
            <OpenInNewIcon sx={{ fontSize: '14px' }} fontSize="small" />
          </a>
        </MenuItem>
      </Menu>
    </>
  );
}
