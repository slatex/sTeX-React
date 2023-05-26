import { Box } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../../layouts/MainLayout';
import { CourseHeader } from '../../course-home/[courseId]';

const ForumPage: NextPage = () => {
  const courseId = useRouter()?.query?.courseId as string;
  return (
    <MainLayout>
      <CourseHeader courseId={courseId} />
      <Box maxWidth="800px" m="auto" px="10px">
      </Box>
    </MainLayout>
  );
};

export default ForumPage;
