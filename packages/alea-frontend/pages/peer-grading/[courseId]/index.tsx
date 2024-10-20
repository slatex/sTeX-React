import { NextPage } from 'next';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';

import { CourseHeader } from '../../course-home/[courseId]';
import { useContext, useEffect, useState } from 'react';
import {  ServerLinksContext } from '@stex-react/stex-react-renderer';
import { getCourseInfo, getReviewRequests, ReviewType } from '@stex-react/api';
import { CourseInfo } from '@stex-react/utils';
import { useRouter } from 'next/router';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { ShowReviewRequests } from 'packages/stex-react-renderer/src/lib/nap/ShowReviewRequests';
const PeerGradingListPage: NextPage = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();

  const { mmtUrl } = useContext(ServerLinksContext);
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<Record<string, CourseInfo> | undefined>(undefined);
  const [reviewRequests, setReviewRequests] = useState<
    {
      answers: { subProblemId: number; id: number; answer: string; answerId: number }[];
      questionTitle: string;
    }[]
  >([]);
  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);
  useEffect(() => {
    getReviewRequests(ReviewType.PEER,courseId).then(setReviewRequests);
  }, [courseId]);
  const courseInfo = courses?.[courseId];

  return (
    <>
      <MainLayout>
        <CourseHeader
          courseName={courseInfo?.courseName}
          imageLink={courseInfo?.imageLink}
          courseId={courseId}
        />
        <ShowReviewRequests courseId={courseId} reviewRequests={reviewRequests}></ShowReviewRequests>
      </MainLayout>
    </>
  );
};
export default PeerGradingListPage;
