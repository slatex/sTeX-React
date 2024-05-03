import { Box, Button, TextField, Typography } from '@mui/material';
import {
  Blog,
  UserInfo,
  getBlogPostsById,
  getUserInfo,
  isModerator,
  updateBlogPost,
} from '@stex-react/api';
import { MdEditor } from '@stex-react/markdown';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const UpdateBlog: NextPage = () => {
  const router = useRouter();
  const { blogid } = router.query;
  const [blogInfo, setBlogInfo] = useState<Blog>(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hasChanged, setHasChanged] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  useEffect(() => {
    const fetchDataAndCheckModerator = async () => {
      const info = await getUserInfo();
      setUserInfo(info);
      if (!isModerator(info?.userId)) {
        router.push('/blog');
      }
    };

    fetchDataAndCheckModerator();
  }, [router]);

  useEffect(() => {
    const fetchBlogPost = async () => {
      const blogData = await getBlogPostsById(blogid as string);
      const blog = blogData.data.blogs[0];
      setBlogInfo(blogData.data.blogs[0]);
      setTitle(blog.title);
      setBody(blog.body);
    };
    if (router.isReady) fetchBlogPost();
  }, [router.isReady, blogid]);

  const handleSubmit = async () => {
    await updateBlogPost(title, body, blogid as string);
    alert('Updates Successfully');
    router.push(`/blog/${blogid}`);
  };

  useEffect(() => {
    setHasChanged(title !== blogInfo?.title || body !== blogInfo?.body);
  }, [title, body]);

  if (!blogInfo) {
    return <Typography>Loading...</Typography>;
  }
  if (!userInfo) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <MainLayout>
      <Box mx="10px">
        <Box width="100%" m="0px 20px">
          <Typography fontSize={24} m="10px 0px">
            Update Blog
          </Typography>
          <TextField
            id="outlined-basic"
            label="blogId"
            variant="outlined"
            disabled
            value={blogid}
            size="small"
            sx={{ mb: '20px' }}
          />

          <Box mb="20px">
            <MdEditor
              value={title}
              onValueChange={(v) => setTitle(v)}
              name="title_input"
              minRows={2}
              placeholder="Title of your blog post"
              defaultPreview={true}
            />
          </Box>
          <MdEditor
            value={body}
            onValueChange={(v) => setBody(v)}
            name="body_input"
            minRows={20}
            placeholder="Content of your blog post"
            defaultPreview={true}
          />
          <Box display="flex" m="20px" gap="10px">
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit()}
              disabled={!hasChanged}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/blog')}
            >
              Discard
            </Button>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default UpdateBlog;
