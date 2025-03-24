import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { SectionsAPIData } from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL } from '@stex-react/utils';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';

interface TitleMetadata {
  title: string;
  archive?: string;
  filepath?: string;
  id: string;
  level: number;
}

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return scrollPosition;
}

const extractTitlesAndMetadata = (
  node: SectionsAPIData | null,
  level = 0,
  parentArchive: string | null = null,
  parentFilepath: string | null = null
): TitleMetadata[] => {
  if (!node) return [];

  let result: TitleMetadata[] = [];
  const currentArchive = node.archive || parentArchive;
  const currentFilepath = node.filepath || parentFilepath;

  if (node.title === '' || node.title) {
    result.push({
      title: node.title,
      archive: currentArchive,
      filepath: currentFilepath,
      id: node.id,
      level: level,
    });
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      result = result.concat(
        extractTitlesAndMetadata(child, level + 1, currentArchive, currentFilepath)
      );
    });
  }

  return result;
};

interface ProblemListProps {
  courseSections: SectionsAPIData;
  courseId: string;
}
const ProblemList: FC<ProblemListProps> = ({ courseSections, courseId }) => {
  const [problemCounts, setProblemCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  const { practiceProblems: t, peerGrading: g } = getLocaleObject(router);
  const scrollPosition = useScrollPosition();
  const [showSubsections, setShowSubsections] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    axios
      .get(`/api/get-course-problem-counts/${courseId}`)
      .then((resp) => {
        setProblemCounts(resp.data);
      })
      .catch((error) => {
        console.error('Error fetching problem counts:', error);
      });
  }, [courseId]);

  const handleButtonClick = (
    archive?: string,
    filepath?: string,
    title?: string,
    courseId?: string
  ) => {
    sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    router.push({
      pathname: '/per-section-quiz',
      query: { archive, filepath, title, courseId },
    });
  };

  const handleLinkClick = () => {
    sessionStorage.setItem('scrollPosition', scrollPosition.toString());
  };
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
      sessionStorage.removeItem('scrollPosition');
    }
  }, [router.asPath]);

  const titlesAndMetadata = courseSections ? extractTitlesAndMetadata(courseSections) : [];

  return (
    <Box maxWidth="800px" px={{ xs: 1, sm: 2 }} m="0 auto">
      <Typography variant="h4" my={3} textAlign="center">
        {t.practiceProblems}
      </Typography>
      <Typography variant="body1" my={3}>
        {t.practiceProblemsDescription}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showSubsections}
              onChange={() => setShowSubsections(!showSubsections)}
            />
          }
          label="Show subsections"
        />
        <Box sx={{marginLeft:'auto'}} >
        <Link  href={`/peer-grading/${courseId}`}>
          <Button variant="contained" sx={{  height: '48px', fontSize: '16px' }}>
            {g.peerGrading}
          </Button>
        </Link>
        </Box>
      </Box>
      <Paper
        sx={{
          p: { xs: 1, sm: 3 },
          borderRadius: 2,
          boxShadow: 3,
          overflowY: 'auto',
          textAlign: 'left',
          backgroundColor: '#ffffff',
          borderLeft: `3px solid ${PRIMARY_COL}`,
        }}
      >
        <List>
          {titlesAndMetadata.map((item, index) => {
            if (item.level !== 2 && item.level !== 4 && !(item.level === 6 && showSubsections))
              return null;
            const isChapter = item.level === 2;
            const isSubSection = item.level === 6;
            const problemCount = problemCounts[item.id] || 0;
            const isEnabled = problemCount > 0;
            const isBold = isChapter;
            const fontWeight = isBold ? 'bold' : 'normal';
            const backgroundColor = '#f0f4f8';
            const borderRadius = '8px';
            const fontStyle = isSubSection ? 'italic' : 'normal';
            const fontSize = isChapter ? '1.125rem' : isSubSection ? '0.875rem' : '1rem';
            const compress = isSubSection && problemCount === 0;

            return (
              <ListItem
                key={index}
                sx={{
                  paddingLeft: `${item.level * 10}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor,
                  borderRadius,
                  my: compress ? 0 : 0.5,
                  py: compress ? 0 : 1,
                  cursor: isEnabled ? 'pointer' : undefined,
                  transition: 'background-color 0.3s ease, transform 0.2s ease',
                  '&:hover': isEnabled && {
                    background: 'linear-gradient(90deg, #e0f7fa 0%, #d1c4e9 100%)',
                    color: 'white',
                    transform: 'scale(1.02)',
                    '& .MuiButton-root': {
                      backgroundColor: 'white',
                      color: PRIMARY_COL,
                      borderColor: 'white',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <>
                      <Typography
                        variant="h6"
                        component="div"
                        color="primary"
                        sx={{
                          fontWeight,
                          fontStyle,
                          fontSize,
                          '& > *': { textAlign: 'left !important' },
                        }}
                      >
                        {item.title ? (
                          <>
                            <Link
                              href={`/course-notes/${courseId}?inDocPath=~${item.id}`}
                              rel="noopener noreferrer"
                              onClick={() => handleLinkClick()}
                            >
                              {mmtHTMLToReact(item.title)}
                            </Link>
                          </>
                        ) : (
                          'Untitled'
                        )}
                        {compress && ' (None)'}
                      </Typography>
                      {!compress && (
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{
                            color: 'grey',
                            fontSize,
                            marginTop: '4px',
                            fontWeight: 300,
                          }}
                        >
                          {problemCount} {t.problems}
                        </Typography>
                      )}
                    </>
                  }
                />
                {isEnabled && (
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: '127px',
                      borderRadius: '20px',
                      textTransform: 'none',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.3s ease, transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                    onClick={() => {
                      if (!isEnabled) return;
                      handleButtonClick(item.archive, item.filepath, item.title, courseId);
                    }}
                  >
                    {t.practice}&nbsp;
                  </Button>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default ProblemList;
