import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { UserSignUpDetail, signUpUser } from '@stex-react/api';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';

export const passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

const SignUpPage: NextPage = () => {
  const router = useRouter();
  const { login: t, logInSystem: l } = getLocaleObject(router);
  const [formData, setFormData] = useState<UserSignUpDetail>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationToken: crypto.randomUUID(),
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
        email: l.invalidEmail,
      }));
      return;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }));
    }

    // Password validation
    if (!passwordRegex.test(formData.password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: l.passwordRegex,
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
        confirmPassword: l.passwordConfirm,
      }));
      return;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: '',
      }));
    }
    try {
      await signUpUser(formData);
      alert(l.signUp200);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationToken: crypto.randomUUID(),
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
          {l.signUpEmail}
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
          {l.signUp}
        </Button>
        <br />
        <Typography>
          {l.alreadyAccount}{' '}
          <Link href="/login" style={{ color: 'blue' }}>
            {l.logIn}
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
                {l.link}
              </a>
            </li>
          </ul>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default SignUpPage;
