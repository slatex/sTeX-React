import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tooltip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import {
  canAccessResource,
  createJobType,
  deleteJobType,
  getJobType,
  JobTypeInfo,
  updateJobType,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import { Modal } from '@mui/base';
import dayjs from 'dayjs';

export function JobTypeDetails({ jobs, renderActions }) {
  console.log('jl', jobs);
  console.log({ renderActions });
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Job Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Internship Period</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <TableRow key={index}>
                <TableCell>{job.jobTypeName}</TableCell>
                <TableCell>
                  {job.startDate ? new Date(job.startDate).toLocaleDateString('en-GB') : 'N/A'}
                </TableCell>
                <TableCell>
                  {job.endDate ? new Date(job.endDate).toLocaleDateString('en-GB') : 'N/A'}
                </TableCell>
                <TableCell>{job.internshipPeriod || 'N/A'}</TableCell>
                {renderActions && <TableCell align="center">{renderActions(job)}</TableCell>}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No jobs created yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [jobType, setJobType] = useState<'Full-Time' | 'Internship'>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [internshipPeriod, setInternshipPeriod] = useState<string>(null);
  const [jobs, setJobs] = useState<JobTypeInfo[]>([]);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editJob, setEditJob] = useState<JobTypeInfo>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const instanceId = CURRENT_TERM;

  const router = useRouter();
  useEffect(() => {
    const checkAccess = async () => {
      setAccessCheckLoading(true);
      const hasAccess = await canAccessResource(ResourceName.JOB_PORTAL, Action.CREATE_JOB_TYPE, {
        instanceId: CURRENT_TERM,
      });
      if (!hasAccess) {
        alert('You do not have access to this page.');
        router.push('/job-portal');
        return;
      }
      setAccessCheckLoading(false);
    };

    checkAccess();
  }, []);
  const fetchJobTypeData = async () => {
    try {
      setLoading(true);
      const res = await getJobType(instanceId);
      console.log('response ', res);
      setJobs(res);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (accessCheckLoading) return;

    fetchJobTypeData();
  }, [accessCheckLoading]);

  const renderActions = (job) => (
    <>
      <IconButton onClick={() => handleEdit(job)} color="primary">
        <Edit />
      </IconButton>
      <IconButton onClick={() => deleteJob(job.id)} color="error">
        <Delete />
      </IconButton>
    </>
  );

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const handleJobTypeChange = (event) => {
    setJobType(event.target.value);
  };

  const handleUpdationoJobTypeChange = (event) => {
    setEditJob((prev) => ({
      ...prev,
      jobTypeName: event.target.value,
    }));
  };

  const handleDateChange = (type, value) => {
    let updatedStartDate = startDate;
    let updatedEndDate = endDate;
    console.log({ updatedStartDate });
    console.log({ value });
    if (type === 'start') {
      updatedStartDate = value;
      console.log({ updatedStartDate });
      setStartDate(value);
    } else if (type === 'end') {
      updatedEndDate = value;
      setEndDate(value);
    }

    if (updatedStartDate && updatedEndDate) {
      const start = new Date(updatedStartDate);
      const end = new Date(updatedEndDate);
      console.log({ end });
      if (start <= end) {
        const diffMonths =
          (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        setInternshipPeriod(`${diffMonths + 1} month${diffMonths + 1 > 1 ? 's' : ''}`);
      } else {
        setInternshipPeriod('');
      }
    }
  };
  const handleUpdationDateChange = (type, value) => {
    setEditJob((prev) => {
      const updatedStartDate = type === 'start' ? value : prev.startDate;
      const updatedEndDate = type === 'end' ? value : prev.endDate;
      console.log({ updatedStartDate });
      console.log({ updatedEndDate });
      const updatedJob = {
        ...prev,
        startDate: updatedStartDate,
        endDate: updatedEndDate,
      };
      if (updatedStartDate && updatedEndDate) {
        const start = new Date(updatedStartDate);
        const end = new Date(updatedEndDate);

        if (start <= end) {
          const diffMonths =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

          updatedJob.internshipPeriod = `${diffMonths + 1} month${diffMonths + 1 > 1 ? 's' : ''}`;
        } else {
          updatedJob.internshipPeriod = '';
        }
      }

      return updatedJob;
    });
  };
  const handleSubmit = async () => {
    const newJob = {
      jobType,
      startDate,
      endDate,
      internshipPeriod,
      instanceId,
    };

    try {
      await createJobType(newJob);
      fetchJobTypeData();
      setJobType(null);
      setStartDate(null);
      setEndDate(null);
      setInternshipPeriod(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving job type:', error);
    }
  };

  const handleEdit = (job: JobTypeInfo) => {
    const formattedEditJob = {
      ...job,
      startDate: job.startDate ? dayjs(job.startDate).format('YYYY-MM-DD') : null,
      endDate: job.endDate ? dayjs(job.endDate).format('YYYY-MM-DD') : null,
    };
    setEditJob(formattedEditJob);
    setModalOpen(true);
  };
  console.log({ editJob });

  const updateJob = async () => {
    try {
      const formattedEditJob = {
        ...editJob,
        startDate: editJob.startDate ? dayjs(editJob.startDate).format('YYYY-MM-DD') : null,
        endDate: editJob.endDate ? dayjs(editJob.endDate).format('YYYY-MM-DD') : null,
      };
      console.log({ formattedEditJob });
      if (
        formattedEditJob.jobTypeName === 'Full-Time' ||
        formattedEditJob.jobTypeName === 'full-name'
      ) {
        formattedEditJob.endDate = null;
        formattedEditJob.internshipPeriod = null;
      }
      const response = await updateJobType(formattedEditJob);
      setSnackbarOpen(true);
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === editJob.id ? { ...job, ...formattedEditJob } : job))
      );

      setModalOpen(false);
    } catch (error) {
      console.error('Error details:', error);
    }
  };
  const deleteJob = async (id: number) => {
    if (id) {
      try {
        const response = await deleteJobType(id);
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));

        setSnackbarOpen(true);
      } catch (error) {
        console.error('error occured in deleting');
      }
    }
  };

  if (accessCheckLoading || loading) {
    return <CircularProgress color="primary" />;
  }
  console.log({ jobs });
  return (
    <MainLayout title="Admin Dashboard | Job Portal">
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
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1">Create a job according to session</Typography>
      </Box>

      <Box sx={{ maxWidth: '960px', mx: 'auto', px: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Job Types" />
          <Tab label="Programmes & Courses" />
          <Tab label="Recruiter Org" />
        </Tabs>

        <Divider sx={{ mt: 2, mb: 4 }} />

        {activeTab === 0 && (
          <>
            <Card sx={{ boxShadow: 3, mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Create Job Types
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fill in the details to create a new job type.
                </Typography>

                <Grid container spacing={3} mt={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Job Type</InputLabel>
                      <Select
                        value={jobType}
                        onChange={handleJobTypeChange}
                        variant="outlined"
                        label="Job Type"
                      >
                        <MenuItem value="Internship">Internship</MenuItem>
                        <MenuItem value="Full-Time">Full-Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      value={startDate || ''}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                    />
                  </Grid>
                  {jobType === 'Internship' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          value={endDate || ''}
                          onChange={(e) => handleDateChange('end', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Internship Period"
                          value={internshipPeriod || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                <Box mt={3} textAlign="center">
                  <Tooltip title="Save job details" arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSubmit}
                      size="large"
                    >
                      Create Job Type
                    </Button>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            <Box>
              <Typography variant="h6" gutterBottom>
                Created Job Types
              </Typography>
              <JobTypeDetails jobs={jobs} renderActions={renderActions} />
            </Box>
          </>
        )}
      </Box>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            zIndex: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Edit Job
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={
                editJob?.jobTypeName === 'full-time' || editJob?.jobTypeName === 'Full-Time'
                  ? 'Full-Time'
                  : 'Internship'
              }
              onChange={handleUpdationoJobTypeChange}
              variant="outlined"
              label="Job Type"
            >
              <MenuItem value="Internship">Internship</MenuItem>
              <MenuItem value="Full-Time">Full-Time</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={editJob?.startDate}
            onChange={(e) => handleUpdationDateChange('start', e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          {!(editJob?.jobTypeName === 'full-time' || editJob?.jobTypeName === 'Full-Time') && (
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={editJob?.endDate}
              onChange={(e) => handleUpdationDateChange('end', e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
          {!(editJob?.jobTypeName === 'full-time' || editJob?.jobTypeName === 'Full-Time') && (
            <TextField
              fullWidth
              label="Internship Period"
              name="internshipPeriod"
              value={editJob?.internshipPeriod || ''}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              margin="normal"
            />
          )}
          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setModalOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={updateJob} variant="contained" color="primary" fullWidth>
              Save Changes
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Operation Successful!
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default AdminDashboard;
