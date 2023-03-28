import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { ALL_DIMENSIONS, getAllMyData } from '@stex-react/api';
import { FileLocation } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';

export interface NotesSection extends FileLocation {
  updatedTimestampSec: number;
}

const MyLearnerModelPage: NextPage = () => {
  const router = useRouter();
  const { myLearnerModel: t } = getLocaleObject(router);
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

  return (
    <MainLayout title="My Learner Model | VoLL-KI">
      <Box p="10px" m="0 auto" maxWidth="800px">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <h1>{t.learnerModel}</h1>
            <span style={{ color: '#333' }}>
              {t.description1}
              {' ['}
              <Tooltip
                title={
                  <>
                    <span>Fuller et al. (2007)</span>
                    <span>
                      Developing a computer science-specific learning taxonomy.
                    </span>
                    <span>
                      ACM SIGCSE Bulletin. 39. 152-170. 10.1145/1345375.1345438.
                    </span>
                  </>
                }
              >
                <a
                  href="https://dl.acm.org/doi/10.1145/1345375.1345438"
                  style={{ cursor: 'pointer' }}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i>Fuller et. al.</i>
                </a>
              </Tooltip>
              {']'}
              {t.description2}
            </span>
            <br />
            <IconButton onClick={() => refresh()}>
              <RefreshIcon />
            </IconButton>
            <table>
              <tr>
                <th>URI</th>
                {ALL_DIMENSIONS.map((dim) => (
                  <th key={dim}>{dim}</th>
                ))}
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              {competenceInfo.map((v) => (
                <tr key={v.URI}>
                  <td>{v.URI} &nbsp;</td>
                  {ALL_DIMENSIONS.map((dim) => (
                    <td key={dim} style={{ textAlign: 'center' }}>
                      {(+v.values[dim])?.toFixed(2)}&nbsp;
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
