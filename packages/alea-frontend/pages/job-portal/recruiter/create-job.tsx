import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Container,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  createJobPost,
  getJobCategories,
  getJobPosts,
  getRecruiterProfile,
  JobCategoryInfo,
  updateJobPost,
} from '@stex-react/api';
import { Edit, Group } from '@mui/icons-material';
import { CURRENT_TERM } from '@stex-react/utils';

const steps = ['Training Details', 'Offer Details', 'Eligibility Criteria'];

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
          sx={{ bgcolor: 'white' }}
        >
          <MenuItem value="Masters">Masters</MenuItem>
          <MenuItem value="Bachelors">Bachelors</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Target Year"
        fullWidth
        margin="normal"
        name="targetYears"
        value={formData.targetYears}
        onChange={handleChange}
        sx={{ bgcolor: 'white' }}
      />
      <TextField
        type="datetime-local"
        label="Application Deadline"
        fullWidth
        InputLabelProps={{ shrink: true }}
        margin="normal"
        name="applicationDeadline"
        sx={{ bgcolor: 'white' }}
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
        sx={{ bgcolor: 'white' }}
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
          //   onChange={(e) => handleChange({ target: { name: 'currency', value: e.target.value } })}
          onChange={handleChange}
          sx={{ bgcolor: 'white' }}
          MenuProps={{ disablePortal: true }}
        >
          <MenuItem value="Euro per month">EURO per month</MenuItem>
          <MenuItem value="USD per month">USD per month</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Stipend"
        fullWidth
        margin="normal"
        name="stipend"
        value={formData.stipend}
        onChange={handleChange}
        sx={{ bgcolor: 'white' }}
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
        sx={{ bgcolor: 'white' }}
      />
    </Box>
  );
};

const JobDescriptionsForm = ({ formData, handleChange }) => {
  console.log({ formData });
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Job Descriptions
      </Typography>
      <TextField
        label="Session"
        fullWidth
        margin="normal"
        name="session"
        value={formData.session}
        onChange={handleChange}
        disabled
        sx={{
          bgcolor: 'white',
        }}
      />
      <TextField
        label="Job Title"
        fullWidth
        margin="normal"
        name="jobTitle"
        value={formData.jobTitle}
        onChange={handleChange}
        sx={{
          bgcolor: 'white',
        }}
      />
      <TextField
        label="Location "
        fullWidth
        margin="normal"
        name="trainingLocation"
        value={formData.trainingLocation}
        onChange={handleChange}
        sx={{
          bgcolor: 'white',
        }}
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
        sx={{
          bgcolor: 'white',
        }}
        placeholder="Enter the job description here..."
      />
    </Box>
  );
};

const JobPostDialog = ({ open, handleClose, jobData, handleSave }) => {
  const [formData, setFormData] = useState(jobData || {});
  console.log('ab', formData);
  console.log({ jobData });
  useEffect(() => {
    setFormData(jobData || {});
  }, [jobData]);
  const handleChange = (e) => {
    console.log('eTarget', e.target);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    handleSave(formData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" sx={{ zIndex: 2004, p: 20 }}>
      <DialogTitle>{'Edit Job Post'}</DialogTitle>
      <DialogContent>
        <JobDescriptionsForm formData={formData} handleChange={handleChange} />
        <OfferDetailsForm formData={formData} handleChange={handleChange} />
        <EligibilityForm formData={formData} handleChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const JobList = ({ recruiter }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobPosts, setJobPosts] = useState([]);
  console.log({ recruiter });
  useEffect(() => {
    const fetchJobs = async () => {
      const jobs = await getJobPosts(recruiter?.organizationId);
      console.log('abdg', jobs);
      setJobPosts(jobs);
    };
    fetchJobs();
  }, [recruiter]);
  console.log({ jobPosts });
  const handleEdit = (job) => {
    setSelectedJob(job);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedJob(null);
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async (updatedJob) => {
    setLoading(true);

    try {
      if (selectedJob) {
        await updateJobPost(updatedJob);
      } else {
        await createJobPost(updatedJob);
      }

      const jobs = await getJobPosts(recruiter.organizationId);
      setJobPosts(jobs);
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <CircularProgress sx={{ mt: 10 }} />;
  }
  return (
    <Box padding={4}>
      <Typography variant="h4" p={4}>
        Your Job Postings
      </Typography>

      {!jobPosts || jobPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            You have not created any jobs yet. Start by creating one!
          </Typography>
        </Box>
      ) : (
        <List
          sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 2 }}
        >
          {jobPosts.map((job) => (
            <ListItem
              key={job.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #eee',
                py: 2,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {job.jobTitle}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location: {job.trainingLocation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="error">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton color="primary" onClick={() => handleEdit(job)}>
                  <Edit />
                </IconButton>

                {/* <IconButton>
                  <Badge badgeContent={job.applicantCount} color="error">
                    <Group />
                  </Badge>
                </IconButton> */}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      <JobPostDialog
        open={openDialog}
        handleClose={handleClose}
        jobData={selectedJob}
        handleSave={handleSave}
      />
    </Box>
  );
};

const JobPostPage = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalJobPosts, setTotalJobPosts] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobCategories, setJobCategories] = useState<JobCategoryInfo[]>([]);
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('');
  const [selectedJobCategoryId, setSelectedJobCategoryId] = useState<number>(null);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const recruiterData = await getRecruiterProfile();
      setRecruiter(recruiterData);

      if (recruiterData?.organizationId) {
        const jobPosts = await getJobPosts(recruiterData.organizationId);
        setTotalJobPosts(jobPosts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobPostFormData({ ...jobPostFormData, [name]: value });
  };

  useEffect(() => {
    const fetchJobCategoryData = async () => {
      try {
        setLoading(true);
        const res = await getJobCategories(CURRENT_TERM);
        setJobCategories(res);
      } catch (error) {
        console.error('Error fetching job categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobCategoryData();
  }, []);

  //   const handleJobCategoryChange = (event: any) => {
  //     setSelectedJobCategory(event.target.value);
  //   };
  const handleJobCategoryChange = (event: any) => {
    const selectedId = event.target.value;
    setSelectedJobCategoryId(Number(selectedId));
    const selectedJob = jobCategories.find((job) => job.id === selectedId);
    if (selectedJob) {
      setSelectedJobCategory(selectedJob.jobCategory);
    }
  };
  useEffect(() => {
    if (selectedJobCategory) {
      setJobPostFormData((prevData) => ({
        ...prevData,
        session: `${selectedJobCategory}(${CURRENT_TERM})`,
      }));
      setIsFormDisabled(false);
    }
  }, [selectedJobCategory]);
  const handleNext = async () => {
    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
    } else {
      const jobPostPayload = {
        ...jobPostFormData,
        JobCategoryId: selectedJobCategoryId,
        organizationId: recruiter?.organizationId,
      };

      if (!selectedJob) {
        setIsFormDisabled(true);
        setLoading(true);
        await createJobPost(jobPostPayload);
      } else {
        await updateJobPost({ ...jobPostPayload, id: selectedJob.id });
      }

      setSelectedJob(null);
      fetchData();
      setIsFormDisabled(false);
      setLoading(false);
      alert('New job created!');
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setJobPostFormData(job);
    setActiveStep(0);
  };

  console.log({ jobCategories });
  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: 'auto',
        mt: 1,
        textAlign: 'center',
        borderRadius: '40px',
        bgcolor: '#f2f2f2',
        p: '40px 80px',
      }}
    >
      <Box sx={{ backgroundColor: '#ebecf0', borderRadius: '16px', padding: '16px', mb: '10px' }}>
        <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2, bgcolor: 'white' }}>
          <InputLabel id="job-category-select-label">Select Job Category</InputLabel>
          <Select
            labelId="job-category-select-label"
            value={selectedJobCategory}
            onChange={handleJobCategoryChange}
            label="Select Job Category"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
              '& .MuiSelect-icon': {
                right: 8,
              },
            }}
          >
            {jobCategories.map((job, index) => (
              <MenuItem key={index} value={job.id}>
                {job.jobCategory}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          bgcolor: '#ededed',
          p: 5,
          borderRadius: '20px',
        }}
      >
        {' '}
        {isFormDisabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(64, 56, 64, 0.2)', // Translucent overlay
              borderRadius: '20px',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading && (
              <Box>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}
        <Typography variant="h4" fontWeight="bold">
          {selectedJob ? 'Update Job Post' : 'Create a New Job Post'}
        </Typography>
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 4 }}>
          {['Job Descriptions', 'Offer Details', 'Eligibility'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 3 }}>
          {activeStep === 0 && (
            <JobDescriptionsForm formData={jobPostFormData} handleChange={handleChange} />
          )}
          {activeStep === 1 && (
            <OfferDetailsForm formData={jobPostFormData} handleChange={handleChange} />
          )}
          {activeStep === 2 && (
            <EligibilityForm formData={jobPostFormData} handleChange={handleChange} />
          )}
        </Box>
        {/* Buttons */}
        <Grid container justifyContent="space-between" sx={{ mt: 4 }}>
          <Button onClick={() => router.push('/dashboard')} variant="outlined">
            Cancel
          </Button>
          <Box>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 2 }}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} variant="contained">
              {activeStep === 2 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Grid>
      </Box>
      <JobList recruiter={recruiter} />
    </Box>
  );
};
const CreateJob = () => {
  return <JpLayoutWithSidebar role="recruiter">{<JobPostPage />}</JpLayoutWithSidebar>;
};

export default CreateJob;
