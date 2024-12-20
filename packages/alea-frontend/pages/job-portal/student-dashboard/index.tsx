import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
  Link,
  CircularProgress,
  Box,
  Avatar,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Email, Phone, School, Description } from '@mui/icons-material';
import {
  canAccessResource,
  getStudentProfile,
  StudentData,
  upDateStudentProfile,
} from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { useRouter } from 'next/router';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';

const StudentDashboard = () => {
  const [student, setStudent] = useState<StudentData>(null);
  const [loading, setLoading] = useState(true);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StudentData>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const router=useRouter();
  useEffect(() => {
    const checkAccess = async () => {
      setAccessCheckLoading(true); 
      const hasAccess = await canAccessResource(ResourceName.JOB_PORTAL, Action.APPLY,{
        instanceId: CURRENT_TERM,
      });
      if (!hasAccess) {
        alert("You donot have access to this page.")
        router.push("/job-portal");
        return; 
      }
      setAccessCheckLoading(false); 
    };
 
    checkAccess();
  }, []);
  useEffect(() => {
    if(accessCheckLoading)return;
    const fetchStudentData = async () => {
      try {
        setLoading(true);

        const res = await getStudentProfile();
        setStudent(res[0]);
        setFormData(res[0]);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [accessCheckLoading]);

  const handleInputChange =
    (field: keyof StudentData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
      setErrors({ ...errors, [field]: '' });
    };
  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    [
      'name',
      'email',
      'contactNo',
      'programme',
      'yearOfAdmission',
      'yearOfGraduation',
      'about',
      'courses',
      'grades',
    ].forEach((field) => {
      if (!formData?.[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData?.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateFields()) return;

    try {
      await upDateStudentProfile(formData);
      setStudent(formData);
      setDialogOpen(false);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating student profile:', error);
    }
  };

  if (accessCheckLoading || loading) {
    return <CircularProgress color="primary" />;
  }

  if (!student) {
    return (
      <MainLayout title="Job-Portal">
        <Box textAlign="center" mt={10}>
          <Typography variant="h6" color="error">
            You are currently not registered on job portal, Register first to access student
            dashboard
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  const {
    name,
    resumeURL,
    email,
    contactNo,
    programme,
    yearOfAdmission,
    yearOfGraduation,
    courses,
    grades,
    about,
  } = student;

  return (
    <MainLayout title="Student Dashboard | Job Portal">
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
            Student Dashboard
          </Typography>
          <Typography variant="subtitle1">Your academic profile at a glance</Typography>
        </Box>
        <Box>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Edit Profile
          </Button>
        </Box>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <School />
                    </Avatar>
                    <Typography variant="h6">Personal Information</Typography>
                  </Box>
                  <Typography>
                    <strong>Name:</strong> {name}
                  </Typography>
                  <Typography>
                    <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
                    <strong>Email:</strong> {email}
                  </Typography>
                  <Typography>
                    <Phone sx={{ verticalAlign: 'middle', mr: 1 }} />
                    <strong>Phone:</strong> {contactNo}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <Description />
                    </Avatar>
                    <Typography variant="h6">Academic Information</Typography>
                  </Box>
                  <Typography>
                    <strong>Programme:</strong> {programme}
                  </Typography>
                  <Typography>
                    <strong>Year of Admission:</strong> {yearOfAdmission}
                  </Typography>
                  <Typography>
                    <strong>Year of Graduation:</strong> {yearOfGraduation}
                  </Typography>
                  <Typography>
                    <strong>About:</strong> {about || 'No details provided'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Course & Grade
                  </Typography>
                  {courses && grades ? (
                    <Box>
                      <Typography>
                        <strong>Course:</strong> {courses}
                      </Typography>
                      <Typography>
                        <strong>Grade:</strong> {grades}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography>No course or grade information available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resume
                  </Typography>
                  {resumeURL ? (
                    <Link
                      href={resumeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                    >
                      <Button variant="contained" color="primary" sx={{ textTransform: 'none' }}>
                        View Resume
                      </Button>
                    </Link>
                  ) : (
                    <Typography>No resume uploaded</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        BackdropProps={{
          style: {
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
          Edit Profile
        </DialogTitle>
        <DialogContent sx={{ padding: 3 }}>
          <br />
          <br />
          <Grid container spacing={3}>
            {[
              { label: 'Name', field: 'name', placeholder: 'Enter your name' },
              { label: 'Email', field: 'email', placeholder: 'Enter your email' },
              { label: 'Phone', field: 'contactNo', placeholder: 'Enter your phone number' },
              { label: 'Programme', field: 'programme', placeholder: 'Enter your programme' },
              {
                label: 'Year of Admission',
                field: 'yearOfAdmission',
                placeholder: 'Enter year of admission',
              },
              {
                label: 'Year of Graduation',
                field: 'yearOfGraduation',
                placeholder: 'Enter year of graduation',
              },
              { label: 'Courses', field: 'courses', placeholder: 'List your courses' },
              { label: 'Grades', field: 'grades', placeholder: 'List your grades' },
              {
                label: 'About',
                field: 'about',
                placeholder: 'Tell us about yourself',
                multiline: true,
              },
              { label: 'Resume URL', field: 'resumeURL', placeholder: 'Enter your resume link' },
            ].map(({ label, field, placeholder, multiline }) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={label}
                  placeholder={placeholder}
                  multiline={multiline}
                  rows={multiline ? 4 : 1}
                  value={formData?.[field] || ''}
                  onChange={handleInputChange(field as keyof StudentData)}
                  error={!!errors[field]}
                  helperText={errors[field]}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
        
<Button
  onClick={() => setDialogOpen(false)}
  variant="outlined"
  color="secondary"
  sx={{
    borderColor: 'secondary.main',
    color: 'secondary.main',
    '&:hover': {
      borderColor: 'primary.main',
      color: 'primary.main',
    },
  }}
>
  Cancel
</Button>

          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default StudentDashboard;
