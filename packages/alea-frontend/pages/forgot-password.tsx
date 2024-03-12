import { Box, Typography } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { NextPage } from 'next';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { sendForgotEmail } from '@stex-react/api';

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    await sendForgotEmail(email);
  }

  return (
    <MainLayout>
      {submitted ? (
        <Typography textAlign="center" mt="50px" fontSize={16}>
          A message has been sent to you by email with instructions on how to
          reset your password.
        </Typography>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '500px',
            margin: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Password Reset
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter the email address that you used to sign up. We will send you
            an email with a link to reset your password.
          </Typography>
          <TextField
            label="Email Address"
            type="email"
            sx={{ width: '100%', mb: 2 }}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="contained" type="submit" sx={{ width: '100%' }}>
            SEND
          </Button>
          <Typography variant="body2" sx={{ mt: 2 }}>
            If you still need help, contact ALeA Support.
          </Typography>
        </Box>
      )}
    </MainLayout>
  );
};

export default ForgotPasswordPage;
