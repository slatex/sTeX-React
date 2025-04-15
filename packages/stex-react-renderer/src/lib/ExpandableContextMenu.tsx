import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getLocaleObject } from './lang/utils';

export function ExpandableContextMenu({
  sectionLink,
  contentUrl,
}: {
  sectionLink?: string;
  contentUrl: string;
}) {
  const t = getLocaleObject(useRouter());
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

  //Todo alea-4
  //const sourceUrl = getSectionInfo(contentUrl).source;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          zIndex: '1',
          color: '#0004',
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: '#FFF',
            color: 'black',
            border: '1px solid #CCC',
            boxShadow: '#0005 0px 8px 15px',
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>

      {/*Snackbar only displayed on copy link button click.*/}
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={t.linkCopied}
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
            &nbsp;{t.copySectionLink}
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          sx={{ p: '0' }}
        >
          {/* TODO ALEA-4 */}
          {/* <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', padding: '6px 16px', width: '100%' }}
          >
            <IntegrationInstructionsIcon />
            &nbsp;{t.viewSource}&nbsp;
            <OpenInNewIcon sx={{ fontSize: '14px' }} fontSize="small" />
          </a> */}
        </MenuItem>
      </Menu>
    </>
  );
}
