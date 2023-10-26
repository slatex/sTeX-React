import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { getAllMyData } from '@stex-react/api';
import { FileLocation } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import RenderCompetencyData from '../components/RenderCompetencyData';

export interface NotesSection extends FileLocation {
  updatedTimestampSec: number;
}

const MyLearnerModelPage: NextPage = () => {
  const router = useRouter();
  const { myLearnerModel: t } = getLocaleObject(router);
  const [isLoading, setIsLoading] = useState(false);
  const [competenceInfo, setCompetenceInfo] = useState<
    { URI: string; values: { [key: string]: string } }[]
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

  const plainCompetencyData = competenceInfo.map((data) => data.values) || [];
  const URIs = competenceInfo.map((v) => v.URI);
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

            {competenceInfo.length ? (
              <RenderCompetencyData
                URIs={URIs}
                competencyData={plainCompetencyData}
              />
            ) : null}
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default MyLearnerModelPage;
