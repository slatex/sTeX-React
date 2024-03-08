import { Typography } from '@mui/material';
import { verifyEmail } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const VerifyEmail: NextPage = () => {
  const [data, setData] = useState('');
  const router = useRouter();
  const { query } = router;
  async function fetchData() {
    const res = await verifyEmail(query.email as string, query.id as string);
    setData(res.data.message);
    console.log(res.data.message);
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <MainLayout>
      <Typography fontSize={20} mt={10} textAlign="center">
        {data}
      </Typography>
    </MainLayout>
  );
};

export default VerifyEmail;
