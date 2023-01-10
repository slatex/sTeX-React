import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FlashCards } from '../../../components/FlashCards';
import MainLayout from '../../../layouts/MainLayout';

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
      .get(`/api/get-cards/${courseId}/${encodeURIComponent(chapter)}`)
      .then((r) => {
        setIsLoading(false);
        setDrillItems(r.data);
      });
  }, [router.isReady, courseId, chapter]);

  return (
    <MainLayout title="Flash Cards">
      <Box flexGrow={1}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <FlashCards header={chapter} allItems={drillItems} />
        )}
      </Box>
      <Link href={`/flash-cards/${courseId}`}>
        <Button variant="contained" sx={{ m: '10px' }}>
          <ArrowBackIcon fontSize="small" />&nbsp;All Course Cards
        </Button>
      </Link>
    </MainLayout>
  );
};

export default GuidedTourPage;
