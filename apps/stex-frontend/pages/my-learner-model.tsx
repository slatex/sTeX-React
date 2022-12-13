import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { getAllMyData } from '@stex-react/api';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

export interface NotesSection {
  archive: string;
  filepath: string;
  updatedTimestampSec: number;
}

const MyLearnerModelPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [competenceInfo, setCompetenceInfo] = useState<
    { URI: number; values: { [key: string]: string } }[]
  >([]);

  function refresh() {
    setIsLoading(true);

    getAllMyData().then((d) => {
      setIsLoading(false);
      setCompetenceInfo(d.model || []);
    });
  }
  useEffect(() => {
    refresh();
  }, []);

  const comptenceTypes = Object.keys(competenceInfo?.[0]?.values || {});
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
                {comptenceTypes.map((type) => (
                  <th key={type}>{type}</th>
                ))}
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              {competenceInfo.map((v) => (
                <tr key={v.URI}>
                  <td>{v.URI} &nbsp;</td>
                  {comptenceTypes.map((type) => (
                    <td key={type}>
                      {v.values[type]}&nbsp;
                    </td>
                  ))}
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
