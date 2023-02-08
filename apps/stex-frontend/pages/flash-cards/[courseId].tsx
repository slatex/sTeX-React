import { DrillConfigurator } from '../../components/DrillConfigurator';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../layouts/MainLayout';
import { Box } from '@mui/material';

const FlashCardCoursePage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;

  return (
    <MainLayout title="Flash Cards | VoLL-KI">
      <Box m="0 auto">
        <DrillConfigurator courseId={courseId} />
      </Box>
    </MainLayout>
  );
};

export default FlashCardCoursePage;
