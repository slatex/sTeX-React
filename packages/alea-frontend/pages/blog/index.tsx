import { Box, Button, Typography } from '@mui/material';
import {
  BlogPost,
  PostSnippet,
  UserInfo,
  getPostSnippets,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import fs from 'fs';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
const BlogHomePage: NextPage = ({
  postSnippets,
}: {
  postSnippets: PostSnippet[];
}) => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [snippets, setSnippets] = useState<PostSnippet[]>(postSnippets);
  useEffect(() => {
    getUserInfo().then(setUserInfo);
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
              <Button
                onClick={() => router.push('/blog/new')}
                variant="contained"
              >
                create new blog
              </Button>
            )}
          </Box>
          {snippets.map((snippet) => (
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
                  Author: <MdViewer content={snippet.authorName} />
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

function getPostData(postSnippets: BlogPost[]) {
  return postSnippets.map((snippet) => {
    return {
      ...snippet,
      bodySnippet: snippet.body.slice(0, 100),
    };
  });
}
export async function getStaticProps() {
  const data = fs.readFileSync('../../static/blogData.json', 'utf8');
  const jsonData = JSON.parse(data);
  const postSnippets: PostSnippet[] = getPostData(jsonData);
  return {
    props: {
      postSnippets: postSnippets,
    },
  };
}
