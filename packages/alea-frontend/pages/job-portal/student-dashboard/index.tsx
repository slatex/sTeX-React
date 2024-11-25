import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Button, Link, CircularProgress } from "@mui/material";
import { getStudentProfile } from "@stex-react/api";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData= async()=>{
       const res=await getStudentProfile();
       console.log({res});
       setStudent(res.data[0]);

    }
    fetchStudentData();
    setLoading(false);
  }, []);

  if (loading) {
    return <CircularProgress size={50} color="primary" sx={{ display: 'block', margin: 'auto', marginTop: 5 }} />;
  }
  if (!student) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ marginTop: 5 }}>
        Failed to load profile
      </Typography>
    );
  }

  const {
    name,
    userId,
    resumeURL,
    contactEmail,
    contactPhone,
    programme,
    yearOfAdmission,
    yearOfGraduation,
    courses,
    grades,
    about,
  } = student;
  console.log({student});
  console.log({about});


  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Student Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Info */}
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Typography variant="body1"><strong>Name:</strong> {name}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {contactEmail}</Typography>
              <Typography variant="body1"><strong>Phone:</strong> {contactPhone}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Academic Information</Typography>
              <Typography variant="body1"><strong>Programme:</strong> {programme}</Typography>
              <Typography variant="body1"><strong>Year of Admission:</strong> {yearOfAdmission}</Typography>
              <Typography variant="body1"><strong>Year of Graduation:</strong> {yearOfGraduation}</Typography>
              <Typography variant="body1"><strong>About:</strong> {about}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Courses & Grades</Typography>
              <Typography variant="subtitle1" gutterBottom>
      {`Course: ${courses} | Grades: ${grades}`}
    </Typography>
             
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Resume</Typography>
              {resumeURL ? (
                <Link href={resumeURL} target="_blank" rel="noopener noreferrer" underline="hover">
                  <Button variant="contained" color="primary">View Resume</Button>
                </Link>
              ) : (
                <Typography variant="body1">No resume uploaded</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default StudentDashboard;
