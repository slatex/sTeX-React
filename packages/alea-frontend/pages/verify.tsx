import { Typography } from '@mui/material';
import { verifyEmail } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const VerifyEmail: NextPage = () => {
  const [data, setData] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    async function fetchData() {
      try {
        const { query } = router;
        const res = await verifyEmail(
          query.email as string,
          query.id as string
        );
        setData(res.data.message);
      } catch (error) {
        setData(error.response.data.message)
      }
    }

    fetchData();
  }, [router.isReady, router]);

  return (
    <MainLayout>
      <Typography fontSize={20} mt={10} textAlign="center">
        {data}
      </Typography>
    </MainLayout>
  );
};

export default VerifyEmail;
