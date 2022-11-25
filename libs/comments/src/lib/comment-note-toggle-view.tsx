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
}: {
  archive: string;
  filepath: string;
  defaultPrivate: boolean;
  selectedText?: string;
  selectedElement?: any;
  allNotesMode?: boolean;
}) {
  const [value, setValue] = useState(defaultPrivate ? 0 : 1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box>
      <Box>
        <Tabs value={value} onChange={handleChange}>
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
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <NotesView
          archive={archive}
          filepath={filepath}
          selectedText={selectedText}
          selectedElement={selectedElement}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CommentSection
          archive={archive}
          filepath={filepath}
          selectedText={selectedText}
          selectedElement={selectedElement}
        />
      </TabPanel>
    </Box>
  );
}
