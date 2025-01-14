import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, FormControl, IconButton, InputLabel, MenuItem, Select, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material';
import { createJobPost, getRecruiterProfile, InitialJobData, JobPostInfo, updateJobPost } from '@stex-react/api';
import { PRIMARY_COL } from '@stex-react/utils';
import { ArrowBack, ArrowForward } from '@mui/icons-material';



const HeaderWithStepper = ({ activeStep }) => {
  const steps = ['Training Details', 'Offer Details', 'Eligibility'];

  return (
    <Box>
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
    </Box>
  );
};


const FormActions = ({ activeStep, handleNext, handleBack, isLastStep }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
    <Tooltip title="Back" arrow>
      <IconButton
        disabled={activeStep === 0}
        onClick={handleBack}
        sx={{
          backgroundColor: PRIMARY_COL,
          color: 'white',
          borderRadius: '50%',
          padding: '12px',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            color: PRIMARY_COL,
            transform: 'scale(1.1)',
          },
        }}
      >
        <ArrowBack />
      </IconButton>
    </Tooltip>

    <Tooltip title={isLastStep ? 'Submit' : 'Next'} arrow>
      {isLastStep ? (
        <Button
          onClick={handleNext}
          variant="outlined"
          sx={{
            '&:hover': { backgroundColor: 'primary.main', color: 'white' },
          }}
        >
          Submit
        </Button>
      ) : (
        <IconButton
          onClick={handleNext}
          sx={{
            backgroundColor: PRIMARY_COL,
            color: 'white',
            borderRadius: '50%',
            padding: '12px',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              color: PRIMARY_COL,
              transform: 'scale(1.1)',
            },
          }}
        >
          <ArrowForward />
        </IconButton>
      )}
    </Tooltip>
  </Box>
);

const EligibilityForm = ({ formData, handleChange }) => {
  return (
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
            handleChange({ target: { name: 'applicationDeadline', value: '' } });
          } else {
            handleChange(e);
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
  );
};

const OfferDetailsForm = ({ formData, handleChange }) => {
  return (
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
          <MenuItem value="INR per month">INR per month</MenuItem>
          <MenuItem value="USD per month">USD per month</MenuItem>
          <MenuItem value="Euro per month">EURO per month</MenuItem>
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
  );
};


const TrainingDetailsForm = ({ formData, handleChange }) => {
  return (
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
  );
};


const JobPostInfoForm = ({ JobCategoryId, onClose, jobData, onUpdate }:{
  JobCategoryId:number;onClose:()=>void;jobData:InitialJobData;onUpdate:()=>Promise<void>;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [jobPostFormData, setJobPostFormData] = useState({
    session: '',
    jobTitle: '',
    trainingLocation: '',
    applicationDeadline: null,
    currency: '',
    stipend: null,
    facilities: '',
    targetYears: '',
    openPositions: null,
    qualification: '',
    jobDescription: '',
  });

  const isUpdateMode = !!jobData?.id;

  useEffect(() => {
    setJobPostFormData(jobData);
  }, [jobData]);

  const handleNext = async () => {
    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
    } else {
      const recruiterProfileData = await getRecruiterProfile();
      const organizationId = recruiterProfileData?.organizationId;
      const createJobPostData = { ...jobPostFormData, JobCategoryId, organizationId };
      const updateJobPostData = { ...jobPostFormData, id: jobData?.id, JobCategoryId, organizationId };

      if (!isUpdateMode) {
        await createJobPost(createJobPostData);
      } else {
        await updateJobPost(updateJobPostData);
      }
      onUpdate();
      onClose();
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobPostFormData({ ...jobPostFormData, [name]: value });
  };

  const isLastStep = activeStep === 2;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9' }}>
      <Card sx={{ width: '100%', boxShadow: 4, borderRadius: 3, backgroundColor: '#ffffff' }}>
        <CardContent>
          <HeaderWithStepper activeStep={activeStep} />

          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && <TrainingDetailsForm formData={jobPostFormData} handleChange={handleChange} />}
            {activeStep === 1 && <OfferDetailsForm formData={jobPostFormData} handleChange={handleChange} />}
            {activeStep === 2 && <EligibilityForm formData={jobPostFormData} handleChange={handleChange} />}
          </Box>

          <FormActions
            activeStep={activeStep}
            handleNext={handleNext}
            handleBack={handleBack}
            isLastStep={isLastStep}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default JobPostInfoForm;
