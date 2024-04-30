import { Box, Button, Typography } from '@mui/material';
import {
  UserInfo,
  getUserInfo,
  isModerator,
  createBlogPost,
} from '@stex-react/api';
import { MdEditor } from '@stex-react/markdown';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useRouter } from 'next/router';

function generateBlogId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, '')
    .replace(/ /g, '_');
}

const CreateBlog: NextPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

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
  const handleSubmit = async () => {
    const blogId = generateBlogId(title);
    await createBlogPost(
      title,
      body,
      blogId,
      userInfo?.userId,
      userInfo?.fullName
    );
    setTitle('');
    setBody('');
    alert('Success!');
  };

  if (!userInfo) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <MainLayout>
      <Box mx="10px">
        <Box m="0 auto" maxWidth="800px">
          <Typography mt="20px" fontSize={24}>
            Create Blog
          </Typography>
          <Box mb="20px">
            <MdEditor
              value={title}
              onValueChange={(v) => setTitle(v)}
              name="title_input"
              placeholder="Title of your blog post"
            />
          </Box>
          <MdEditor
            value={body}
            onValueChange={(v) => setBody(v)}
            name="body_input"
            minRows={20}
            placeholder="content of your blog post"
          />
          <Box display="flex" justifyContent="center" mt="20px">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CreateBlog;
