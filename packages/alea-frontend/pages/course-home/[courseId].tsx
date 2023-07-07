import ArticleIcon from '@mui/icons-material/Article';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button } from '@mui/material';
import {
  BG_COLOR,
  CourseInfo,
  Window,
  XhtmlContentUrl,
} from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RecordedSyllabus } from '../../components/RecordedSyllabus';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import {
  ContentFromUrl,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { use, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getCourseInfo } from '@stex-react/api';

function CourseComponentLink({
  href,
  children,
}: {
  href: string;
  children: any;
}) {
  return (
    <Link href={href} style={{ flexGrow: 1 }}>
      <Button
        variant="contained"
        sx={{ width: '100%', height: '48px', fontSize: '16px' }}
      >
        {children}
      </Button>
    </Link>
  );
}

const BG_COLORS = {
  'iwgs-1': 'linear-gradient(to right, #00010e, #060844)',
  'iwgs-2': 'linear-gradient(to right, #f3f7dc, #8f9868)',
  krmt: 'linear-gradient(to right, #e8e9bf, #f5f5b7)',
};

export function CourseHeader({ courseId }: { courseId: string }) {
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  const courseInfo = courses[courseId];
  if (!courseInfo) return <></>;
  const { courseName, imageLink } = courseInfo;
  const allowCrop = ['ai-1', 'ai-2', 'lbs'].includes(courseId);
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

      <Box m="20px 0 32px">
        <span style={{ fontWeight: 'bold', fontSize: '32px' }}>
          {courseName}
        </span>
      </Box>
    </Box>
  );
}

const CourseHomePage: NextPage = () => {
  const router = useRouter();
  const [docWidth, setDocWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    if (!router.isReady) return;
    function handleResize() {
      const outerWidth = containerRef?.current?.clientWidth;
      if (!outerWidth) return;
      setDocWidth(outerWidth);
    }
    handleResize();
    Window?.addEventListener('resize', handleResize);
    return () => Window?.removeEventListener('resize', handleResize);
  }, [router.isReady]);

  if (!router.isReady) return <></>;
  const courseId = router.query.courseId as string;
  const courseInfo = courses[courseId];
  if (!courseInfo) return <>Course Not found</>;
  const { notesLink, slidesLink, cardsLink, forumLink } = courseInfo;

  const locale = router.locale || 'en';
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ' Course Home | VoLL-KI'}
      bgColor={BG_COLOR}
    >
      <CourseHeader courseId={courseId} />
      <Box
        maxWidth="900px"
        m="auto"
        px="10px"
        display="flex"
        flexDirection="column"
      >
        <Box
          display="flex"
          width="100%"
          gap="10px"
          flexWrap="wrap"
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
            <Image
              src="/noun-flash-cards-2494102.svg"
              width={35}
              height={35}
              alt=""
            />
          </CourseComponentLink>
          <CourseComponentLink href={forumLink}>
            {t.forum}&nbsp;
            <QuestionAnswerIcon fontSize="large" />
          </CourseComponentLink>
        </Box>
        <Box {...({ style: { '--document-width': `${docWidth}px` } } as any)}>
          <ContentFromUrl
            url={XhtmlContentUrl(
              courseInfo.notesArchive,
              `${courseInfo.landingFilepath}.${locale}.xhtml`
            )}
            skipSidebar={true}
          />
        </Box>
        <br />
        <br />
        <b style={{ fontSize: '24px', textAlign: 'center' }}>
          {t.recordedSyllabus}
        </b>
        <RecordedSyllabus courseId={courseId} />
      </Box>
    </MainLayout>
  );
};
export default CourseHomePage;
