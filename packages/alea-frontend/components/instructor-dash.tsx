import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import GradingIcon from '@mui/icons-material/Grading';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import QuizIcon from '@mui/icons-material/Quiz';
import { Avatar, Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import {
  getCourseGradingItems,
  getCourseQuizList,
  getHomeworkList,
  getUserInfo,
} from '@stex-react/api';
import { Action, CourseResourceAction, PRIMARY_COL, ResourceName } from '@stex-react/utils';
import axios from 'axios';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const excludedResources = [
  ResourceName.COURSE_STUDY_BUDDY,
  ResourceName.COURSE_ACCESS,
  ResourceName.COURSE_COMMENTS,
];

function calculateTimeAgo(timestamp: string): string | null {
  if (!timestamp) return null;
  const dateTime = dayjs(timestamp);
  return dateTime.isValid() ? dateTime.fromNow() : null;
}

const getTimeAgoColor = (timestamp: string | null): string => {
  if (!timestamp) return 'text.secondary';
  const daysDifference = dayjs().diff(dayjs(timestamp), 'day');
  if (daysDifference < 3) return 'green';
  if (daysDifference <= 5) return 'orange';
  return 'red';
};

const getResourceIcon = (name: ResourceName) => {
  switch (name) {
    case ResourceName.COURSE_NOTES:
      return <ArticleIcon />;
    case ResourceName.COURSE_QUIZ:
      return <QuizIcon />;
    case ResourceName.COURSE_COMMENTS:
      return <CommentIcon />;
    case ResourceName.COURSE_STUDY_BUDDY:
      return <Diversity3Icon />;
    case ResourceName.COURSE_HOMEWORK:
      return <GradingIcon />;
    case ResourceName.COURSE_ACCESS:
      return <LockOpenIcon />;
    default:
      return name[0];
  }
};

async function getLastUpdatedQuiz(
  courseId: string
): Promise<{ description: string | null; timeAgo: string | null; timeStamp: string | null }> {
  try {
    const quizList = await getCourseQuizList(courseId);
    const timeStamp = quizList[quizList.length - 1].quizStartTs;
    const description = `Last Quiz: ${dayjs(timeStamp).format('YYYY-MM-DD')}`;
    const timeAgo = calculateTimeAgo(timeStamp);
    return { description, timeAgo, timeStamp };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timeStamp: null };
  }
}

async function getLastUpdatedHomework(
  courseId: string
): Promise<{ description: string | null; timeAgo: string | null; timeStamp: string | null }> {
  try {
    const homeworkList = await getHomeworkList(courseId);
    const timeStamp = homeworkList[homeworkList.length - 1].givenTs;
    const description = `Last Homework: ${dayjs(timeStamp).format('YYYY-MM-DD')}`;
    const timeAgo = calculateTimeAgo(timeStamp);
    return { description, timeAgo, timeStamp };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timeStamp: null };
  }
}

async function getLastUpdatedNotes(
  courseId: string
): Promise<{ description: string | null; timeAgo: string | null; timeStamp: string | null }> {
  try {
    const response = await axios.get('/api/get-coverage-timeline');
    const courseData = response?.data[courseId];
    if (courseData && courseData.length > 0) {
      const timeStamp = courseData[courseData.length - 1].timestamp_ms;
      const description = `Last Updated: ${dayjs(timeStamp).format('YYYY-MM-DD')}`;
      const timeAgo = calculateTimeAgo(timeStamp);
      return { description, timeAgo, timeStamp };
    }
    return { description: null, timeAgo: null, timeStamp: null };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timeStamp: null };
  }
}

async function getUngradedProblems(
  courseId: string
): Promise<{ description: string | null; timeAgo: string | null; timeStamp: string | null }> {
  try {
    const response = (await getCourseGradingItems(courseId)).gradingItems;
    const ungradedProblems = response.filter(
      (problem) => problem.numSubProblemsGraded !== problem.numSubProblemsAnswered
    );
    const description = `Ungraded Problems - ${ungradedProblems.length}`;
    return { description, timeAgo: null, timeStamp: null };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timeStamp: null };
  }
}

async function getLastUpdatedDescriptions({
  courseId,
  name,
  action,
}: {
  courseId: string;
  name: ResourceName;
  action: Action;
}): Promise<{ description: string | null; timeAgo: string | null; timeStamp: string | null }> {
  let description = null;
  let timeAgo = null;
  let timeStamp = null;

  switch (name) {
    case ResourceName.COURSE_NOTES:
      ({ description, timeAgo, timeStamp } = await getLastUpdatedNotes(courseId));
      break;
    case ResourceName.COURSE_HOMEWORK:
      if (action === Action.MUTATE) {
        ({ description, timeAgo, timeStamp } = await getLastUpdatedHomework(courseId));
      } else if (action === Action.INSTRUCTOR_GRADING) {
        ({ description, timeAgo, timeStamp } = await getUngradedProblems(courseId));
      }
      break;
    case ResourceName.COURSE_QUIZ:
      ({ description, timeAgo, timeStamp } = await getLastUpdatedQuiz(courseId));
      break;
    default:
      break;
  }

  return { description, timeAgo, timeStamp };
}

const groupByCourseId = (resources: CourseResourceAction[]) => {
  return resources.reduce((acc, resource) => {
    const { courseId } = resource;
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(resource);
    return acc;
  }, {} as Record<string, CourseResourceAction[]>);
};

const handleResourceClick = (router, resource: CourseResourceAction) => {
  const { courseId, name, action } = resource;

  let url = '';
  if (name === ResourceName.COURSE_NOTES) {
    url = `coverage-update?courseId=${courseId}`;
  } else if (name === ResourceName.COURSE_HOMEWORK && action === Action.INSTRUCTOR_GRADING) {
    url = `instructor-dash/${courseId}?tab=homework-grading`;
  } else if (name === ResourceName.COURSE_HOMEWORK && action === Action.MUTATE) {
    url = `instructor-dash/${courseId}?tab=homework-manager`;
  } else if (name === ResourceName.COURSE_QUIZ && action === Action.MUTATE) {
    url = `instructor-dash/${courseId}?tab=quiz-dashboard`;
  }
  if (url) {
    router.push(url);
  } else {
    console.warn('No matching URL for this resource');
  }
};

function InstructorDashBoard({
  resourcesForInstructor,
}: {
  resourcesForInstructor: CourseResourceAction[];
}) {
  const FilteredResourcesForInstructor = resourcesForInstructor.filter(
    (resource) => !excludedResources.includes(resource.name)
  );
  const [userInfo, setUserInfo] = useState(null);
  const [descriptions, setDescriptions] = useState<
    Record<string, { description: string | null; timeAgo: string | null; timeStamp: string | null }>
  >({});
  const router = useRouter();
  const groupedResources = useMemo(
    () => groupByCourseId(FilteredResourcesForInstructor),
    [resourcesForInstructor]
  );
  useEffect(() => {
    getUserInfo().then((user) => setUserInfo(user));
  }, []);

  useEffect(() => {
    const fetchDescriptions = async () => {
      const newDescriptions: Record<
        string,
        { description: string | null; timeAgo: string | null; timeStamp: string | null }
      > = {};
      for (const courseId of Object.keys(groupedResources)) {
        for (const resource of groupedResources[courseId]) {
          const { description, timeAgo, timeStamp } = await getLastUpdatedDescriptions(resource);
          newDescriptions[`${courseId}-${resource.name}-${resource.action}`] = {
            description,
            timeAgo,
            timeStamp,
          };
        }
      }
      setDescriptions(newDescriptions);
    };

    fetchDescriptions();
  }, [groupedResources]);

  return (
    <MainLayout title="Instructor Dashboard | ALeA">
      <Box sx={{ padding: 4 }}>
        <Typography
          sx={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}
        >
          Welcome, {userInfo?.fullName}
        </Typography>

        {Object.entries(groupedResources).map(([courseId, resources]) => (
          <Box key={courseId} sx={{ marginBottom: 4 }}>
            <Typography
              sx={{
                fontSize: '22px',
                fontWeight: 'bold',
                marginBottom: 2,
                backgroundColor: PRIMARY_COL,
                color: 'white',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              {courseId.toUpperCase()}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 5,
              }}
            >
              {resources.map((resource, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      border: '1px solid lightgray',
                      boxShadow: '0px 4px 6px gray',
                      borderRadius: '8px',
                      minHeight: '100px',
                      minWidth: '300px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0px 8px 12px gray',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleResourceClick(router, resource)}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ marginRight: 2, bgcolor: 'primary.main' }}>
                          {getResourceIcon(resource.name)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '18px', fontWeight: 'medium' }}>
                            {resource.name.replace('COURSE_', ' ').replace('_', ' ')}
                            {resource.action === Action.INSTRUCTOR_GRADING ? ' GRADING' : ' '}
                          </Typography>
                          <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                            {
                              descriptions[`${courseId}-${resource.name}-${resource.action}`]
                                ?.description
                            }
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: getTimeAgoColor(
                                descriptions[`${courseId}-${resource.name}-${resource.action}`]
                                  ?.timeStamp
                              ),
                            }}
                          >
                            {
                              descriptions[`${courseId}-${resource.name}-${resource.action}`]
                                ?.timeAgo
                            }
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
}

export default InstructorDashBoard;
