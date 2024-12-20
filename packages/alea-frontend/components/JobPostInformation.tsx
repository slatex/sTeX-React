import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { CURRENT_TERM, PRIMARY_COL } from '@stex-react/utils';
import { createJobPost, getRecruiterProfile } from '@stex-react/api';

const steps = ['Training Details', 'Offer Details', 'Eligibility'];

const JobPostInformation = ({ jobTypeId, onClose ,setCurrentView ,selectedJobTypeName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    session: `${selectedJobTypeName} (${CURRENT_TERM})`,
    jobTitle: '',
    trainingLocation: '',
    applicationDeadline: '',
    currency: '',
    stipend: '',
    facilities: '',
    targetYears: '',
    openPositions: '',
    qualification: '',
    jobDescription: '',
  });

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      const recruiterProfileData = await getRecruiterProfile();
      const organizationId = recruiterProfileData[0]?.organizationId;
      await createJobPost({ ...formData, jobTypeId, organizationId });
     
      onClose();
      setActiveStep(0); 
      setCurrentView('jobList');
    }
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Box
      sx={{
        // width: "100%",
        // height: "100vh",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f6f9',
      }}
    >
      <Card
        sx={{
          width: '100%',
          boxShadow: 4,
          borderRadius: 3,
          backgroundColor: '#ffffff',
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
            Job-Post Info
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Training Details
                </Typography>
                <TextField
                  label="Session"
                  fullWidth
                  margin="normal"
                  name="session"
                  value={formData.session}
                  onChange={handleChange}
                  disabled
                />
                <TextField
                  label="Job Title"
                  fullWidth
                  margin="normal"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
                <TextField
                  label="Location of Training"
                  fullWidth
                  margin="normal"
                  name="trainingLocation"
                  value={formData.trainingLocation}
                  onChange={handleChange}
                />
                <TextField
                  label="Job Description"
                  fullWidth
                  margin="normal"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Enter the job description here..."
                />
              </Box>
            )}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Offer Details
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="currency">Currency</InputLabel>
                  <Select
                    labelId="currency"
                    label="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <MenuItem value="INR per month">EURO per month</MenuItem>
                    <MenuItem value="USD per month">USD per month</MenuItem>
                    <MenuItem value="Euro per month">INR per month</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Stipend"
                  fullWidth
                  margin="normal"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                />
                <TextField
                  label="Other Facilities"
                  fullWidth
                  margin="normal"
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Eligibility
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="qualification-year">Qualification</InputLabel>
                  <Select
                    labelId="qualification-year"
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  >
                    <MenuItem value="Bachelors">Bachelors</MenuItem>
                    <MenuItem value="Masters">Masters</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Target Year"
                  fullWidth
                  margin="normal"
                  name="targetYears"
                  value={formData.targetYears}
                  onChange={handleChange}
                />

                <TextField
                  type="datetime-local"
                  label="Application Deadline"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  margin="normal"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    if (selectedDate < new Date()) {
                      alert('Deadline must be in the future.');
                      setFormData({ ...formData, applicationDeadline: '' });
                    } else {
                      setFormData({ ...formData, applicationDeadline: e.target.value });
                    }
                  }}
                />

                <TextField
                  label="Number of Intended Offers"
                  fullWidth
                  margin="normal"
                  name="openPositions"
                  value={formData.openPositions}
                  onChange={handleChange}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Tooltip title="Back" arrow>
              <IconButton
  disabled={activeStep === 0}
  onClick={handleBack}
  sx={{
    backgroundColor: PRIMARY_COL,
    color: "white",
    borderRadius: '50%',
    padding: '12px',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      color:PRIMARY_COL,
      transform: 'scale(1.1)', // Slight scaling effect
    },
  }}
>
  <ArrowBack />
</IconButton>

                {/* <IconButton
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{
                    // backgroundColor: '#e0e0e0',
backgroundColor:PRIMARY_COL,
                    color:"white",
                    // color: '#757575',
                    // color: "primary",
                    borderRadius: '50%',
                    padding: '12px',
                    '&:hover': {
                      // backgroundColor: '#bdbdbd',
                      // color: '#212121',
                      // boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                      // backgroundColor: '#1565c0',
                      // boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <ArrowBack />
                </IconButton> */}
              </Tooltip>

              <Tooltip title={activeStep === steps.length - 1 ? 'Submit' : 'Next'} arrow>
                {(activeStep===steps.length-1)?
                <Button     onClick={handleNext}
                variant="outlined" sx={{ '&:hover': {
                  backgroundColor: 'primary.main', // Contained background color
                  color: 'white', // Change text color for contained variant
                }}}>Submit</Button>:
                 <IconButton
    onClick={handleNext}
    sx={{
      backgroundColor: PRIMARY_COL,
      color: "white",
      borderRadius: '50%',
      padding: '12px',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        color:PRIMARY_COL,
        transform: 'scale(1.1)', // Slight scaling effect
      },
    }}>
      <ArrowForward/>
    </IconButton>}
  {/* <IconButton
    onClick={handleNext}
    sx={{
      backgroundColor: PRIMARY_COL,
      color: "white",
      borderRadius: '50%',
      padding: '12px',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        color:PRIMARY_COL,
        transform: 'scale(1.1)', // Slight scaling effect
      },
    }}
//     sx={{
//       // backgroundColor: '#1976d2',
//       // backgroundColor: '#e0e0e0',
// bgcolor:PRIMARY_COL,
// color:"white",
//       // color: '#ffffff',
//       // color : "primary",
//       padding: activeStep === steps.length - 1 ? '2px 10px' : '3px',
//       borderRadius: activeStep === steps.length - 1 ? '6px' : '50%',
//       fontWeight: activeStep === steps.length - 1 ? 'bold' : 'normal',
//       fontSize: activeStep === steps.length - 1 ? '14px' : 'inherit',
//       '&:hover': {
//         backgroundColor: '#1565c0',
//         boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
//         transform: 'scale(1.05)',
//       },
//     }}
  >
    {activeStep === steps.length - 1 ? 'Submit' : <ArrowForward />}
  </IconButton> */}
</Tooltip>

            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JobPostInformation;
