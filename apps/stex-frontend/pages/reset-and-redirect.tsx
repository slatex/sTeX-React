import { CircularProgress, Typography } from '@mui/material';
import { resetFakeUserData } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ResetAndRedirectPage: NextPage = () => {
  const router = useRouter();
  const redirectPath = router.query['redirectPath'] as string;
  const profileName = router.query['profileName'] as string;

  useEffect(() => {
    if (!router.isReady) return;
    resetFakeUserData(profileName).then(() => {
      window.location.replace(redirectPath);
    });
  }, [router, router.isReady, redirectPath, profileName]);

  return (
    <>
      <CircularProgress />
      <br/>
      {router.isReady && <Typography>Resetting user profile</Typography>}
    </>
  );
};

export default ResetAndRedirectPage;
