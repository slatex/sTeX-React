import { Box, Card, CardContent, CircularProgress } from '@mui/material';
import { PRIMARY_COL } from '@stex-react/utils';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const FlashCardCoursePage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [drillCounts, setDrillCounts] = useState<
    { chapter: string; count: number }[]
  >([]);

  useEffect(() => {
    if (!router.isReady) return;
    setIsLoading(true);
    axios.get(`/api/get-card-counts/${courseId}`).then((r) => {
      setIsLoading(false);
      setDrillCounts(r.data);
    });
  }, [router.isReady, courseId]);

  return (
    <MainLayout title="Flash Cards">
      {isLoading ? <CircularProgress /> : null}
      {drillCounts.map((drill) => (
        <Card
          key={drill.chapter}
          sx={{ m: '10px', background: PRIMARY_COL, cursor: 'pointer' }}
          onClick={() => {
            router.push(
              `/flash-cards/${courseId}/${encodeURIComponent(drill.chapter)}`
            );
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="center" minHeight="70px">
              <b
                style={{
                  color: 'white',
                  fontSize: '24px',
                  textAlign: 'center',
                }}
              >
                {drill.chapter == 'all' ? 'All Chapters' : drill.chapter}
              </b>
            </Box>
            <b style={{ display: 'table', color: 'white', margin: '0 auto' }}>
              {drill.count}&nbsp;Concepts
            </b>
          </CardContent>
        </Card>
      ))}
    </MainLayout>
  );
};

export default FlashCardCoursePage;
