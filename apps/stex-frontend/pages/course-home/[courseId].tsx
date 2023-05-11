import ArticleIcon from '@mui/icons-material/Article';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { Box, Button, Link } from '@mui/material';
import { COURSES_INFO } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import Image from 'next/image';
import { RecordedSyllabus } from '../../components/RecordedSyllabus';

function CourseComponentLink({
  href,
  children,
}: {
  href: string;
  children: any;
}) {
  return (
    <Link href={href} flexGrow={1}>
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
const CourseHomePage: NextPage = () => {
  const router = useRouter();
  if (!router.isReady) return <></>;
  const courseId = router.query.courseId as string;
  const courseInfo = COURSES_INFO[courseId];
  if (!courseInfo) return <>Course Not found</>;
  const { courseName, imageLink, notesLink, slidesLink, cardsLink } =
    courseInfo;
  const allowCrop = ['ai-1', 'ai-2', 'lbs'].includes(courseId);

  const { home } = getLocaleObject(router);
  const t = home.courseThumb;
  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + ' Course Home | VoLL-KI'}
    >
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          maxHeight: '200px',
          overflow: 'hidden',
          borderBottom: '2px solid #DDD',
          backgroundImage: BG_COLORS[courseId],
        }}
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
      </div>

      <Box maxWidth="900px" m="auto" px="10px" display="flex" flexDirection="column">
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '32px',
            textAlign: 'center',
            margin: '20px 0 32px',
          }}
        >
          {courseName}
        </span>
        <Box display="flex" width="100%" gap="10px" flexWrap="wrap">
          <CourseComponentLink href={notesLink}>
            {t.notes}&nbsp;
            <ArticleIcon fontSize="large" />
          </CourseComponentLink>
          {slidesLink && (
            <CourseComponentLink href={slidesLink}>
              {t.slides}&nbsp;
              <SlideshowIcon fontSize="large" />
            </CourseComponentLink>
          )}
          <CourseComponentLink href={cardsLink}>
            {t.cards}&nbsp;{' '}
            <Image
              src="/noun-flash-cards-2494102.svg"
              width={35}
              height={35}
              alt=""
            />
          </CourseComponentLink>
        </Box>
        <RecordedSyllabus courseId={courseId} />
      </Box>
    </MainLayout>
  );
};
export default CourseHomePage;