import React, { useEffect, useState, FC } from 'react';
import { List, ListItem, ListItemText, Button, Typography, Box, Paper } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/router';
import axios from 'axios';
import { PRIMARY_COL } from '@stex-react/utils';
import { getLocaleObject } from '../lang/utils';

interface Node {
  title: string;
  archive?: string;
  filepath?: string;
  id: string;
  level: number;
  children?: Node[];
}

interface ProblemListProps {
  data: Node | null;
  courseId: string;
}

interface TitleMetadata {
  title: string;
  archive?: string;
  filepath?: string;
  id: string;
  level: number;
}

const removeHtmlTags = (html: string): string => {
  if (!html || html.trim() === '') {
    return 'Untitled';
  }

  if (/^<[^>]+>$/.test(html.trim())) {
    return 'Untitled';
  }

  if (!/<[^>]+>/.test(html)) {
    return html.trim();
  }

  return html.replace(/<\/?[^>]+>/gi, '').trim();
};

const extractTitlesAndMetadata = (
  node: Node | null,
  level = 0,
  parentArchive: string | null = null,
  parentFilepath: string | null = null
): TitleMetadata[] => {
  if (!node) return [];

  let result: TitleMetadata[] = [];
  const currentArchive = node.archive || parentArchive;
  const currentFilepath = node.filepath || parentFilepath;

  if (node.title === '' || node.title) {
    const cleanTitle = removeHtmlTags(node.title);
    result.push({
      title: cleanTitle,
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

const ProblemList: FC<ProblemListProps> = ({ data, courseId }) => {
  const [problemCounts, setProblemCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  const { home } = getLocaleObject(router);
  const t = home.courseThumb;

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
    router.push({
      pathname: '/per-section-quiz',
      query: { archive, filepath, title, courseId },
    });
  };

  const titlesAndMetadata = data ? extractTitlesAndMetadata(data) : [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 2,
        position: 'relative',
        backgroundColor: '#f0f4f8',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 3,
          textAlign: 'center',
          color: '#2b3f5c',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        {t.practice}&nbsp;
      </Typography>
      <Paper
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          width: '100%',
          maxWidth: 800,
          maxHeight: '80vh',
          overflowY: 'auto',
          textAlign: 'left',
          backgroundColor: '#ffffff',
          borderLeft: `5px solid ${PRIMARY_COL}`,
        }}
      >
        <List>
          {titlesAndMetadata.map((item, index) => {
            const problemCount = problemCounts[item.id] || 0;
            const isBold = item.level === 2;
            const fontWeight = isBold ? 'bold' : 'normal';
            const backgroundColor = item.level % 2 === 0 ? '#f0f4f8' : 'blue';
            const borderRadius = item.level % 2 === 0 ? '8px' : '0px';
            const fontFamily =
              item.level === 2 ? 'Times New Roman, Times, serif' : 'Roboto, sans-serif';

            if (item.level === 2 || item.level === 4) {
              return (
                <ListItem
                  key={index}
                  sx={{
                    paddingLeft: `${item.level * 20}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor,
                    borderRadius,
                    marginBottom: 1,
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    '&:hover': {
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
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{
                              fontWeight,
                              fontFamily,
                              color: '#3910b3',
                            }}
                          >
                            {item.title}
                          </Typography>
                          {problemCount >= 0 && (
                            <Typography
                              component="div"
                              variant="body2"
                              sx={{
                                color: 'grey',
                                fontSize: '0.9rem',
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
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      fontSize: '0.875rem',
                      minWidth: '127px',
                      backgroundColor: PRIMARY_COL,
                      color: 'white',
                      borderRadius: '20px',
                      textTransform: 'none',
                      padding: '6px 16px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.3s ease, transform 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: PRIMARY_COL,
                        transform: 'scale(1.05)',
                      },
                    }}
                    onClick={() =>
                      handleButtonClick(item.archive, item.filepath, item.title, courseId)
                    }
                  >
                    <LaunchIcon fontSize="small" sx={{ marginRight: '8px' }} />
                    {t.practice}&nbsp;
                  </Button>
                </ListItem>
              );
            }
            return null;
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default ProblemList;
