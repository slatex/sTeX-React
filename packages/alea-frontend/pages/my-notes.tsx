import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { getMyNotesSections } from '@stex-react/api';
import { NotesView } from '@stex-react/comments';
import {
  FileLocation,
  fileLocToString,
  PathToArticle,
} from '@stex-react/utils';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

export interface NotesSection extends FileLocation {
  updatedTimestampSec: number;
}

const MyNotesPage: NextPage = () => {
  const [sections, setSections] = useState<NotesSection[]>([]);

  useEffect(() => {
    getMyNotesSections().then(setSections);
  }, []);

  return (
    <MainLayout title="My Notes | ALeA">
      <Box p="10px" m="0 auto" maxWidth="800px">
        {sections.map((section) => (
          <Box
            key={fileLocToString(section)}
            border="1px solid #CCC"
            p="10px"
            m="10px"
          >
            <a
              style={{ fontSize: '20px' }}
              href={PathToArticle(section)}
              target="_blank"
              rel="noreferrer"
            >
              {fileLocToString(section)}
              <OpenInNewIcon />
            </a>
            <NotesView
              file={section}
              allNotesMode={true}
            />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default MyNotesPage;
