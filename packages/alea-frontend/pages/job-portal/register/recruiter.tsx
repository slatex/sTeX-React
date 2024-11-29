import { Container, Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import {
  canAccessResource,
  createRecruiterProfile,
  getRecruiterProfile,
  getUserInfo,
  RecruiterData,
} from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { useRouter } from 'next/router';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useEffect, useState } from 'react';

export default function RecruiterRegistration() {
  const [formData, setFormData] = useState<RecruiterData>({
    name: '',
    email: '',
    organization: '',
    position: '',
  });
  const [errors, setErrors] = useState({ email: '' });
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      if (!userInfo) return;
      setUserId(userInfo.userId);
    });
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      setAccessCheckLoading(true);
      const hasAccess = await canAccessResource(ResourceName.JOB_PORTAL, Action.CREATE_JOB_POST, {
        instanceId: CURRENT_TERM,
      });
      if (!hasAccess) {
        alert('You donot have access to this page.');
        router.push('/job-portal');
        return;
      }
      setAccessCheckLoading(false);
    };

    checkAccess();
  }, []);

  useEffect(() => {
    setLoading(true);

    if (accessCheckLoading) return;
    const fetchRecruiterData = async () => {
      try {
        const res = await getRecruiterProfile();
        setIsRegistered(!!res[0]);
      } catch (error) {
        console.error('Error fetching recruiter data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, [accessCheckLoading]);
  if (accessCheckLoading || loading) {
    return <CircularProgress color="primary" />;
  }
  if (isRegistered) return <>You are already registerd.</>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }));
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: 'Email is required.' }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: 'Invalid email address.' }));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail(formData.email)) return;

    const payload = {
      ...formData,
      userId: userId,
    };
    await createRecruiterProfile(payload);
    router.push('/job-portal/recruiter-dashboard');
  };
  return (
    <MainLayout title="Register-Recruiter | VoLL-KI">
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Box
          sx={{
            textAlign: 'center',
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Recruiter Registration
          </Typography>

          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Organization Name"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
