import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { JobTypeDetails } from '../pages/job-portal/admin-dashboard';
import { getJobType, JobTypeInfo } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';
import JobPostInformation from './JobPostInformation';

const RecruiterJobDialog = ({ open, onClose }) => {
  const [jobs, setJobs] = useState<JobTypeInfo[]>(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('jobList');
  const [selectedJobTypeId, setSelectedJobTypeId] = useState<number>(null);
  const [selectedJobTypeName, setSelectedJobTypeName] = useState(null);

  const handleJobSelect = (job) => {
    setCurrentView('jobDetails');
    setSelectedJobTypeId(job.id);
    setSelectedJobTypeName(job.jobTypeName);
  };

  const fetchJobTypeData = async () => {
    try {
      setLoading(true);
      const res = await getJobType(CURRENT_TERM);
      console.log('response ', res);
      setJobs(res);
      console.log(' jobs id ', jobs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobTypeData();
  }, []);

  const renderActions = (job) => (
    <Button variant="contained" color="primary" onClick={() => handleJobSelect(job)}>
      Post Job
    </Button>
  );

  if (loading) return;
  return (
    <div>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle></DialogTitle>
        <DialogContent>
          {currentView === 'jobList' && (
            <>
              <Typography variant="h6">Available Jobs - Ongoing Session</Typography>
              <JobTypeDetails jobs={jobs} renderActions={renderActions} />
            </>
          )}
          {currentView === 'jobDetails' && (
            <JobPostInformation jobTypeId={selectedJobTypeId} onClose={onClose} setCurrentView ={setCurrentView}  selectedJobTypeName ={selectedJobTypeName}
            />
          )}
        </DialogContent>
        <DialogActions>
          {currentView === 'jobDetails' && (
            <Button onClick={() => setCurrentView('jobList')} 
            
               variant="outlined" sx={{ '&:hover': {
                              backgroundColor: 'primary.main', 
                              color: 'white', 
                            }}}>
              Back
            </Button>
          )}
          {currentView === 'jobList' && (
            <Button onClick={onClose}
                 variant="outlined" sx={{ '&:hover': {
                              backgroundColor: 'primary.main', 
                              color: 'white', 
                            }}}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RecruiterJobDialog;
