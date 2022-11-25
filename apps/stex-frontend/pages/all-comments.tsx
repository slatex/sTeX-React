import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { getLatestUpdatedSections } from '@stex-react/api';
import { CommentSection } from '@stex-react/comments';
import { PathToArticle } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
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
            <a
              style={{ fontSize: '20px' }}
              href={PathToArticle(section.archive, section.filepath)}
              target="_blank"
              rel="noreferrer"
            >
              {section.archive}||{section.filepath}
              <OpenInNewIcon />
            </a>
            <CommentSection
              archive={section.archive}
              filepath={section.filepath}
              allCommentsMode={true}
            />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default AllCommentsPage;
