import { DrillConfigurator } from '../../components/DrillConfigurator';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../layouts/MainLayout';
import { Box } from '@mui/material';
import { getLocaleObject } from '../../lang/utils';

const FlashCardCoursePage: NextPage = () => {
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;
  const courseId = router.query.courseId as string;

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` ${t.cards} | ALeA`}
    >
      <Box m="0 auto">
        <DrillConfigurator courseId={courseId} />
      </Box>
    </MainLayout>
  );
};

export default FlashCardCoursePage;
