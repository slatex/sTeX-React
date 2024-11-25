import { Container, Box, Typography, Button } from '@mui/material';
import { checkIfUserRegisteredOnJP, getUserInfo, isLoggedIn } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ForceFauLogin } from 'packages/alea-frontend/components/ForceFAULogin';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useEffect, useState } from 'react';

const JobPortal: NextPage = () => {
  const router = useRouter();
  const [isLogIn, setIsLogIn] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [forceFauLogin, setForceFauLogin] = useState(false);
  const [userId,setUserId]=useState("");

  const showStudentButton = !isLogIn || isStudent;
  const showRecruiterButton = !isLogIn || isRecruiter;
  const showAdminButton = !isLogIn;

  useEffect(()  => {
    const loggedIn = isLoggedIn();
    setIsLogIn(loggedIn);
    if (loggedIn) {
      getUserInfo().then((userInfo) => {
        const uid = userInfo?.userId;
        if (!uid) return;
        setUserId(uid);
        uid.length === 8 && !uid.includes('@') ? setIsStudent(true) : setIsRecruiter(true);
      });
    }
  }, []);

  if (forceFauLogin) {
    return (
      <MainLayout title="Job-Portal | VoLL-KI">
        <ForceFauLogin content={'job portal'} />
      </MainLayout>
    );
  }
  return (
    <MainLayout title="Job-Portal | VoLL-KI">
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
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Welcome to Job Portal
          </Typography>
          {showStudentButton && (
  <Button
    variant="contained"
    color="primary"
    fullWidth
    sx={{ mb: 2 }}
    onClick={async () => {
      if (!isLogIn) {
        if (window.location.pathname === '/login') return;
        router.push('/login?target=' + encodeURIComponent(window.location.href));
      } else {
        
          const result = await checkIfUserRegisteredOnJP(userId); 
          if (result.exists) {
            router.push('job-portal/student-dashboard');
          } else {
            router.push('job-portal/register/student');
          }
        } 
      }
    }
  >
    Student
  </Button>
)}

          {/* {showStudentButton && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => {
                if (!isLogIn) {
                  if (window.location.pathname === '/login') return;
                  router.push('/login?target=' + encodeURIComponent(window.location.href));
                } else {if( checkIfUserRegisteredOnJP(userId).exists){
                  router.push('job-portal/student-dashboard');
              }else {router.push('job-portal/register/student');}
            }
                
              }}
            >
              Student
            </Button>
          )} */}
          {showRecruiterButton && (
            <Button
              variant="contained"
              fullWidth
              sx={{ mb: 2 }}
              onClick={async() => {
                if (!isLogIn) {
                  if (window.location.pathname === '/login') return;
                  router.push('/login?target=' + encodeURIComponent(window.location.href));
                }{
        
                  const result = await checkIfUserRegisteredOnJP(userId); 
                  if (result.exists) {
                    router.push('job-portal/recruiter-dashboard');
                  } else {
                    router.push('job-portal/register/recruiter');
                  }
                } 
              }}
            >
              Recruiter
            </Button>
          )}
          {isRecruiter && (
            <Button variant="contained" color="secondary" onClick={() => setForceFauLogin(true)}>
              Are You a Student?
            </Button>
          )}
          {showAdminButton && (
            <Button
              variant="contained"
              color="warning"
              fullWidth
              onClick={() => {
                if (!isLogIn) {
                  if (window.location.pathname === '/login') return;
                  router.push('/login?target=' + encodeURIComponent(window.location.href));
                } else {
                  router.push('job-portal/register/admin');
                }
              }}
            >
              Admin
            </Button>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
};

export default JobPortal;
