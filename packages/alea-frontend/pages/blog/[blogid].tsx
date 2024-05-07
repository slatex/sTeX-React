import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import {
  Blog,
  UserInfo,
  deleteBlogPost,
  getBlogPostsById,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const Blogs: NextPage = ({ blog }: { blog: Blog }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const user = await getUserInfo();
      setUserInfo(user);
    }
    fetchData();
  }, []);

  const handleDelete = () => {
    setOpenConfirmation((prevState) => !prevState);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBlogPost(blog.blogId);
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setOpenConfirmation(false);
      alert('blog deleted successfully');
      router.push('/blog');
    }
  };

  return (
    <MainLayout>
      <Box mx="10px">
        <Box m="0 auto" maxWidth="800px">
          <Box display="flex" justifyContent="space-between" m="20px">
            <Link href={'/blog'}>
              <Button variant="contained">All Blogs</Button>
            </Link>
            {isModerator(userInfo?.userId) && (
              <>
                <Link href={`/update-blog?blogid=${blog.blogId}`}>
                  <Button variant="contained">Edit</Button>
                </Link>
                <Button variant="contained" onClick={handleDelete}>
                  Delete
                </Button>
              </>
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
      <Dialog open={openConfirmation} onClose={handleDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this blog?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Blogs;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const blogId = context.query.blogid as string;
  const protocol = context.req.headers['x-forwarded-proto'] as string;
  const host = context.req.headers.host;
  try {
    const res = await getBlogPostsById(blogId, true, protocol, host);
    const blog = res.data.blogs[0];
    return { props: { blog } };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { props: { data: null } };
  }
}
