import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { getMyNotesSections } from '@stex-react/api';
import { NotesView } from '@stex-react/comments';
import { PathToArticle } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

export interface NotesSection {
  archive: string;
  filepath: string;
  updatedTimestampSec: number;
}

const MyNotesPage: NextPage = () => {
  const [sections, setSections] = useState<NotesSection[]>([]);

  useEffect(() => {
    getMyNotesSections().then(setSections);
  }, []);

  return (
    <MainLayout title="My Notes | VoLL-KI">
      <Box p="10px" m="0 auto" maxWidth="800px">
        {sections.map((section) => (
          <Box
            key={`${section.archive}||${section.filepath}}`}
            border="1px solid #CCC"
            p="10px"
            m="10px"
          >
            <a
              style={{ fontSize: '20px' }}
              href={PathToArticle(section.archive, section.filepath)}
              target="_blank"
              rel="noreferrer"
            >
              {section.archive}||{section.filepath}
              <OpenInNewIcon />
            </a>
            <NotesView archive={section.archive} filepath={section.filepath} allNotesMode={true} />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default MyNotesPage;
