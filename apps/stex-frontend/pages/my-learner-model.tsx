import { Box } from '@mui/material';
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
  const [competenceInfo, setCompetenceInfo] = useState<
    { URI: number; competence: string }[]
  >([]);

  useEffect(() => {
    getAllMyData().then((d) => setCompetenceInfo(d.competencies));
  }, []);

  return (
    <MainLayout title="My Learner Model | VoLL-KI">
      <Box p="10px" m="0 auto" maxWidth="800px">
        <table>
          <tr>
            <th>URI</th>
            <th>Competence</th>
          </tr>
          <tr><td>&nbsp;</td></tr>
          {competenceInfo.map((v) => (
            <tr key={v.URI}>
              <td style={{marginRight: '5px'}}>{v.URI} &nbsp;</td>
              <td>{v.competence}</td>
            </tr>
          ))}
        </table>
      </Box>
    </MainLayout>
  );
};

export default MyLearnerModelPage;
