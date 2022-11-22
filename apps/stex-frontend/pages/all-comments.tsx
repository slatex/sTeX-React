import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, IconButton } from '@mui/material';
import { getLatestUpdatedSections } from '@stex-react/api';
import { CommentSection } from '@stex-react/comments';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import { SearchBar } from '../components/SearchBar';
import { ToursAutocomplete } from '../components/ToursAutocomplete';
import MainLayout from '../layouts/MainLayout';

export interface CommentSection {
  archive: string;
  filepath: string;
  updatedTimestampSec: number;
}

const AllCommentsPage: NextPage = () => {
  const [sections, setSections] = useState<CommentSection[]>([]);

  useEffect(() => {
    getLatestUpdatedSections().then(setSections);
  }, []);
  return (
    <MainLayout title="All Comments | VoLL-KI">
      <Box p="15px" m="0 auto" maxWidth="800px">
        {sections.map((section) => (
          <Box
            key={`${section.archive}||${section.filepath}}`}
            border="1px solid #CCC"
            p="10px"
            m="10px"
          >
            <span style={{ fontSize: '20px' }}>
              {section.archive}||{section.filepath}
            </span>
            <CommentSection
              archive={section.archive}
              filepath={section.filepath}
              hideNewCommentBox={true}
            />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default AllCommentsPage;
