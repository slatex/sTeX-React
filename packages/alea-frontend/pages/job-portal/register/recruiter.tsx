import { Container, Box, TextField, Button, Typography } from "@mui/material";
import { createRecruiterProfile, getUserInfo, RecruiterData } from "@stex-react/api";
import { useRouter } from "next/router";
import MainLayout from "packages/alea-frontend/layouts/MainLayout";
import { useEffect, useState } from "react";

export default function RecruiterRegistration() {
  const [formData, setFormData] = useState<RecruiterData>({
    name: "",
    email: "",
    organization: "",
    position: "",
  });
  const router=useRouter();
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
    const result= await createRecruiterProfile(payload);
    if(result.success)router.push("/job-portal/recruiter-dashboard") ;
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
