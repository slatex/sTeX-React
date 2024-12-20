import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Tooltip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Work, Email, Business, Save } from '@mui/icons-material';
import {
  canAccessResource,
  getJobPost,
  getOrganizationId,
  getOrganizationProfile,
  getRecruiterProfile,
  OrganizationData,
  RecruiterAndOrgData,
  RecruiterData,
  updateOrganizationProfile,
  upDateRecruiterProfile,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import RecruiterJobDialog from 'packages/alea-frontend/components/RecruiterJobDialog';
import { CreatedJobs } from 'packages/alea-frontend/components/CreatedJobs';

const RecruiterProfileDialog = ({
  isOpen,
  setIsOpen,
  recruiterAndOrgData,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  recruiterAndOrgData: RecruiterAndOrgData;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    mobile: '',
    altMobile: '',
  });

  const steps = ['Recruiter Details', 'Organization Information'];

  const {
    name,
    email,
    companyName,
    position,
    mobile,
    altMobile,
    incorporationYear,
    isStartup,
    about,
    companyType,
    officeAddress,
    officePincode,
    website,
  } = recruiterAndOrgData;
  interface RecruiterOrganizationFormState {
    recruiterDetails: RecruiterData;
    organizationInfo: OrganizationData;
  }
  const [formData, setFormData] = useState<RecruiterOrganizationFormState>({
    recruiterDetails: {
      email: email,
      name: name,
      position: position,
      mobile: mobile,
      altMobile: altMobile,
    },
    organizationInfo: {
      companyName: companyName,
      incorporationYear: incorporationYear,
      isStartup: isStartup,
      website: website,
      about: about,
      companyType: companyType,
      officeAddress: officeAddress,
      officePincode: officePincode,
    },
  });

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value,
      },
    });
  };

  const validateFields = () => {
    const errors = {
      email: '',
      mobile: '',
      altMobile: '',
    };
    if (!formData.recruiterDetails.email || !/\S+@\S+\.\S+/.test(formData.recruiterDetails.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.recruiterDetails.mobile || !/^\d{10}$/.test(formData.recruiterDetails.mobile)) {
      errors.mobile = 'Enter a valid 10-digit mobile number.';
    }
    if (
      formData.recruiterDetails.altMobile &&
      !/^\d{10}$/.test(formData.recruiterDetails.altMobile)
    ) {
      errors.altMobile = 'Enter a valid 10-digit mobile number or leave it empty.';
    }

    setValidationErrors(errors);
    return !errors.email && !errors.mobile && !errors.altMobile;
  };

  const handleNext = async () => {
    if (!validateFields()) {
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      const id = await getOrganizationId(formData.organizationInfo.companyName);
      await updateOrganizationProfile(formData.organizationInfo, id);
      await upDateRecruiterProfile({
        ...formData.recruiterDetails,
        organizationId: id,
      });
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveStep(0);
  };

  return (
    <div className="recruiter-dashboard">
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{steps[activeStep]}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <div style={{ marginTop: '20px' }}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.email}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
              <TextField
                label="Name"
                name="name"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.name}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
              />
              <TextField
                label="Designation"
                name="position"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.position}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
              />
              <TextField
                label="Mobile"
                name="mobile"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.mobile}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
                error={!!validationErrors.mobile}
                helperText={validationErrors.mobile}
              />
              <TextField
                label="Alternative Mobile"
                name="altMobile"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.altMobile}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
                error={!!validationErrors.altMobile}
                helperText={validationErrors.altMobile}
              />
            </div>
          )}

          {activeStep === 1 && (
            <div style={{ marginTop: '20px' }}>
              <TextField
                label="Company Name"
                name="companyName"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.companyName}
                onChange={(e) => handleChange(e, 'organizationInfo')}
                disabled
              />
              <TextField
                label="Incorporation Year"
                name="incorporationYear"
                type="number"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.incorporationYear}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Startup"
                name="isStartup"
                select
                fullWidth
                margin="normal"
                value={formData.organizationInfo.isStartup}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                label="Website"
                name="website"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.website}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="About"
                name="about"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={formData.organizationInfo.about}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Type"
                name="companyType"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.companyType}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Office Address"
                name="officeAddress"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.officeAddress}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Office Pincode"
                name="officePincode"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.officePincode}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
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
              Back
            </Button>
          )}
          <Button onClick={handleNext} variant="contained" color="primary">
            {activeStep === steps.length - 1 ? 'Submit' : 'Save and Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const RecruiterDashboard = () => {
  const [recruiter, setRecruiter] = useState<RecruiterData>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    companyName: '',
    incorporationYear: '',
    isStartup: '',
    about: '',
    website: '',
    companyType: '',
    officeAddress: '',
    officePincode: '',
  });
  const [loading, setLoading] = useState(true);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);

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

  const fetchRecruiterAndOrgData = async () => {
    try {
      setLoading(true);
      const res = await getRecruiterProfile();
      const recruiterData = res[0];
      setRecruiter(res[0]);
      if (recruiterData.hasDefinedOrg === 0) {
        setIsOpen(true);
        await upDateRecruiterProfile({ ...recruiterData, hasDefinedOrg: 1 });
      }

      if (recruiterData?.organizationId) {
        const res = await getOrganizationProfile(recruiterData.organizationId);
        const orgData = res[0];
        setOrganizationData(orgData);
      }
    } finally {
      setLoading(false);
    }
  };


    // const fetchJobPostData = async () => {
    //   try {
    //     setLoading(true);
        
    //     const recruiterProfileData = await getRecruiterProfile();
    //     const organizationId = recruiterProfileData[0]?.organizationId;
    //     const jobPostData = await getJobPost(organizationId);
    //     console.log("jobpost data" , jobPostData)
    //   } catch (error) {
    //     console.error('Error fetching admin data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
  useEffect(() => {
    if (accessCheckLoading) return;
    fetchRecruiterAndOrgData();
    // fetchJobPostData();
  }, [accessCheckLoading, isOpen]);

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
  const { name, email, position, hasDefinedOrg } = recruiter;

  const {
    companyName,
    incorporationYear,
    isStartup,
    about,
    website,
    companyType,
    officeAddress,
    officePincode,
  } = organizationData;
  const formData: RecruiterAndOrgData = { ...recruiter, ...organizationData };

  return (
    <MainLayout title="Recruiter Dashboard | Job Portal">
      {(!hasDefinedOrg || isOpen) && (
        <RecruiterProfileDialog
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          recruiterAndOrgData={formData}
        />
      )}

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
        <Box
          sx={{
            display: 'flex',
            gap: '16px',
            ml: '30px', 
          }}
        
        >
          <Button
            variant="contained"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsJobDialogOpen(true);
            }}
          >
Create JobPost          </Button>
          <RecruiterJobDialog open={isJobDialogOpen} onClose={() => setIsJobDialogOpen(false)} />
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                      <Card sx={{ boxShadow: 6, mb: 4 ,px: { xs: 2, md: 4 }, py: 2 }}>
          
          <Grid container spacing={4} >
            <Grid item xs={12} md={6}>
              {/* <Card sx={{ borderRadius: 3, boxShadow: 3 }}> */}
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
                    <strong>Position:</strong> {position}
                  </Typography>
                  <Typography>
                    <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
                    <strong>Email:</strong> {email}
                  </Typography>
                  <Typography>
                    <strong>Mobile:</strong> {recruiter.mobile || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Alternate Mobile:</strong> {recruiter.altMobile || 'N/A'}
                  </Typography>
                </CardContent>
              {/* </Card> */}
            </Grid>

            <Grid item xs={12} md={6}>
              {/* <Card sx={{ borderRadius: 3, boxShadow: 3 }}> */}
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Business />
                    </Avatar>
                    <Typography variant="h6">Organization Details</Typography>
                  </Box>
                  <Typography>
                    <strong>Organization:</strong> {companyName}
                  </Typography>

                  <Typography>
                    <strong>Startup:</strong> {isStartup}
                  </Typography>
                  <Typography>
                    <strong>companyType:</strong> {companyType || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Incorporation Year:</strong> {incorporationYear || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Website</strong> {website || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>About</strong> {about || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Office Address:</strong> {officeAddress || 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Office Pincode:</strong> {officePincode || 'N/A'}
                  </Typography>
                </CardContent>
              {/* </Card> */}
            </Grid>
          </Grid>

          </Card>
          <Card sx={{ boxShadow: 6, mb: 4 ,px: { xs: 2, md: 4 }, py: 2 }}>

<CardContent>
  <Typography variant="h5" gutterBottom>
    Created Jobs
  </Typography>

</CardContent>
<CreatedJobs/>
</Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default RecruiterDashboard;
