import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/router';
import axios from 'axios';

interface ProblemData {
  title: string;
  archive: string;
  filepath: string;
  id: number;
  level: number;
}

interface ProblemListProps {
  data: any;
  courseId: string;
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
  node: any,
  level = 0,
  parentArchive: string | null = null,
  parentFilepath: string | null = null
): ProblemData[] => {
  if (!node) return [];

  let result: ProblemData[] = [];
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
    node.children.forEach((child: any) => {
      result = result.concat(
        extractTitlesAndMetadata(child, level + 1, currentArchive, currentFilepath)
      );
    });
  }

  return result;
};

const ProblemList: React.FC<ProblemListProps> = ({ data, courseId }) => {
  const [problemCounts, setProblemCounts] = useState<Record<number, number>>({});
  const router = useRouter();

  const titlesAndMetadata = data ? extractTitlesAndMetadata(data) : [];

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        backgroundColor: '#e3f2fd',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: '#1e3a8a',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        Practice
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
          width: '100%',
          maxWidth: 1200,
        }}
      >
        {titlesAndMetadata.map((item, index) => {
          if (item.level === 2) {
            const problemCount = problemCounts[item.id] || 0;
            return (
              <Card
                key={index}
                sx={{
                  backgroundColor: '#bbdefb',
                  color: '#0d47a1',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 30px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.25rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0d47a1', fontWeight: 500 }}>
                    {problemCount} problems
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: '#1e88e5',
                      color: 'white',
                      borderRadius: '20px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#1565c0',
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
      </Box>
    </Box>
  );
};

export default ProblemList;
