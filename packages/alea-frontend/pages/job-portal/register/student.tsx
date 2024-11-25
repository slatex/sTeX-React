import { Container, Box, TextField, Button, Typography } from "@mui/material";
import { createStudentProfile, getUserInfo,StudentData } from "@stex-react/api";
import {  useRouter } from "next/router";
import MainLayout from "packages/alea-frontend/layouts/MainLayout";
import { useEffect, useState } from "react";

export default function StudentRegistration() {
  const router=useRouter();
  const [formData, setFormData] = useState<StudentData>({
    name: "",
    resumeURL: "",
    email: "",
    contactNo: "",
    programme: "",
    yearOfAdmission: "",
    yearOfGraduation: "",
    courses: "",
    grades: "",
    about: "",
  });
  const [userId,setUserId]=useState('');
  useEffect(() => {
    getUserInfo().then((userInfo) => {
      if (!userInfo) return;
      setUserId(userInfo.userId);
    });
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async() => {
    const payload = {
      ...formData,userId:userId
    };
    const result= await createStudentProfile(payload);
    if(result.success)router.push("/job-portal/student-dashboard") ;
  };

  return (
    <MainLayout title="Register-Student | VoLL-KI">
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Box
          sx={{
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Student Registration
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
          />
          <TextField
            label="Contact Number"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            type="tel"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Programme"
            name="programme"
            value={formData.programme}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Year of Admission"
            name="yearOfAdmission"
            value={formData.yearOfAdmission}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Year of Graduation"
            name="yearOfGraduation"
            value={formData.yearOfGraduation}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Courses"
            name="courses"
            value={formData.courses}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            margin="normal"
            placeholder="Enter your courses separated by commas"
          />
          <TextField
            label="Grades"
            name="grades"
            value={formData.grades}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            margin="normal"
            placeholder="Enter grades corresponding to the courses"
          />
          <TextField
            label="About Yourself"
            name="about"
            value={formData.about}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Resume URL"
            name="resumeURL"
            value={formData.resumeURL}
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
