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

  useEffect(() => {
    const fetchAppliedJobs = async () => {
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
    await updateJobApplication({ ...job, applicantAction: 'REJECT_OFFER' });
    setAppliedJobs((prevJobs) =>
      prevJobs.map((j) => (j.id === job.id ? { ...j, applicantAction: 'REJECT_OFFER' } : j))
    );
  };

  const filteredJobs = appliedJobs.filter((job) => {
    switch (filter) {
      case 'ALL':
        return true;
      case 'PENDING':
        return job.applicationStatus?.toUpperCase() === 'APPLIED';
      case 'ON HOLD':
        return job.applicationStatus?.toUpperCase() === 'OFFERED' && !job.applicantAction;
      case 'ACCEPTED':
        return job.applicationStatus?.toUpperCase() === 'ACCEPTED';
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
            variant={filter === 'ACCEPTED' ? 'contained' : 'outlined'}
            onClick={() => setFilter('ACCEPTED')}
          >
            ACCEPTED
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
            <TableBody>
              {filteredJobs.map((jobApplication) => (
                <TableRow key={jobApplication.id} hover>
                  <TableCell align="center">{jobApplication.index}</TableCell>
                  <TableCell align="center">{jobApplication.companyName}</TableCell>
                  <TableCell align="center">{jobApplication.jobTitle}</TableCell>
                  <TableCell align="center">
                    {jobApplication.applicationStatus === 'OFFERED' ? (
                      <Chip label="Offer Received" color="success" icon={<CheckCircle />} />
                    ) : jobApplication.applicationStatus === 'ACCEPTED' ? (
                      <Chip label="Application Accepted" color="primary" icon={<CheckCircle />} />
                    ) : jobApplication.applicationStatus === 'REJECTED' ? (
                      <Chip label="Application Rejected" color="error" icon={<Cancel />} />
                    ) : (
                      <Chip label="Pending Review" color="warning" icon={<PendingActions />} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip
                        title={
                          jobApplication.applicationStatus !== 'OFFERED'
                            ? 'Action not available until an offer is made'
                            : 'Accept the offer'
                        }
                      >
                        <span>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAcceptOffer(jobApplication)}
                            disabled={
                              jobApplication.applicationStatus !== 'OFFERED' ||
                              jobApplication.applicantAction === 'ACCEPT_OFFER' ||
                              jobApplication.applicantAction === 'REJECT_OFFER'
                            }
                          >
                            {jobApplication.applicantAction === 'ACCEPT_OFFER'
                              ? 'Offer Accepted'
                              : 'Accept Offer'}
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          jobApplication.applicationStatus !== 'OFFERED'
                            ? 'Action not available until an offer is made'
                            : 'Reject the offer'
                        }
                      >
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRejectOffer(jobApplication)}
                            disabled={
                              jobApplication.applicationStatus !== 'OFFERED' ||
                              jobApplication.applicantAction === 'ACCEPT_OFFER' ||
                              jobApplication.applicantAction === 'REJECT_OFFER'
                            }
                          >
                            {jobApplication.applicantAction === 'REJECT_OFFER'
                              ? 'Offer Rejected'
                              : 'Reject Offer'}
                          </Button>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
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
