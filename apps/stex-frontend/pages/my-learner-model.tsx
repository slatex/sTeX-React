import { Box, CircularProgress, IconButton } from '@mui/material';
import { getAllMyData } from '@stex-react/api';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface NotesSection {
  archive: string;
  filepath: string;
  updatedTimestampSec: number;
}

const MyLearnerModelPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [competenceInfo, setCompetenceInfo] = useState<
    { URI: number; competence: string }[]
  >([]);

  function refresh() {
    setIsLoading(true);

    getAllMyData().then((d) => {
      setIsLoading(false);
      setCompetenceInfo(d.competencies);
    });
  }
  useEffect(() => {
    refresh();
  }, []);

  return (
    <MainLayout title="My Learner Model | VoLL-KI">
      <Box p="10px" m="0 auto" maxWidth="800px">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <IconButton onClick={() => refresh()}>
              <RefreshIcon />
            </IconButton>
            <table>
              <tr>
                <th>URI</th>
                <th>Competence</th>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              {competenceInfo.map((v) => (
                <tr key={v.URI}>
                  <td style={{ marginRight: '5px' }}>{v.URI} &nbsp;</td>
                  <td>{v.competence}</td>
                </tr>
              ))}
            </table>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default MyLearnerModelPage;
