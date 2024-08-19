import React, { useEffect, useState } from 'react';
import { List, Button, Typography, Box, Paper, Card, CardContent } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/router';
import axios from 'axios';
import { PRIMARY_COL } from '@stex-react/utils';

interface Node {
  title?: string;
  archive?: string;
  filepath?: string;
  id: string;
  children?: Node[];
}

interface ProblemListProps {
  data: Node;
  courseId: string;
}

interface ProblemCounts {
  [key: string]: number;
}

interface CardColor {
  background: string;
  text: string;
}

const removeHtmlTags = (html: string | undefined): string => {
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
  node: Node | undefined,
  level = 0,
  parentArchive: string | null = null,
  parentFilepath: string | null = null
): Array<{
  title: string;
  archive: string | null;
  filepath: string | null;
  id: string;
  level: number;
}> => {
  if (!node) return [];

  let result: Array<{
    title: string;
    archive: string | null;
    filepath: string | null;
    id: string;
    level: number;
  }> = [];
  const currentArchive = node.archive || parentArchive;
  const currentFilepath = node.filepath || parentFilepath;

  if (node.title || node.title === '') {
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

const ProblemList: React.FC<ProblemListProps> = ({ data, courseId }) => {
  const [problemCounts, setProblemCounts] = useState<ProblemCounts>({});
  const [showQuizPage, setShowQuizPage] = useState<boolean>(false);
  const [quizProps, setQuizProps] = useState<{
    archive?: string;
    filepath?: string;
    title?: string;
  }>({});

  const titlesAndMetadata = data ? extractTitlesAndMetadata(data) : [];
  const router = useRouter();

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

  const handleButtonClick = (archive: string, filepath: string, title: string) => {
    router.push({
      pathname: '/per-section-quiz',
      query: { archive, filepath, title, courseId },
    });
  };

  const cardColors: CardColor[] = [
    {
      background: 'linear-gradient(135deg, #d0e6f3 0%, #aab9d8 100%)',
      text: '#1f77b4',
    },
    {
      background: 'linear-gradient(135deg, #ffe0b2 0%, #ffb74d 100%)',
      text: '#e64a19',
    },
    {
      background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
      text: '#388e3c',
    },
    {
      background: 'linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%)',
      text: '#7b1fa2',
    },
    {
      background: 'linear-gradient(135deg, #f8bbd0 0%, #f48fb1 100%)',
      text: '#c2185b',
    },
  ];

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
        Practice
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
            if (item.level === 2) {
              const problemCount = problemCounts[item.id] || 0;
              const colorCombo = cardColors[index % cardColors.length];

              return (
                <Card
                  key={index}
                  sx={{
                    marginBottom: 2,
                    backgroundColor: colorCombo.background,
                    color: colorCombo.text,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        fontFamily: 'Times New Roman, Times, serif',
                        marginBottom: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    {problemCount >= 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: colorCombo.text,
                          marginBottom: 2,
                        }}
                      >
                        {problemCount} problems
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: colorCombo.text,
                        color: colorCombo.background,
                        borderRadius: '20px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: colorCombo.background,
                          color: colorCombo.text,
                        },
                      }}
                      onClick={() => handleButtonClick(item.archive, item.filepath, item.title)}
                    >
                      <LaunchIcon fontSize="small" sx={{ marginRight: '8px' }} />
                      Practice
                    </Button>
                  </CardContent>
                </Card>
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
