import { Box, Tab, Tabs } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { CommentSection } from './comment-section';
import { NotesView } from './notes-view';

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box p="0 15px 0">
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export function CommentNoteToggleView({
  archive,
  filepath,
  defaultPrivate,
  selectedText = undefined,
  selectedElement = undefined,
  allNotesMode = false,
  extraPanel = undefined,
}: {
  archive: string;
  filepath: string;
  defaultPrivate: boolean;
  selectedText?: string;
  selectedElement?: any;
  allNotesMode?: boolean;
  extraPanel?: {
    label: any;
    panelContent: any;
  };
}) {
  const [value, setValue] = useState(extraPanel ? 2 : defaultPrivate ? 0 : 1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              borderRadius: extraPanel ? '8px 8px 0 0' : undefined,
              ':hover': { background: '#DDD' },
            },
            '& .Mui-selected': { background: '#8c9fb1 !important' },
          }}
        >
          <Tab
            sx={{ flexGrow: '1' }}
            label={
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ fontSize: '28px' }} />
                <sup style={{ margin: '-5px 5px 0 -7px' }}>
                  <LockIcon sx={{ fontSize: '11px' }} />
                </sup>
                My Notes
              </Box>
            }
          />
          <Tab
            sx={{ flexGrow: '1' }}
            label={
              <Box display="flex" alignItems="center">
                <PublicIcon sx={{ mr: '5px' }} />
                Comments
              </Box>
            }
          />
          {extraPanel && (
            <Tab sx={{ flexGrow: '1' }} label={extraPanel.label} />
          )}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <NotesView
          archive={archive}
          filepath={filepath}
          selectedText={selectedText}
          selectedElement={selectedElement}
          allNotesMode={allNotesMode}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CommentSection
          archive={archive}
          filepath={filepath}
          selectedText={selectedText}
          selectedElement={selectedElement}
          allCommentsMode={allNotesMode}
        />
      </TabPanel>
      {extraPanel && (
        <TabPanel value={value} index={2}>
          {extraPanel.panelContent}
        </TabPanel>
      )}
    </Box>
  );
}
