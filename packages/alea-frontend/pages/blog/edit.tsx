import { Typography } from '@mui/material';
import { BlogPost, UserInfo, getPostById, getUserInfo, isModerator } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { EditPostComponent } from './new';

const EditPostPage: NextPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const [existingPostInfo, setExistingPostInfo] = useState<BlogPost>(undefined);
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
      const post = await getPostById(postId as string);
      setExistingPostInfo(post);
    };
    if (router.isReady) fetchBlogPost();
  }, [router.isReady, postId]);

  if (!existingPostInfo || !userInfo) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <MainLayout>
      <EditPostComponent existingPost={existingPostInfo} />
    </MainLayout>
  );
};

export default EditPostPage;
