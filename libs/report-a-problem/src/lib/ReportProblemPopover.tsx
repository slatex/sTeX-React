import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Box, IconButton, Snackbar } from '@mui/material';
import { PropsWithChildren, useState } from 'react';
import { createPortal } from 'react-dom';
import { issuesUrlList, SectionInfo } from './issueCreator';
import { ReportProblemDialog } from './ReportProblemDialog';
import { useTextSelection } from './useTextSelection';

type Props = {
  target?: HTMLElement;
  mount?: HTMLElement;
};

function Portal(props: PropsWithChildren<{ mount?: HTMLElement }>) {
  if (typeof document === 'undefined') return null;
  return createPortal(props.children, props.mount || document.body);
}

function getSectionInfo(url: string): SectionInfo {
  const match = /archive=([^&]+)&filepath=(.+)/g.exec(url);
  const archive = match?.[1] || '';
  const filepath = match?.[2] || '';
  const sourcePath = filepath.replace('xhtml', 'tex');
  const source = `https://gl.mathhub.info/${archive}/-/blob/main/source/${sourcePath}`;
  return {
    url: url.replace('/document?', '/fulldocument?'),
    archive,
    filepath,
    source,
  };
}

function getContext(node?: Node): SectionInfo[] {
  if (!node) return [];
  const parentContext = getContext(node.parentNode as Node);
  const sectionUrl = (node as any).attributes?.['section-url']?.value;
  if (!sectionUrl) return parentContext;
  return [getSectionInfo(sectionUrl), ...parentContext];
}

export function ReportProblemPopover(props: Props) {
  const { clientRect, isCollapsed, textContent, commonAncestor } =
    useTextSelection(props.target);
  const [open, setOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [context, setContext] = useState<SectionInfo[]>([]);

  const [snackBarOpen, setSnackbarOpen] = useState(false);
  const [newIssueUrl, setNewIssueUrl] = useState('');

  return (
    <>
      <Portal mount={props.mount}>
        {clientRect != null && !isCollapsed && textContent?.trim().length && (
          <Box
            sx={{
              position: 'absolute',
              left: `${clientRect.left + clientRect.width / 2}px`,
              top: `${clientRect.top - 50}px`,
            }}
          >
            <IconButton
              sx={{
                border: '2px solid #f2c300',
                borderRadius: '500px',
                color: '#f2c300',
                backgroundColor: 'white',
                boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s ease 0s',
                zIndex: 10000,
                ':hover': {
                  boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.4)',
                  transform: 'translateY(1px)',
                  backgroundColor: 'white',
                },
              }}
              onClick={() => {
                setSelectedText(textContent.trim());
                setContext(getContext(commonAncestor));
                setOpen(true);
              }}
            >
              <ReportProblemIcon />
            </IconButton>
          </Box>
        )}
      </Portal>

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={newIssueUrl ? 'New issue created.' : 'Something went wrong!.'}
        action={
          <a
            href={newIssueUrl || issuesUrlList(context)}
            target="_blank"
            rel="noreferrer"
          >
            <b style={{ color: 'dodgerblue' }}>
              SEE ISSUE{newIssueUrl ? '' : 'S'}&nbsp;
              <OpenInNewIcon
                fontSize="small"
                sx={{ verticalAlign: 'bottom' }}
              />
            </b>
          </a>
        }
      />
      <ReportProblemDialog
        open={open}
        setOpen={setOpen}
        selectedText={selectedText}
        context={context}
        onCreateIssue={(issueUrl) => {
          setNewIssueUrl(issueUrl);
          setSnackbarOpen(true);
        }}
      />
    </>
  );
}