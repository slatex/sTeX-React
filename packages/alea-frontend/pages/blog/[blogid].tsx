import { Box, Button, Typography } from '@mui/material';
import { Blog, UserInfo, getBlogPostsById, getUserInfo } from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const Blogs: NextPage = () => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const router = useRouter();
  const blogId = router.query.blogid;
  useEffect(() => {
    async function fetchData() {
      const user = await getUserInfo();
      setUserInfo(user);
      const data = await getBlogPostsById(blogId as string);
      setBlog(data.data.blogs[0]);
    }
    if (router.isReady) fetchData();
  }, [router.isReady, blogId]);
  if (!blog) return <Box m="20px">Loading...</Box>;
  return (
    <MainLayout>
      <Box mx="10px">
        <Box m="0 auto" maxWidth="800px">
          <Box display="flex" justifyContent="space-between" m="20px">
            <Button variant="contained" onClick={() => router.push(`/blog`)}>
              All Blogs
            </Button>
            {userInfo && (
              <Button
                variant="contained"
                onClick={() => router.push(`/update-blog?blogid=${blogId}`)}
              >
                Edit
              </Button>
            )}
          </Box>
          <Box
            sx={{
              p: '20px',
              m: '20px',
              minHeight: '80vh',
              boxShadow: '0 0 10px 0 gray ',
              borderRadius: '5px',
            }}
          >
            <MdViewer content={blog.title} />
            <hr />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <MdViewer content={blog.authorName} />
              </Typography>
              <Typography fontWeight="bold">
                <MdViewer content={blog.createdAt.split('T')[0]} />
              </Typography>
            </Box>
            <MdViewer content={blog.body} />
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Blogs;
