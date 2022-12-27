import { Box, Button, CircularProgress } from '@mui/material';
import { BG_COLOR } from '@stex-react/utils';
import axios from 'axios';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DrillCards } from '../../../components/DrillCards';
import MainLayout from '../../../layouts/MainLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GuidedTourPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const chapter = router.query.chapter as string;
  const [isLoading, setIsLoading] = useState(true);
  const [drillItems, setDrillItems] = useState<
    { uri: string; htmlNode: string }[]
  >([]);

  useEffect(() => {
    if (!router.isReady) return;
    setIsLoading(true);
    axios
      .get(`/api/get-drill-items/${courseId}/${encodeURIComponent(chapter)}`)
      .then((r) => {
        setIsLoading(false);
        setDrillItems(r.data);
      });
  }, [router.isReady, courseId, chapter]);

  return (
    <MainLayout title="Drill Cards">
      <Box flexGrow={1} bgcolor={BG_COLOR} my="10px">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <DrillCards drillItems={drillItems} />
        )}
      </Box>
      <Link href={`/drill-cards/${courseId}`}>
        <Button variant="contained" sx={{ m: '10px' }}>
          <ArrowBackIcon fontSize="small" />&nbsp;All Course Drills
        </Button>
      </Link>
    </MainLayout>
  );
};

export default GuidedTourPage;
