import { Box } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ForumView } from '../../../components/ForumView';
import MainLayout from '../../../layouts/MainLayout';
import { CourseHeader } from '../../course-home/[courseId]';
import { ThreadView } from '../../../components/ThreadView';

const ForumPage: NextPage = () => {
  const courseId = useRouter()?.query?.courseId as string;
  const threadId = +(useRouter()?.query?.threadId?.[0] as string);
  return (
    <MainLayout>
      <CourseHeader courseId={courseId} />
      <Box maxWidth="800px" m="auto" px="10px">
        {threadId ? (
          <ThreadView threadId={threadId} courseId={courseId} />
        ) : (
          <ForumView />
        )}
      </Box>
    </MainLayout>
  );
};

export default ForumPage;
