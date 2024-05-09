import { Box, Typography } from '@mui/material';
import { PostSnippet, getPostSnippets } from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const BlogHomePage: NextPage = () => {
  const router = useRouter();
  const [postSnippets, setPostSnippets] = useState<PostSnippet[]>([]);
  useEffect(() => {
    getPostSnippets().then(setPostSnippets);
  }, []);

  return (
    <MainLayout>
      <Box mx="10px">
        <Box m="0 auto" maxWidth="800px">
          <Typography
            m="20px"
            variant="h3"
            fontFamily={'"Roboto", "Helvetica", "Arial", sans-serif'}
          >
            ALᴇA Blog
          </Typography>
          {postSnippets.map((snippet) => (
            <Box
              key={snippet.postId}
              border="1px solid #CCC"
              p="10px"
              m="20px"
              onClick={() => router.push(`/blog/${snippet.postId}`)}
              sx={{
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0px 0px 10px #CCC',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)',
                },
                backgroundImage: 'radial-gradient(white,lightgray)',
              }}
            >
              <MdViewer content={snippet.title} />
              <MdViewer content={snippet.bodySnippet.concat('...')} />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                height="20px"
              >
                <Typography fontSize={12} textAlign={'right'}>
                  {snippet.createdAt.split('T')[0]}
                </Typography>
                <Typography display="flex" alignItems="center">
                  Author:&nbsp;<MdViewer content={snippet.authorName} />
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default BlogHomePage;
