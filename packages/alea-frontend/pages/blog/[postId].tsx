import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import {
  BlogPost,
  UserInfo,
  deleteBlogPost,
  getPostById,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const BlogPostPage: NextPage = ({ post }: { post: BlogPost }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);

  const toggleDeleteDialogOpen = () => {
    setDeleteDialogOpen((prevState) => !prevState);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBlogPost(post.postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    } finally {
      setDeleteDialogOpen(false);
      alert('Post deleted successfully');
      router.push('/blog');
    }
  };

  return (
    <MainLayout>
      <Box mx="10px">
        <Box m="0 auto" maxWidth="800px">
          <Box display="flex" justifyContent="space-between" m="20px">
            <Link href={'/blog'}>
              <Button variant="contained">All Posts</Button>
            </Link>
            {isModerator(userInfo?.userId) && (
              <Box display="flex" gap="10px">
                <Link href={`/blog/edit?postId=${post.postId}`}>
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                </Link>
                <IconButton onClick={toggleDeleteDialogOpen}>
                  <DeleteIcon color="warning" />
                </IconButton>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: '20px',
              m: '20px',
              minHeight: 'calc(100vh - 270px)',
              boxShadow: '0 0 10px 0 gray',
              borderRadius: '5px',
            }}
          >
            <MdViewer content={post.title} />
            <hr />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <MdViewer content={post.authorName} />
              </Typography>
              <Typography fontWeight="bold">
                <MdViewer content={post.createdAt.split('T')[0]} />
              </Typography>
            </Box>
            <MdViewer content={post.body} />
          </Box>
        </Box>
      </Box>
      <Dialog open={deleteDialogOpen} onClose={toggleDeleteDialogOpen}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDeleteDialogOpen}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="warning">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default BlogPostPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const postId = context.query.postId as string;
  const protocol = context.req.headers['x-forwarded-proto'] as string;
  const host = context.req.headers.host;
  try {
    const post = await getPostById(postId, true, protocol, host);
    console.log(post);
    return { props: { post } };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { props: { data: null } };
  }
}
