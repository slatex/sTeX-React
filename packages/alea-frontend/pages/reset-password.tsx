import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { resetPassword } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const ResetPasswordPage: NextPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { query } = router;
  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert('Password and Confirm Password should be the same');
      return;
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 8 characters long'
      );
      return;
    }
    try {
      const res = await resetPassword(
        query.email as string,
        password,
        query.id as string
      );
      alert(res.data.message);
      router.push("/login")
    } catch (error) {
      alert(error.response.data.message);
      router.push("/login")
    }
  };
  return (
    <MainLayout>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '300px',
          margin: 'auto',
        }}
      >
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          variant="outlined"
          margin="normal"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        {error && (
          <Box mt={2} width="300px">
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default ResetPasswordPage;
