import { Box, Typography } from '@mui/material';
import { NextPage } from 'next';
import MainLayout from '../../layouts/MainLayout';
import { useEffect, useState } from 'react';
import { Blog, getBlogPosts } from '@stex-react/api';
import { useRouter } from 'next/router';
import { MdViewer } from '@stex-react/markdown';

const Blogs: NextPage = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  useEffect(() => {
    async function fetchData() {
      const blogs = await getBlogPosts();
      setBlogs(blogs.data);
    }
    fetchData();
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
            Blogs
          </Typography>
          {blogs.map((blog) => (
            <Box
              key={blog.blogId}
              border="1px solid #CCC"
              p="10px"
              m="20px"
              onClick={() => {
                router.push(`/blog/${blog.blogId}`);
              }}
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
              <MdViewer content={blog.title} />
              <MdViewer content={blog.body.concat('...')} />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                height="20px"
              >
                <Typography fontSize={12} textAlign={'right'}>
                  {blog.createdAt.split('T')[0]}
                </Typography>
                <Typography display="flex" alignItems="center">
                  Author : <MdViewer content={blog.authorName} />
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Blogs;
