import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import GradingIcon from '@mui/icons-material/Grading';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import QuizIcon from '@mui/icons-material/Quiz';
import { Avatar, Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import {
  CommentType,
  getCourseGradingItems,
  getCourseInstanceThreads,
  getCourseQuizList,
  getCoverageTimeline,
  getHomeworkList,
  getUserInfo,
  QuestionStatus,
} from '@stex-react/api';
import {
  Action,
  CourseResourceAction,
  CURRENT_TERM,
  PRIMARY_COL,
  ResourceName,
} from '@stex-react/utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { BannerSection, VollKiInfoSection } from '../pages';
import Link from 'next/link';
import { getLocaleObject } from '../lang/utils';

interface ResourceDisplayInfo {
  description: string | null;
  timeAgo: string | null;
  timestamp: string | null;
  quizId?: string | null;
}

const EXCLUDED_RESOURCES = [ResourceName.COURSE_STUDY_BUDDY, ResourceName.COURSE_ACCESS];

const getResourceDisplayText = (name: ResourceName, action: Action, router) => {
  const { resource: r } = getLocaleObject(router);
  if (name === ResourceName.COURSE_COMMENTS && action === Action.MODERATE) {
    return r.forum;
  }
  if (name === ResourceName.COURSE_QUIZ && action === Action.PREVIEW) {
    return r.reviewLatestQuiz;
  }
  if (name === ResourceName.COURSE_QUIZ && action === Action.MUTATE) {
    return r.createUpdateQuiz;
  }
  if (name === ResourceName.COURSE_HOMEWORK && action === Action.INSTRUCTOR_GRADING) {
    return r.gradeHomework;
  }
  if (name === ResourceName.COURSE_HOMEWORK && action === Action.MUTATE) {
    return r.createUpdateHomework;
  }
  if (name === ResourceName.COURSE_NOTES && action === Action.MUTATE) {
    return r.updateGoTo;
  }
  return name.replace('COURSE_', ' ').replace('_', ' ');
};

function calculateTimeAgo(timestamp: string): string | null {
  if (!timestamp) return null;
  const dateTime = dayjs(parseInt(timestamp));
  return dateTime.isValid() ? dateTime.fromNow() : null;
}

const getTimeAgoColor = (timestamp: string | null): string => {
  if (!timestamp) return 'text.secondary';
  const targetDate = dayjs(parseInt(timestamp));
  if (!targetDate.isValid()) return 'text.secondary';
  const daysDifference = targetDate.diff(dayjs(), 'day');
  if (daysDifference >= 0) return 'darkgreen';
  if (daysDifference >= -2) return 'lightgreen';
  if (daysDifference >= -5) return 'orange';
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

async function getCommentsInfo(courseId: string) {
  const comments = await getCourseInstanceThreads(courseId, CURRENT_TERM);
  const questions = comments.filter((comment) => comment.commentType === CommentType.QUESTION);
  const unanswered = questions.filter(
    (comment) => comment.questionStatus === QuestionStatus.UNANSWERED
  ).length;
  return {
    description: `Unanswered Questions - ${unanswered}/${questions.length}  `,
    timeAgo: null,
    timestamp: null,
  };
}

async function getLastUpdatedQuiz(courseId: string): Promise<ResourceDisplayInfo> {
  try {
    const quizList = await getCourseQuizList(courseId);
    const latestQuiz = quizList.reduce((acc, curr) => {
      return acc.quizStartTs > curr.quizStartTs ? acc : curr;
    }, quizList[0]);
    const timestamp = latestQuiz.quizStartTs;
    const description = `Latest Quiz: ${dayjs(timestamp).format('YYYY-MM-DD')}`;
    const timeAgo = calculateTimeAgo(timestamp.toString());
    return { description, timeAgo, timestamp: timestamp.toString(), quizId: latestQuiz.quizId };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timestamp: null };
  }
}

async function getLastUpdatedHomework(courseId: string): Promise<ResourceDisplayInfo> {
  try {
    const homeworkList = await getHomeworkList(courseId);
    if (homeworkList.length === 0) {
      return { description: 'No homework available', timeAgo: null, timestamp: null };
    }
    const timestamp = homeworkList.reduce((acc, curr) => {
      return acc > dayjs(curr.givenTs).valueOf() ? acc : dayjs(curr.givenTs).valueOf();
    }, dayjs(homeworkList[0].givenTs).valueOf());
    const description = `Latest Homework: ${dayjs(timestamp).format('YYYY-MM-DD')}`;
    const timeAgo = calculateTimeAgo(timestamp.toString());
    return { description, timeAgo, timestamp: timestamp.toString() };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timestamp: null };
  }
}

async function getLastUpdatedNotes(courseId: string): Promise<ResourceDisplayInfo> {
  try {
    const coverageData = await getCoverageTimeline();
    const courseData = coverageData[courseId];
    if (courseData && courseData.length > 0) {
      const timestamp = coverageData[courseId].reduce((acc, curr) => {
        return acc > curr.timestamp_ms ? acc : curr.timestamp_ms;
      }, coverageData[courseId][0].timestamp);
      const description = `Last Updated: ${dayjs(timestamp).format('YYYY-MM-DD')}`;
      const timeAgo = calculateTimeAgo(timestamp);
      return { description, timeAgo, timestamp };
    }
    return { description: null, timeAgo: null, timestamp: null };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timestamp: null };
  }
}

async function getUngradedProblems(courseId: string): Promise<ResourceDisplayInfo> {
  try {
    const response = (await getCourseGradingItems(courseId)).gradingItems;
    const ungradedProblems = response.filter(
      (problem) => problem.numSubProblemsGraded !== problem.numSubProblemsAnswered
    );
    const description = `Ungraded Problems - ${ungradedProblems.length}/${response.length}`;
    return { description, timeAgo: null, timestamp: null };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { description: null, timeAgo: null, timestamp: null };
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
}): Promise<ResourceDisplayInfo> {
  let description = null;
  let timeAgo = null;
  let timestamp = null;
  let quizId = null;

  switch (name) {
    case ResourceName.COURSE_NOTES:
      ({ description, timeAgo, timestamp } = await getLastUpdatedNotes(courseId));
      break;
    case ResourceName.COURSE_HOMEWORK:
      if (action === Action.MUTATE) {
        ({ description, timeAgo, timestamp } = await getLastUpdatedHomework(courseId));
      } else if (action === Action.INSTRUCTOR_GRADING) {
        ({ description, timeAgo, timestamp: timestamp } = await getUngradedProblems(courseId));
      }
      break;
    case ResourceName.COURSE_QUIZ:
      ({ description, timeAgo, timestamp, quizId } = await getLastUpdatedQuiz(courseId));
      if (action === Action.PREVIEW) {
        description = `Start Date: ${dayjs(parseInt(timestamp)).format('YYYY-MM-DD HH:mm:ss')}`;
      }
      break;
    case ResourceName.COURSE_COMMENTS:
      ({ description, timeAgo, timestamp } = await getCommentsInfo(courseId));
      break;
    default:
      break;
  }

  return { description, timeAgo, timestamp, quizId };
}

const groupByCourseId = (resources: CourseResourceAction[]) => {
  resources = resources.filter((resource) => !EXCLUDED_RESOURCES.includes(resource.name));
  return resources.reduce((acc, resource) => {
    const { courseId } = resource;
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(resource);
    return acc;
  }, {} as Record<string, CourseResourceAction[]>);
};

const handleResourceClick = (router, resource: CourseResourceAction, quizId: string) => {
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
  } else if (name === ResourceName.COURSE_QUIZ && action === Action.PREVIEW) {
    url = `quiz/${quizId}`;
  } else if (name === ResourceName.COURSE_COMMENTS && action === Action.MODERATE) {
    url = `forum/${courseId}`;
  }
  if (url) {
    router.push(url);
  } else {
    console.warn('No matching URL for this resource');
  }
};

function ResourceCard({
  resource,
  key,
  descriptions,
  courseId,
}: {
  resource: CourseResourceAction;
  key: number;
  descriptions: Record<string, ResourceDisplayInfo>;
  courseId: string;
}) {
  const router = useRouter();
  const quizId = descriptions[`${courseId}-${resource.name}-${resource.action}`]?.quizId;
  return (
    <Box key={key}>
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
        <CardActionArea onClick={() => handleResourceClick(router, resource, quizId)}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ marginRight: 2, bgcolor: 'primary.main' }}>
              {getResourceIcon(resource.name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 'medium' }}>
                {getResourceDisplayText(resource.name, resource.action, router)}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                {descriptions[`${courseId}-${resource.name}-${resource.action}`]?.description}
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: getTimeAgoColor(
                    descriptions[`${courseId}-${resource.name}-${resource.action}`]?.timestamp
                  ),
                }}
              >
                {descriptions[`${courseId}-${resource.name}-${resource.action}`]?.timeAgo}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}

function InstructorDashBoard({
  resourcesForInstructor,
}: {
  resourcesForInstructor: CourseResourceAction[];
}) {
  const [userInfo, setUserInfo] = useState(null);
  const [descriptions, setDescriptions] = useState<Record<string, ResourceDisplayInfo>>({});
  const router = useRouter();
  const { resource: r } = getLocaleObject(router);
  const groupedResources = useMemo(
    () => groupByCourseId(resourcesForInstructor),
    [resourcesForInstructor]
  );
  useEffect(() => {
    getUserInfo().then((user) => setUserInfo(user));
  }, []);

  useEffect(() => {
    const fetchDescriptions = async () => {
      const fetchPromises: Promise<void>[] = [];
      const newDescriptions: Record<string, ResourceDisplayInfo> = {};
      for (const courseId of Object.keys(groupedResources)) {
        for (const resource of groupedResources[courseId]) {
          const promise = getLastUpdatedDescriptions(resource).then(
            ({ description, timeAgo, timestamp, quizId }) => {
              newDescriptions[`${courseId}-${resource.name}-${resource.action}`] = {
                description,
                timeAgo,
                timestamp,
                quizId,
              };
            }
          );
          fetchPromises.push(promise);
        }
      }

      await Promise.all(fetchPromises);
      setDescriptions(newDescriptions);
    };

    fetchDescriptions();
  }, [groupedResources]);

  return (
    <MainLayout title="Instructor Dashboard | ALeA">
      <BannerSection tight={true} />
      <Box sx={{ px: 4, pt: 4, pb: 8, bgcolor: '#F5F5F5' }}>
        <Typography
          sx={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}
        >
          {r.welcome}, {userInfo?.fullName}
        </Typography>

        {Object.entries(groupedResources).map(([courseId, resources]) => (
          <Box key={courseId} sx={{ marginBottom: 4 }}>
            <Link href={`/course-home/${courseId}`}>
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
            </Link>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 5,
                maxWidth: '1400px',
                margin: '0 auto',
              }}
            >
              {resources.map((resource, index) => (
                <ResourceCard
                  resource={resource}
                  key={index}
                  descriptions={descriptions}
                  courseId={courseId}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <VollKiInfoSection bgcolor="white" />
    </MainLayout>
  );
}

export default InstructorDashBoard;
