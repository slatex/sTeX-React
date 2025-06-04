import ArticleIcon from '@mui/icons-material/Article';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import {
  addRemoveMember,
  canAccessResource,
  getCourseInfo,
  getUserInfo,
  UserInfo,
} from '@stex-react/api';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  Action,
  BG_COLOR,
  CourseInfo,
  CURRENT_TERM,
  INSTRUCTOR_RESOURCE_AND_ACTION,
  isFauId,
  ResourceName,
} from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RecordedSyllabus } from 'packages/alea-frontend/components/RecordedSyllabus';
import { useEffect, useRef, useState } from 'react';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import { FTMLDocument } from '@kwarc/ftml-react';

export function getCourseEnrollmentAcl(courseId: string, instanceId: string) {
  return `${courseId}-${instanceId}-enrollments`;
}
export async function handleEnrollment(userId: string, courseId: string, currentTerm: string) {
  if (!userId || !isFauId(userId)) {
    alert('Please Login Using FAU Id.');
    return false;
  }

  try {
    await addRemoveMember({
      memberId: userId,
      aclId: getCourseEnrollmentAcl(courseId, currentTerm),
      isAclMember: false,
      toBeAdded: true,
    });
    alert('Enrollment successful!');
    return true;
  } catch (error) {
    console.error('Error during enrollment:', error);
    alert('Enrollment failed. Please try again.');
    return false;
  }
}

function CourseComponentLink({ href, children, sx }: { href: string; children: any; sx?: any }) {
  return (
    <Link href={href}>
      <Button variant="contained" sx={{ width: '100%', height: '48px', fontSize: '16px', ...sx }}>
        {children}
      </Button>
    </Link>
  );
}

const BG_COLORS = {
  'iwgs-1': 'linear-gradient(to right, #00010e, #060844)',
  'iwgs-2': 'radial-gradient(circle, #5b6956, #8f9868)',
  krmt: 'radial-gradient(circle, white, #f5f5b7)',
  gdp: 'radial-gradient(circle, #4bffd7, #a11cff)',
  rip: 'radial-gradient(circle, #fcef6e, #3f2e86)',
  spinf: 'radial-gradient(circle, #b2bbc0, #184e6d)',
};

export function CourseHeader({
  courseId,
  courseName,
  imageLink,
}: {
  courseId: string;
  courseName: string;
  imageLink?: string;
}) {
  if (!courseName || !courseId) return <></>;
  if (!imageLink) {
    return (
      <Box m="20px" textAlign="center" fontWeight="bold" fontSize="32px">
        {courseName}
      </Box>
    );
  }
  const allowCrop = ['ai-1', 'ai-2', 'lbs', 'smai'].includes(courseId);
  return (
    <Box textAlign="center">
      <Link href={`/course-home/${courseId}`}>
        <Box
          display="flex"
          position="relative"
          width="100%"
          maxHeight="200px"
          overflow="hidden"
          borderBottom="2px solid #DDD"
          sx={{ backgroundImage: BG_COLORS[courseId] }}
        >
          {allowCrop ? (
            <img
              src={imageLink}
              alt={courseName}
              style={{
                objectFit: 'cover',
                width: '100%',
                aspectRatio: '16/9',
              }}
            />
          ) : (
            <img
              src={imageLink}
              alt={courseName}
              style={{
                objectFit: 'contain',
                maxHeight: '200px',
                margin: 'auto',
              }}
            />
          )}
        </Box>
      </Link>
      <Box m="20px 0 32px" fontWeight="bold" fontSize="32px">
        {courseName}
      </Box>
    </Box>
  );
}

const CourseHomePage: NextPage = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const courseId = router.query.courseId as string;
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [enrolled, setIsEnrolled] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getUserInfo().then((userInfo: UserInfo) => {
      setUserId(userInfo?.userId);
    });
  }, []);

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    const checkAccess = async () => {
      const hasAccess = await canAccessResource(ResourceName.COURSE_QUIZ, Action.TAKE, {
        courseId,
        instanceId: CURRENT_TERM,
      });
      setIsEnrolled(hasAccess);
    };
    checkAccess();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    async function checkAccess() {
      for (const { resource, action } of INSTRUCTOR_RESOURCE_AND_ACTION) {
        const hasAccess = await canAccessResource(resource, action, {
          courseId,
          instanceId: CURRENT_TERM,
        });
        if (hasAccess) {
          setIsInstructor(true);
          return;
        }
      }
    }
    checkAccess();
  }, [courseId]);

  if (!router.isReady || !courses) return <CircularProgress />;
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    router.replace('/');
    return <>Course Not Found!</>;
  }

  const { notesLink, slidesLink, cardsLink, forumLink, quizzesLink, hasQuiz, notes, landing } =
    courseInfo;

  const locale = router.locale || 'en';
  const { home, courseHome: tCourseHome, quiz: q } = getLocaleObject(router);
  const t = home.courseThumb;

  const showSearchBar = ['ai-1', 'ai-2', 'iwgs-1', 'iwgs-2'].includes(courseId);
  function handleSearch() {
    if (!searchQuery) return;
    router.push(`/search/${courseId}?query=${encodeURIComponent(searchQuery)}`);
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const enrollInCourse = async () => {
    if (!userId || !courseId) {
      return router.push('/login');
    }
    const enrollmentSuccess = await handleEnrollment(userId, courseId, CURRENT_TERM);
    setIsEnrolled(enrollmentSuccess);
  };

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ` ${tCourseHome.title} | ALeA`}
      bgColor={BG_COLOR}
    >
      <CourseHeader
        courseName={courseInfo.courseName}
        imageLink={courseInfo.imageLink}
        courseId={courseId}
      />

      <Box maxWidth="900px" m="auto" px="10px" display="flex" flexDirection="column">
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill,minmax(185px, 1fr))"
          gap="10px"
          ref={containerRef}
        >
          <CourseComponentLink href={notesLink}>
            {t.notes}&nbsp;
            <ArticleIcon fontSize="large" />
          </CourseComponentLink>
          <CourseComponentLink href={slidesLink}>
            {t.slides}&nbsp;
            <SlideshowIcon fontSize="large" />
          </CourseComponentLink>
          <CourseComponentLink href={cardsLink}>
            {t.cards}&nbsp;{' '}
            <Image src="/noun-flash-cards-2494102.svg" width={35} height={35} alt="" />
          </CourseComponentLink>
          <CourseComponentLink href={forumLink}>
            {t.forum}&nbsp;
            <QuestionAnswerIcon fontSize="large" />
          </CourseComponentLink>
          {hasQuiz && (
            <CourseComponentLink href={quizzesLink}>
              {t.quizzes}&nbsp;
              <QuizIcon fontSize="large" />
            </CourseComponentLink>
          )}
          {['lbs', 'ai-1', 'smai'].includes(courseId) && (
            <CourseComponentLink href={`/homework/${courseId}`}>
              {t.homeworks}&nbsp;
              <AssignmentTurnedInIcon fontSize="large" />
            </CourseComponentLink>
          )}
          <CourseComponentLink href={`/study-buddy/${courseId}`}>
            {t.studyBuddy}&nbsp;
            <Diversity3Icon fontSize="large" />
          </CourseComponentLink>
          <CourseComponentLink href={`/practice-problems/${courseId}`}>
            {<p>{t.practiceProblems}</p>}&nbsp;
            <Image src="/practice_problems.svg" width={35} height={35} alt="" />
          </CourseComponentLink>
          {isInstructor && (
            <CourseComponentLink
              href={`/instructor-dash/${courseId}`}
              sx={{ backgroundColor: '#4565af' }}
            >
              {<p>{t.instructorDashBoard}</p>}&nbsp;
              <PersonIcon fontSize="large" />
            </CourseComponentLink>
          )}
        </Box>
        {enrolled === false && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              marginTop: '10px',
            }}
          >
            <Button
              onClick={enrollInCourse}
              variant="contained"
              sx={{
                backgroundColor: 'green',
                width: 'max-content',
                alignSelf: 'center',
                marginBottom: '10px',
              }}
            >
              {q.getEnrolled}
              <SchoolIcon />
            </Button>
            <Alert severity="info" sx={{ display: 'flex', justifyContent: 'center' }}>
              {q.enrollmentMessage}
            </Alert>
          </Box>
        )}
        {showSearchBar && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '10px',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search in notes..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton>
                      <SearchIcon onClick={() => handleSearch()} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: '30px',
                mt: '10px',
              }}
              onKeyDown={handleKeyDown}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
        )}
        <FTMLDocument document={{ type: 'FromBackend', uri: landing, toc: undefined }} />
        <RecordedSyllabus courseId={courseId} />
      </Box>
    </MainLayout>
  );
};
export default CourseHomePage;
