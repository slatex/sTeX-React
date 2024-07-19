import { Box, Button, TextField, Typography } from '@mui/material';
import {
  UserInfo,
  createBlogPost,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { MystEditor } from '@stex-react/myst';
import { localStore } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

function generatePostId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, '')
    .trim()
    .replace(/ /g, '-');
}

const NewPostPage: NextPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const postId = generatePostId(title);

  if (title) localStore.setItem('blogTitle', title);
  if (body) localStore.setItem('blogBody', body);

  useEffect(() => {
    const savedTitle = localStore.getItem('blogTitle');
    const savedBody = localStore.getItem('blogBody');
    if (savedTitle) setTitle(savedTitle);
    if (savedBody) setBody(savedBody);

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
    await createBlogPost(
      title,
      body,
      postId,
      userInfo?.userId,
      userInfo?.fullName
    );
    setTitle('');
    setBody('');
    localStore.removeItem('blogTitle');
    localStore.removeItem('blogBody');
    alert('Success!');
  };

  if (!userInfo) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <MainLayout>
      <Box mx="10px">
        <Box width="100%" m="0px 20px">
          <Typography fontSize={24} m="10px 0px">
            Create Blog
          </Typography>
          <TextField
            label="postId"
            variant="outlined"
            disabled
            value={postId}
            size="small"
            sx={{ mb: '20px' }}
          />
          <Box mb="20px">
            <MystEditor
              value={title}
              onValueChange={(v) => {
                setTitle(v);
              }}
              name="title_input"
              placeholder="Title of your blog post"
              defaultPreview={true}
            />
          </Box>
          <MystEditor
            value={body}
            onValueChange={(v) => setBody(v)}
            name="body_input"
            minRows={20}
            placeholder="content of your blog post"
            defaultPreview={true}
          />
          <Button
            sx={{ m: '20px' }}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default NewPostPage;
