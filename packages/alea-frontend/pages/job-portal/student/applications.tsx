// import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
// import { AppliedJobs } from '../applications';

// const Applications = () => {
//   return <JpLayoutWithSidebar role="student">{<AppliedJobs />}</JpLayoutWithSidebar>;
// };

// export default Applications;

import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  ExpandLess,
  ExpandMore,
  CheckCircle,
  Cancel,
  PendingActions,
  Pause,
} from '@mui/icons-material';
import {
  getJobApplicationsByUserId,
  getJobPostById,
  getOrganizationProfile,
  updateJobApplication,
} from '@stex-react/api';

const Applications = () => {
  const [sortOrder, setSortOrder] = useState('newest');
  const [companySortOrder, setCompanySortOrder] = useState('asc');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      setLoading(true);

      try {
        const appliedJobsList = await getJobApplicationsByUserId();
        const jobPosts = await Promise.all(
          appliedJobsList.map((job) => getJobPostById(job?.jobPostId))
        );

        const organizationIds = [...new Set(jobPosts.map((post) => post.organizationId))];
        const organizations = await Promise.all(
          organizationIds.map((id) => getOrganizationProfile(id))
        );

        const enrichedJobs = appliedJobsList.map((job, index) => {
          const jobPost = jobPosts.find((post) => post.id === job.jobPostId);
          const organization = organizations.find((org) => org.id === jobPost?.organizationId);

          return {
            ...job,
            jobTitle: jobPost?.jobTitle,
            companyName: organization?.companyName || 'Unknown Organization',
            index: index + 1,
          };
        });

        setAppliedJobs(enrichedJobs);
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  const handleCompanySort = () => {
    const sortedJobs = [...appliedJobs].sort((a, b) => {
      if (companySortOrder === 'asc') {
        return a.companyName.localeCompare(b.companyName);
      } else {
        return b.companyName.localeCompare(a.companyName);
      }
    });
    setCompanySortOrder(companySortOrder === 'asc' ? 'desc' : 'asc');
    setAppliedJobs(sortedJobs);
  };

  const handleAcceptOffer = async (job) => {
    await updateJobApplication({
      ...job,
      applicantAction: 'ACCEPT_OFFER',
      applicationStatus: 'OFFER_ACCEPTED',
    });
    setAppliedJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === job.id
          ? { ...j, applicantAction: 'ACCEPT_OFFER', applicationStatus: 'OFFER_ACCEPTED' }
          : j
      )
    );
  };

  const handleRejectOffer = async (job) => {
    await updateJobApplication({
      ...job,
      applicantAction: 'REJECT_OFFER',
      applicationStatus: 'OFFER_REJECTED',
    });
    setAppliedJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === job.id
          ? { ...j, applicantAction: 'REJECT_OFFER', applicationStatus: 'OFFER_REJECTED' }
          : j
      )
    );
  };

  const filteredJobs = appliedJobs.filter((job) => {
    switch (filter) {
      case 'ALL':
        return true;
      case 'PENDING':
        return job.applicationStatus?.toUpperCase() === 'APPLIED';
      case 'ON HOLD':
        return job.applicationStatus?.toUpperCase() === 'ON_HOLD';
      case 'SHORTLISTED FOR INTERVIEW':
        return job.applicationStatus?.toUpperCase() === 'SHORTLISTED_FOR_INTERVIEW';
      case 'REJECTED':
        return job.applicationStatus?.toUpperCase() === 'REJECTED';
      case 'OFFERED':
        return (
          job.applicationStatus?.toUpperCase() === 'OFFERED' ||
          job.applicationStatus?.toUpperCase() === 'OFFER_ACCEPTED' ||
          job.applicationStatus?.toUpperCase() === 'OFFER_REJECTED'
        );

      default:
        return true;
    }
  });

  return (
    <Box padding={10}>
      <Paper sx={{ bgcolor: 'rgb(249, 249, 249)', p: 5 }}>
        <Box display="flex" justifyContent="center" gap={2} mb={2}>
          <Button
            variant={filter === 'ALL' ? 'contained' : 'outlined'}
            onClick={() => setFilter('ALL')}
          >
            ALL
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'contained' : 'outlined'}
            onClick={() => setFilter('PENDING')}
          >
            PENDING
          </Button>
          <Button
            variant={filter === 'ON HOLD' ? 'contained' : 'outlined'}
            onClick={() => setFilter('ON HOLD')}
          >
            ON HOLD
          </Button>
          <Button
            variant={filter === 'SHORTLISTED FOR INTERVIEW' ? 'contained' : 'outlined'}
            onClick={() => setFilter('SHORTLISTED FOR INTERVIEW')}
          >
            ACCEPTED
          </Button>
          <Button
            variant={filter === 'OFFERED' ? 'contained' : 'outlined'}
            onClick={() => setFilter('OFFERED')}
          >
            OFFERED
          </Button>
          <Button
            variant={filter === 'REJECTED' ? 'contained' : 'outlined'}
            onClick={() => setFilter('REJECTED')}
          >
            REJECTED
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <b>No.</b>
                </TableCell>
                <TableCell align="center">
                  <b>Date Applied</b>
                </TableCell>
                <TableCell align="center">
                  <b>Company</b>
                  <IconButton onClick={handleCompanySort} size="small">
                    {companySortOrder === 'asc' ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <b>Position</b>
                </TableCell>
                <TableCell align="center">
                  <b>Status</b>
                </TableCell>
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <TableBody>
                {filteredJobs.map((jobApplication) => (
                  <TableRow key={jobApplication.id} hover>
                    <TableCell align="center">{jobApplication.index}</TableCell>
                    <TableCell align="center">
                      {new Date(jobApplication.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">{jobApplication.companyName}</TableCell>
                    <TableCell align="center">{jobApplication.jobTitle}</TableCell>
                    <TableCell align="center">
                      {jobApplication.applicationStatus === 'OFFERED' ||
                      jobApplication.applicationStatus === 'OFFER_ACCEPTED' ||
                      jobApplication.applicationStatus === 'OFFER_REJECTED' ? (
                        <Chip label="Offer Received" color="success" icon={<CheckCircle />} />
                      ) : jobApplication.applicationStatus === 'SHORTLISTED_FOR_INTERVIEW' ? (
                        <Chip
                          label="Shortlisted For Interview "
                          color="primary"
                          icon={<CheckCircle />}
                        />
                      ) : jobApplication.applicationStatus === 'REJECTED' ? (
                        <Chip label="Application Rejected" color="error" icon={<Cancel />} />
                      ) : jobApplication.applicationStatus === 'ON_HOLD' ? (
                        <Chip
                          label="Application Kept On Hold"
                          sx={{
                            bgcolor: '#806BE7',
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' },
                          }}
                          icon={<Pause />}
                        />
                      ) : (
                        <Chip label="Pending Review" color="warning" icon={<PendingActions />} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAcceptOffer(jobApplication)}
                            disabled={
                              (jobApplication.applicationStatus !== 'OFFERED' &&
                                jobApplication.applicationStatus !== 'OFFER_REJECTED') ||
                              jobApplication.applicantAction === 'ACCEPT_OFFER'
                            }
                          >
                            {jobApplication.applicantAction === 'ACCEPT_OFFER'
                              ? 'Offer Accepted'
                              : 'Accept Offer'}
                          </Button>
                        </span>

                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRejectOffer(jobApplication)}
                            disabled={
                              (jobApplication.applicationStatus !== 'OFFERED' &&
                                jobApplication.applicationStatus !== 'OFFER_ACCEPTED') ||
                              jobApplication.applicantAction === 'REJECT_OFFER'
                            }
                          >
                            {jobApplication.applicantAction === 'REJECT_OFFER'
                              ? 'Offer Rejected'
                              : 'Reject Offer'}
                          </Button>
                        </span>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const Application = () => {
  return <JpLayoutWithSidebar role="student">{<Applications />}</JpLayoutWithSidebar>;
};

export default Application;
