import { Box, Typography } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { NextPage } from 'next';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import Link from 'next/link';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';
import { UserSignUpDetail, signUpUser } from '@stex-react/api';
import { v4 as uuidv4 } from 'uuid';

const SignUpPage: NextPage = () => {
  const router = useRouter();
  const { login: t } = getLocaleObject(router);
  const [formData, setFormData] = useState<UserSignUpDetail>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationToken: uuidv4(),
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Invalid email address',
      }));
      return;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }));
    }

    // Password validation
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      }));
      return;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: '',
      }));
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Passwords do not match',
      }));
      return;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: '',
      }));
    }
    try {
      const response = await signUpUser(formData);
      alert(response.data.message);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationToken: uuidv4(),
      });
      router.push('/login');
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  return (
    <MainLayout>
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
        <br />
        <Typography
          style={{
            marginBottom: '20px',
            fontWeight: 'bold',
            fontSize: 20,
          }}
        >
          Sign up with your email address
        </Typography>
        <TextField
          name="firstName"
          label="First Name"
          type="text"
          required
          margin="normal"
          fullWidth
          value={formData.firstName}
          onChange={handleChange}
        />
        <TextField
          name="lastName"
          label="Last Name"
          type="text"
          required
          margin="normal"
          fullWidth
          value={formData.lastName}
          onChange={handleChange}
        />
        <TextField
          name="email"
          label="Email Address"
          type="email"
          required
          margin="normal"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          required
          margin="normal"
          fullWidth
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
        />
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          required
          margin="normal"
          fullWidth
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '20px', width: '100%' }}
        >
          SIGN UP
        </Button>
        <br />
        <Typography>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'blue' }}>
            Log In
          </Link>
        </Typography>
        <br />
        <Box>
          {t.notesHeader}
          <ul>
            <li>{t.notesPoint1}</li>
            <li>{t.notesPoint2}</li>
            <li>{t.notesPoint3}</li>
            <li>
              {t.notesPoint4}:&nbsp;
              <a
                href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/home"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'blue' }}
              >
                Link
              </a>
            </li>
          </ul>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default SignUpPage;
