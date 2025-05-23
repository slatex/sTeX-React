import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { getLatestUpdatedSections } from '@stex-react/api';
import { CommentSection } from '@stex-react/comments';
import {
  FileLocation,
  fileLocToString,
} from '@stex-react/utils';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

export interface CommentSection extends FileLocation {
  updatedTimestampSec: number;
}

const AllCommentsPage: NextPage = () => {
  const [sections, setSections] = useState<CommentSection[]>([]);

  useEffect(() => {
    getLatestUpdatedSections().then(setSections);
  }, []);
  return (
    <MainLayout title="All Comments | ALeA">
      <Box p="15px" m="0 auto" maxWidth="800px">
        {sections.map((section) => (
          <Box
            key={fileLocToString(section)}
            border="1px solid #CCC"
            p="10px"
            m="10px"
          >
            <a
              style={{ fontSize: '20px' }}
              href={'/TODO ALEA4-N8.1'} //PathToArticle(section)}
              target="_blank"
              rel="noreferrer"
            >
              {fileLocToString(section)}
              <OpenInNewIcon />
            </a>
            <CommentSection uri={"todo alea4"} allCommentsMode={true} />
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default AllCommentsPage;
