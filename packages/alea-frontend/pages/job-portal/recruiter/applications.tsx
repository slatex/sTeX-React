import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Tooltip,
  Modal,
} from '@mui/material';
import {
  PersonAdd,
  Cancel,
  Pause,
  Visibility,
  FileOpen,
  Download,
  PauseCircle,
  Close,
  CloseOutlined,
  CloseRounded,
} from '@mui/icons-material';
import {
  ApplicantProfile,
  getJobApplicationsByJobPost,
  getJobPosts,
  getRecruiterProfile,
  getStudentProfileUsingUserId,
  updateJobApplication,
} from '@stex-react/api';
import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
import { RecruiterDashboard } from './dashboard';
import { PRIMARY_COL } from '@stex-react/utils';
import { getSocialIcon, ProfileCard } from './profile';
import Link from 'next/link';

const ActionButtons = ({ applicant, updateApplicant }) => {
  async function handleShortlistApplication(applicant: ApplicantProfile) {
    const application = {
      ...applicant,
      applicationStatus: 'SHORTLISTED_FOR_INTERVIEW',
      recruiterAction: 'SHORTLIST_FOR_INTERVIEW',
    };
    const res = await updateJobApplication(application);
    updateApplicant(application);
  }

  async function handleRejectApplication(applicant: ApplicantProfile) {
    const application = {
      ...applicant,
      applicationStatus: 'REJECTED',
      recruiterAction: 'REJECT',
    };
    const res = await updateJobApplication(application);
    updateApplicant(application);
  }
  async function handleKeepOnHoldApplication(applicant: ApplicantProfile) {
    const application = {
      ...applicant,
      applicationStatus: 'ON_HOLD',
      recruiterAction: 'ON_HOLD',
    };
    const res = await updateJobApplication(application);
    updateApplicant(application);
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Tooltip
        title={
          applicant.applicationStatus === 'SHORTLISTED_FOR_INTERVIEW'
            ? 'Shortlisted'
            : 'Shortlist for Interview'
        }
      >
        <span>
          <IconButton
            color="primary"
            onClick={() => handleShortlistApplication(applicant)}
            disabled={applicant.applicationStatus === 'SHORTLISTED_FOR_INTERVIEW'}
          >
            <PersonAdd />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={applicant.applicationStatus === 'ON_HOLD' ? 'On Hold' : 'Keep on Hold'}>
        <span>
          <IconButton
            color="warning"
            onClick={() => handleKeepOnHoldApplication(applicant)}
            disabled={applicant.applicationStatus === 'ON_HOLD'}
          >
            <PauseCircle />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={applicant.applicationStatus === 'REJECTED' ? 'Rejected' : 'Reject Applicant'}>
        <span>
          <IconButton
            color="error"
            onClick={() => handleRejectApplication(applicant)}
            disabled={applicant.applicationStatus === 'REJECTED'}
          >
            <Cancel />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

const SocialLinks = ({ socialLinks }) => {
  if (!socialLinks)
    return (
      <Typography variant="body2" color="textSecondary">
        No links available
      </Typography>
    );

  return (
    <Box>
      {Object.entries(JSON.parse(socialLinks)).map(([platform, url], index) => (
        <Tooltip key={index} title={platform.charAt(0).toUpperCase() + platform.slice(1)} arrow>
          <IconButton component="a" href={url ? String(url) : '#'} target="_blank">
            {getSocialIcon(platform)}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};
const ApplicantRow = ({ applicant, index, updateApplicant }) => {
  console.log({ applicant });
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleViewApplicant = (applicant) => {
    let profile = { ...applicant.studentProfile[0] };

    let socialLinks = profile?.socialLinks;
    let parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};

    profile.socialLinks = {
      linkedin: parsedSocialLinks.linkedin || 'N/A',
      github: parsedSocialLinks.github || 'N/A',
      twitter: parsedSocialLinks.twitter || 'N/A',
      ...parsedSocialLinks,
    };

    setSelectedProfile(profile);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };
  const handleDownloadResume = (applicant) => {
    alert('Download Functionality not active as of now');
  };
  return (
    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <Box sx={{ textAlign: 'left' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {applicant.studentProfile[0].name}
            </Typography>
            <IconButton color="primary" onClick={() => handleViewApplicant(applicant)}>
              <Visibility />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <Typography variant="body2" color="textSecondary">
              Status:
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="textSecondary">
              {applicant.applicationStatus || 'Pending'}
            </Typography>
          </Box>
        </Box>

        <Modal sx={{ zIndex: 2005 }} open={Boolean(selectedProfile)} onClose={handleCloseProfile}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#e0e0e0',
              maxWidth: '600px',
              maxHeight: '80vh',
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <IconButton
              onClick={handleCloseProfile}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1,
                bgcolor: '#f5f3f0',
              }}
            >
              <Cancel sx={{ color: 'red' }} />
            </IconButton>

            <Box
              sx={{
                overflowY: 'auto',
                paddingRight: 1,
              }}
            >
              <ProfileCard userType="student" profileData={selectedProfile} />
            </Box>
          </Box>
        </Modal>
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>{applicant?.jobPostTitle}</TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <SocialLinks socialLinks={applicant.studentProfile[0].socialLinks} />
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <ActionButtons applicant={applicant} updateApplicant={updateApplicant} />
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        {new Date(applicant.createdAt).toLocaleString()}
      </TableCell>
      {/* <TableCell sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Tooltip title="View Resume" arrow>
            <IconButton color="primary">
              <FileOpen />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Resume" arrow>
            <IconButton color="secondary">
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell> */}
      <TableCell sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Tooltip title="View Resume" arrow>
            <Link href={applicant?.studentProfile[0]?.resumeURL || '#'} passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer">
                <IconButton color="primary">
                  <FileOpen />
                </IconButton>
              </a>
            </Link>
          </Tooltip>

          <Typography variant="body2" color="textSecondary">
            |
          </Typography>

          <Tooltip title="Download Resume" arrow>
            <IconButton color="secondary" onClick={() => handleDownloadResume(applicant)}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};
const ApplicantTable = ({ loading, filteredApplicants, setFilteredApplicants }) => {
  const [sortBy, setSortBy] = useState('');
  const handleSort = (criteria) => {
    let sortedApplicants = [...filteredApplicants];
    if (criteria === 'date') {
      sortedApplicants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (criteria === 'name') {
      sortedApplicants.sort((a, b) =>
        a.studentProfile[0].name.localeCompare(b.studentProfile[0].name)
      );
    }
    setFilteredApplicants(sortedApplicants);
    setSortBy(criteria);
  };
  const updateApplicant = (updatedApplicant) => {
    setFilteredApplicants((prev) =>
      prev.map((applicant) => (applicant.id === updatedApplicant.id ? updatedApplicant : applicant))
    );
  };
  return (
    <Box>
      {loading ? (
        <CircularProgress />
      ) : filteredApplicants.length > 0 ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              sx={{
                bgcolor: sortBy === 'name' ? '#5A46C6' : '#806BE7',
                color: 'white',
                '&:hover': { bgcolor: '#5A46C6' },
              }}
              onClick={() => handleSort('name')}
            >
              Sort By Name
            </Button>

            <Button
              sx={{
                bgcolor: sortBy === 'date' ? '#5A46C6' : '#806BE7',
                color: 'white',
                '&:hover': { bgcolor: '#5A46C6' },
              }}
              onClick={() => handleSort('date')}
            >
              Sort By Date
            </Button>
          </Box>

          <TableContainer
            sx={{ maxHeight: '500px', overflowY: 'auto', mt: '20px', borderRadius: '20px' }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="job applicants table">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    S.No.
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    Candidate Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    Applied For
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    Social Links
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    Actions
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    Applied On
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                    Resume
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredApplicants.map((applicant, index) => (
                  <ApplicantRow
                    key={applicant.id}
                    applicant={applicant}
                    index={index}
                    updateApplicant={updateApplicant}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No applicants yet for this job.
        </Typography>
      )}
    </Box>
  );
};
const StatusFilter = ({ applicants, setFilteredApplicants }) => {
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (filterStatus) {
      setFilteredApplicants(
        applicants.filter((applicant) => applicant.applicationStatus === filterStatus)
      );
    } else {
      setFilteredApplicants(applicants);
    }
  }, [applicants, filterStatus]);

  return (
    <FormControl sx={{ minWidth: 200, boxShadow: 2, borderRadius: 2 }}>
      <InputLabel shrink>Filter by Status</InputLabel>
      <Select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        displayEmpty
        label="Filter by Status"
        labelId="Filter by Status"
        sx={{
          backgroundColor: 'white',
          '& .MuiSelect-select': {
            padding: '10px',
          },
        }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="APPLIED">Pending</MenuItem>
        <MenuItem value="SHORTLISTED_FOR_INTERVIEW">Shortlisted</MenuItem>
        <MenuItem value="REJECTED">Rejected</MenuItem>
        <MenuItem value="ON_HOLD">On Hold</MenuItem>
        <MenuItem value="OFFERED">Offered</MenuItem>
        <MenuItem value="OFFER_ACCEPTED">Offer Accepted</MenuItem>
        <MenuItem value="OFFER_REJECTED">Offer Rejected</MenuItem>
      </Select>
    </FormControl>
  );
};

export const JobSelect = ({ setLoading, setApplicants }) => {
  const [jobPosts, setJobPosts] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const recruiterData = await getRecruiterProfile();
      if (recruiterData?.organizationId) {
        const jobPosts = await getJobPosts(recruiterData.organizationId);
        setJobPosts(jobPosts);
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

  useEffect(() => {
    if (selectedJob) {
      getApplicants(selectedJob);
    } else {
      setApplicants([]);
    }
  }, [selectedJob]);

  async function getApplicants(job) {
    if (!job) return;

    setLoading(true);
    try {
      const applications = await getJobApplicationsByJobPost(job?.id);
      const applicationsWithJobTitle = applications.map((application) => ({
        ...application,
        jobPostTitle: job?.jobTitle,
      }));

      const applicantDetails = await Promise.all(
        applicationsWithJobTitle.map(async (application) => {
          const studentProfile = await getStudentProfileUsingUserId(application.applicantId);
          return { ...application, studentProfile };
        })
      );

      setApplicants(applicantDetails);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormControl sx={{ minWidth: 300, boxShadow: 2, borderRadius: 2, mr: 2 }}>
      <InputLabel shrink>Select a job posting</InputLabel>
      <Select
        labelId="Select a job Posting"
        label="Select a job Posting"
        value={selectedJob?.id || ''}
        onChange={(e) => {
          const selectedJob = jobPosts?.find((job) => job.id === e.target.value) || null;
          setSelectedJob(selectedJob);
        }}
        displayEmpty
        fullWidth
        sx={{
          backgroundColor: 'white',
          '& .MuiSelect-select': {
            padding: '10px',
          },
        }}
      >
        <MenuItem value="" disabled>
          Select a Job Post
        </MenuItem>
        {jobPosts?.map((job) => (
          <MenuItem key={job.id} value={job.id}>
            {job.jobTitle}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
const Applications = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredApplicants, setFilteredApplicants] = useState(applicants);

  return (
    <Box sx={{ maxWidth: '1200px', margin: 'auto', padding: 3 }}>
      <Box
        sx={{
          p: 5,
        }}
      >
        {' '}
        <Typography variant="h4" fontWeight="bold" gutterBottom color={PRIMARY_COL}>
          Job Applications
        </Typography>{' '}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <JobSelect setLoading={setLoading} setApplicants={setApplicants} />
          <StatusFilter applicants={applicants} setFilteredApplicants={setFilteredApplicants} />
        </Box>
        <hr />
        <ApplicantTable
          loading={loading}
          filteredApplicants={filteredApplicants}
          setFilteredApplicants={setFilteredApplicants}
        />
      </Box>
    </Box>
  );
};

const JobApplicationsPage = () => {
  return <JpLayoutWithSidebar role="recruiter">{<Applications />}</JpLayoutWithSidebar>;
};

export default JobApplicationsPage;
