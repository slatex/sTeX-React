import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Avatar } from '@mui/material';
import { Work, Email, Business } from '@mui/icons-material';
import { canAccessResource, getRecruiterProfile, RecruiterData } from '@stex-react/api';
import { useRouter } from 'next/router';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';

const RecruiterDashboard = () => {
  const [recruiter, setRecruiter] = useState<RecruiterData>(null);
  const [loading, setLoading] = useState(true);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const router = useRouter();
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
    if (accessCheckLoading) return;
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        const res = await getRecruiterProfile();
        setRecruiter(res[0]);
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

  if (!recruiter) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="error">
          You are currently not registered on job portal, Register first to access recruiter
          dashboard
        </Typography>
      </Box>
    );
  }

  const { name, email, organization, position } = recruiter;

  return (
    <MainLayout title="Recruiter Dashboard | Job Portal">
      <Box>
        <Box
          sx={{
            py: 3,
            backgroundColor: 'primary.main',
            color: 'white',
            textAlign: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Recruiter Dashboard
          </Typography>
          <Typography variant="subtitle1">Your professional profile at a glance</Typography>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Work />
                    </Avatar>
                    <Typography variant="h6">Recruiter Information</Typography>
                  </Box>
                  <Typography>
                    <strong>Name:</strong> {name}
                  </Typography>
                  <Typography>
                    <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
                    <strong>Email:</strong> {email}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <Business />
                    </Avatar>
                    <Typography variant="h6">Organization Details</Typography>
                  </Box>
                  <Typography>
                    <strong>Organization:</strong> {organization}
                  </Typography>
                  <Typography>
                    <strong>Position:</strong> {position}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default RecruiterDashboard;
