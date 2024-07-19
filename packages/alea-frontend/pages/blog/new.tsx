import { Box, Button, TextField, Typography } from '@mui/material';
import {
  CdnImageMetadata,
  UserInfo,
  createBlogPost,
  getCdnImages,
  getUserInfo,
  isModerator,
  uploadCdnImage,
} from '@stex-react/api';
import { MystEditor } from '@stex-react/myst';
import { localStore } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import ImageCard from 'packages/alea-frontend/components/ImageCard';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

function generatePostId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, '')
    .trim()
    .replace(/ /g, '-');
}

const DRAFT_BLOG_TITLE_KEY = 'draft-blogTitle';
const DRAFT_BLOG_BODY_KEY = 'draft-blogBody';

const NewPostPage: NextPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [title, setTitle] = useState(localStore?.getItem(DRAFT_BLOG_TITLE_KEY) ?? '');
  const [body, setBody] = useState(localStore?.getItem(DRAFT_BLOG_BODY_KEY) ?? '');
  const postId = generatePostId(title);
  const [imageUploadResponses, setImageUploadResponses] = useState<CdnImageMetadata[] | {}[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');

  const handleImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64Image = (reader.result as string).split(',')[1];
        const response: CdnImageMetadata | {} = await uploadCdnImage(base64Image);
        console.log(response);
        setImageUploadResponses((prev) => [...prev, response]);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  };

  const loadImages = async () => {
    const data = await getCdnImages();
    setImageUploadResponses(data);
  };

  useEffect(() => {
    loadImages();
  }, []);

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
    await createBlogPost(
      title,
      body,
      postId,
      userInfo?.userId,
      userInfo?.fullName,
      imageUploadResponses[imageUploadResponses.length - 1]['id'],
      imageUploadResponses[imageUploadResponses.length - 1]['display_url']
    );
    setTitle('');
    setBody('');
    localStore.removeItem(DRAFT_BLOG_TITLE_KEY);
    localStore.removeItem(DRAFT_BLOG_BODY_KEY);
    alert('Success!');
  };

  if (!userInfo) {
    return <Typography>Loading...</Typography>;
  }

  const getImageUrl = (e: any) => {
    if (!e.target.value) return;
    const res = imageUploadResponses.filter((data) => {
      return data.id === e.target.value;
    });
    setHeroImageUrl(res[0]['display_url']);
  };

  return (
    <MainLayout>
      <Box mx="10px">
        <Box width="100%" m="0px 20px">
          <Typography fontSize={24} m="10px 0px">
            Create Blog
          </Typography>
          {imageUploadResponses.length > 0 && (
            <Box
              sx={{
                padding: '20px',
                margin: '10px 0px',
                marginRight: '30px',
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                boxShadow: '0 0 10px  gray',
                borderRadius: '10px',
              }}
            >
              {imageUploadResponses.map((data) => (
                <ImageCard imageId={data.id} imageUrl={data.display_url} />
              ))}
            </Box>
          )}
          <Box m="10px 0px">
            <input type="file" accept="image/*" onChange={handleImagesUpload} />
          </Box>

          <TextField
            label="postId"
            variant="outlined"
            disabled
            value={postId}
            size="small"
            sx={{ mb: '20px' }}
          />
          <TextField
            label="HeroImage Url"
            variant="outlined"
            disabled
            value={heroImageUrl}
            size="small"
            sx={{ mb: '20px' }}
          />
          <Box mb="20px">
            <MystEditor
              value={title}
              onValueChange={(v) => {
                setTitle(v);
                localStore.setItem(DRAFT_BLOG_TITLE_KEY, title);
              }}
              name="title_input"
              placeholder="Title of your blog post"
              defaultPreview={true}
            />
            <Box
              sx={{
                gap: '10px',
                mt: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TextField
                label="HeroImage Id"
                variant="outlined"
                size="small"
                sx={{ mb: '20px', mr: '20px' }}
                onChange={(e) => getImageUrl(e)}
              />
              <Box
                component="img"
                sx={{
                  maxHeight: { xs: 100, md: 100 },
                  maxWidth: { xs: 100, md: 100 },
                }}
                src={heroImageUrl}
              />
            </Box>
          </Box>
          <MystEditor
            value={body}
            onValueChange={(v) => {
              setBody(v);
              localStore.setItem(DRAFT_BLOG_BODY_KEY, body);
            }}
            name="body_input"
            minRows={20}
            placeholder="content of your blog post"
            defaultPreview={true}
          />
          <Button sx={{ m: '20px' }} variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default NewPostPage;
