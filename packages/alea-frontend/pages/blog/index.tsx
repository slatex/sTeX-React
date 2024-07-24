import { Box, Button, Typography } from '@mui/material';
import {
  BlogPost,
  PostSnippet,
  UserInfo,
  getPostSnippets,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { MystViewer } from '@stex-react/myst';
import fs from 'fs';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
const BlogHomePage: NextPage = ({ postSnippets }: { postSnippets: PostSnippet[] }) => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [snippets, setSnippets] = useState<PostSnippet[]>(postSnippets);

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);
  useEffect(() => {
    async function fetchPost() {
      const data = await getPostSnippets();
      setSnippets(data);
    }
    if (router.isReady) fetchPost();
  }, [router.isReady]);
  return (
    <MainLayout>
      <Box mx="10px">
        <Box m="0 auto" maxWidth="800px">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Typography
              m="20px"
              variant="h3"
              fontFamily={'"Roboto", "Helvetica", "Arial", sans-serif'}
            >
              ALeA Blog
            </Typography>
            {isModerator(userInfo?.userId) && (
              <Button onClick={() => router.push('/blog/new')} variant="contained">
                create new blog
              </Button>
            )}
          </Box>
          {snippets.map((snippet) => (
            <Box
              key={snippet.postId}
              border="1px solid #CCC"
              p="20px"
              m="20px"
              onClick={() => router.push(`/blog/${snippet.postId}`)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0px 0px 10px #CCC',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)',
                },
              }}
            >
              <img src={snippet.heroImageUrl} alt="hero image" height="300px" width="100%" style={{objectFit: "cover", objectPosition: snippet.heroImagePosition}} />
              <MystViewer content={snippet.title} />
              <Box
                display="flex"
                flexDirection={'row'}
                justifyContent="space-between"
                alignItems="center"
                height="20px"
                width="100%"
              >
                <Typography fontSize={12} textAlign={'right'}>
                  {snippet.createdAt.split('T')[0]}
                </Typography>
                <Typography display="flex" alignItems="center">
                  Author: <MystViewer content={snippet.authorName} />
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

function convertToPostSnippets(blogData: BlogPost[]): PostSnippet[] {
  return blogData.map((snippet) => {
    return {
      postId: snippet.postId,
      title: snippet.title,
      authorName: snippet.authorName,
      createdAt: snippet.createdAt,
      heroImageUrl: snippet.heroImageUrl,
      heroImagePosition: snippet.heroImagePosition,
    };
  });
}

export async function getStaticProps() {
  const data = fs.readFileSync('../../static/blogData.json', 'utf8');
  const jsonData = JSON.parse(data);
  const postSnippets = convertToPostSnippets(jsonData);
  return {
    props: {
      postSnippets,
    },
  };
}
