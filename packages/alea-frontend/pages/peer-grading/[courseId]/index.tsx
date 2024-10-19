import { NextPage } from 'next';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { CourseHeader } from '../../course-home/[courseId]';
import { useContext, useEffect, useState } from 'react';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { getCourseInfo, getReviewRequests } from '@stex-react/api';
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
  console.log(reviewRequests);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);
  useEffect(() => {
    getReviewRequests(courseId).then(setReviewRequests);
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
        <Box maxWidth={'md'}>
          {reviewRequests.map((c) => (
            <>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {mmtHTMLToReact(c.questionTitle)}
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {c.answers.map((d) => (
                      <>
                        <Link
                          href={{
                            pathname: './[courseId]/[reviewId]',
                            query: { reviewId: d.id, courseId: courseId },
                          }}
                        >
                          <ListItemButton>
                            <ListItemText
                              primary={d.answer}
                              secondary={`Sub Problem: ${+d.subProblemId+1}`}
                              style={{ whiteSpace: 'pre-line' }}
                            />
                          </ListItemButton>
                          <Divider></Divider>
                        </Link>
                      </>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </>
          ))}
        </Box>
      </MainLayout>
    </>
  );
};
export default PeerGradingListPage;
