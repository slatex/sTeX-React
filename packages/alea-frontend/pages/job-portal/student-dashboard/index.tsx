import React, {useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Link,
  CircularProgress,
  Box,
  Avatar,
} from "@mui/material";
import { Email, Phone, School, Description } from "@mui/icons-material";
import { canAccessResource, getStudentProfile, StudentData } from "@stex-react/api";
import { Action, CURRENT_TERM, ResourceName } from "@stex-react/utils";
import { useRouter } from "next/router";
import MainLayout from "packages/alea-frontend/layouts/MainLayout";

const StudentDashboard = () => {
  const [student, setStudent] = useState<StudentData>(null);
  const [loading, setLoading] = useState(true);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [accessCheckLoading]);

  if (accessCheckLoading||loading) {
    return (
        <CircularProgress color="primary" />
    );
  }

  if (!student  ) {
    return (
      <MainLayout title="Job-Portal">
      <Box
      textAlign="center"
      mt={10}
    >        <Typography variant="h6" color="error">
          You are currently not registered on job portal, Register first to access student dashboard
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
          backgroundColor: "primary.main",
          color: "white",
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Student Dashboard
        </Typography>
        <Typography variant="subtitle1">Your academic profile at a glance</Typography>
      </Box>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <School />
                  </Avatar>
                  <Typography variant="h6">Personal Information</Typography>
                </Box>
                <Typography>
                  <strong>Name:</strong> {name}
                </Typography>
                <Typography>
                  <Email sx={{ verticalAlign: "middle", mr: 1 }} />
                  <strong>Email:</strong> {email}
                </Typography>
                <Typography>
                  <Phone sx={{ verticalAlign: "middle", mr: 1 }} />
                  <strong>Phone:</strong> {contactNo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
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
                  <strong>About:</strong> {about || "No details provided"}
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
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ textTransform: "none" }}
                    >
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
    </MainLayout>
  );
};

export default StudentDashboard;
