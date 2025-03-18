import {
  BusinessOutlined,
  FilterAlt,
  HomeWorkOutlined,
  Info,
  InfoOutlined,
  Search,
  SyncAltOutlined,
} from '@mui/icons-material';
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  createJobApplication,
  getAllJobPosts,
  getOrganizationProfile,
  getUserInfo,
} from '@stex-react/api';
import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
import { useEffect, useState } from 'react';
const JobDetailsModal = ({ open, onClose, selectedJob }) => {
  return (
    <Modal open={open} onClose={onClose} closeAfterTransition sx={{ zIndex: 2005 }}>
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          {selectedJob ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                {selectedJob.jobTitle}
              </Typography>

              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                <strong>Company:</strong> {selectedJob.organization.companyName}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Website:</strong>{' '}
                <a
                  href={selectedJob.organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedJob.organization.website}
                </a>
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Work Mode:</strong> {selectedJob.workMode}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Location:</strong> 📍 {selectedJob.trainingLocation}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Stipend:</strong> {selectedJob.stipend} {selectedJob.currency}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Application Deadline:</strong> ⏳{' '}
                {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Open Positions:</strong> {selectedJob.openPositions}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Qualification Required:</strong> {selectedJob.qualification}
              </Typography>

              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Target Years:</strong> {selectedJob.targetYears}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Description:</strong> {selectedJob.jobDescription}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Facilities:</strong> {selectedJob.facilities}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={onClose}
                  sx={{ padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold' }}
                >
                  Close
                </Button>
              </Box>
            </>
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export function SearchJob() {
  const [jobPosts, setJobPosts] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latestJobPost');
  const [filters, setFilters] = useState({ remote: false, onsite: false, hybrid: false });
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  console.log({ selectedOrg });
  const [openJobModal, setOpenJobModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openOrgModal, setOpenOrgModal] = useState(false);

  const handleOrgModalOpen = () => {
    setOpenOrgModal(true);
  };

  const handleOrgModalClose = () => {
    setSelectedOrg(null);
    setOpenOrgModal(false);
  };

  useEffect(() => {
    const fetchJobPosts = async () => {
      setLoading(true);
      try {
        const data = await getAllJobPosts();
        const enrichedJobPosts = await Promise.all(
          data.map(async (job) => {
            const organizationDetail = await getOrganizationProfile(job.organizationId);
            return {
              ...job,
              organization: organizationDetail,
            };
          })
        );
        setJobPosts(enrichedJobPosts);
      } catch (error) {
        console.error('Error fetching job posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosts();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilters({
      remote: false,
      onsite: false,
      hybrid: false,
    });

    if (value === 'remote') {
      setFilters((prev) => ({ ...prev, remote: true }));
    } else if (value === 'onsite') {
      setFilters((prev) => ({ ...prev, onsite: true }));
    } else if (value === 'hybrid') {
      setFilters((prev) => ({ ...prev, hybrid: true }));
    } else {
      setFilters({ remote: false, onsite: false, hybrid: false });
    }
  };

  const handleSearch = () => {
    return jobPosts.filter((job) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        job.jobTitle.toLowerCase().includes(searchLower) ||
        job.organization.companyName.toLowerCase().includes(searchLower)
      );
    });
  };

  const handleSort = (filteredJobs) => {
    console.log('cr', filteredJobs[0]?.createdAt);
    if (sortBy === 'salary') {
      return filteredJobs.sort((a, b) => b.stipend - a.stipend);
    } else if (sortBy === 'latestJobPost') {
      return filteredJobs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'closestDeadline') {
      return filteredJobs.sort(
        (a, b) =>
          new Date(b.applicationDeadline).getTime() - new Date(a.applicationDeadline).getTime()
      );
    }
  };

  const handleReadMore = (job) => {
    setSelectedJob(job);
    setOpenJobModal(true);
  };

  const handleCloseJobModal = () => {
    setOpenJobModal(false);
    setSelectedJob(null);
  };
  const handleApply = async (jobPostId: number) => {
    try {
      const userInfo = await getUserInfo();
      if (!userInfo) return;
      const applicantId = userInfo.userId;
      console.log('applicant id is ', applicantId);
      const JobApplicationInfo = {
        jobPostId,
        applicantId,
        applicationStatus: 'applied',
      };
      await createJobApplication(JobApplicationInfo);
      setJobPosts((prevJobs) =>
        prevJobs.map((job) => (job.id === jobPostId ? { ...job, alreadyApplied: true } : job))
      );
      const appliedJob = jobPosts.find((job) => job.id === jobPostId);
      if (appliedJob) {
        setAppliedJobs((prev) => [...prev, { ...appliedJob, alreadyApplied: true }]);
      }
    } catch (error) {
      console.error('Error applying for this job:', error);
    }
  };

  const filteredJobs = handleSearch().filter((job) => {
    const workModeFilter =
      (filters.remote && job.workMode === 'remote') ||
      (filters.onsite && job.workMode === 'onsite') ||
      (filters.hybrid && job.workMode === 'hybrid');
    if (!filters.remote && !filters.onsite && !filters.hybrid) {
      return true;
    }
    return workModeFilter;
  });

  console.log({ filteredJobs });
  const sortedJobs = handleSort(filteredJobs);
  console.log({ sortedJobs });
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: '80px 50px 0' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            mb: 3,
            px: 3,
            py: 2,
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: 2,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Search Jobs"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any job name or company name"
            InputProps={{
              startAdornment: <Search sx={{ color: 'gray', mr: 1 }} />,
            }}
            sx={{
              minWidth: '300px',
              flexGrow: 1,
              borderRadius: '10px',
              backgroundColor: '#f9f9f9',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              },
            }}
          />

          <FormControl
            variant="outlined"
            sx={{
              minWidth: 140,
            }}
          >
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              sx={{
                borderRadius: '10px',
                backgroundColor: '#f9f9f9',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="latestJobPost">Latest</MenuItem>
              <MenuItem value="salary">Highest Salary</MenuItem>
              <MenuItem value="closestDeadline">Closest Deadline</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            sx={{
              minWidth: 140,
            }}
          >
            <InputLabel>Filter Work Mode</InputLabel>
            <Select
              value={
                filters.remote
                  ? 'remote'
                  : filters.onsite
                  ? 'onsite'
                  : filters.hybrid
                  ? 'hybrid'
                  : 'all'
              }
              onChange={handleFilterChange}
              label="Filter Work Mode"
              startAdornment={
                <InputAdornment position="start">
                  <FilterAlt sx={{ color: 'gray' }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: '10px',
                backgroundColor: '#f9f9f9',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="all">All </MenuItem>
              <MenuItem value="remote">Remote</MenuItem>
              <MenuItem value="onsite">Onsite</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {sortedJobs.map((job, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: '300px',
                  maxWidth: '600px',
                  flexGrow: 1,
                  flexBasis: 'calc(33.333% - 40px)',
                  mb: 3,
                }}
              >
                <Card
                  sx={{ borderRadius: 2, boxShadow: 3, position: 'relative', overflow: 'hidden' }}
                >
                  <img
                    src={job.logo}
                    alt={job.organization.companyName}
                    style={{ width: 50, height: 50, position: 'absolute', top: 10, right: 10 }}
                  />
                  <CardContent sx={{ padding: '20px' }}>
                    <Typography variant="h6">{job.jobTitle}</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        {job.organization.companyName}
                        <IconButton sx={{ ml: 1 }}>
                          <InfoOutlined color="primary" />
                        </IconButton>
                      </Typography>
                      <Chip
                        label={job.workMode}
                        icon={
                          job.workMode === 'remote' ? (
                            <HomeWorkOutlined sx={{ color: 'white', fontSize: 18 }} />
                          ) : job.workMode === 'hybrid' ? (
                            <SyncAltOutlined sx={{ color: 'white', fontSize: 18 }} />
                          ) : (
                            <BusinessOutlined sx={{ color: 'white', fontSize: 18 }} />
                          )
                        }
                        sx={{
                          textTransform: 'capitalize',
                          bgcolor:
                            job.workMode === 'remote'
                              ? 'success.light'
                              : job.workMode === 'hybrid'
                              ? 'warning.light'
                              : 'primary.light',
                          color: 'white',
                          fontWeight: 'bold',
                          px: 1.5,
                          '& .MuiChip-icon': {
                            color: 'white',
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2">💰{`${job.stipend} ${job.currency}`}</Typography>

                    <Typography variant="body2">📍 {job.trainingLocation}</Typography>
                    <Typography variant="body2">
                      ⏳ Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mb: 1 }}
                        onClick={() => handleApply(job.id)}
                      >
                        Apply Now
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => handleReadMore(job)}>
                        Read More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <JobDetailsModal
        open={openJobModal}
        onClose={handleCloseJobModal}
        selectedJob={selectedJob}
      />
    </Box>
  );
}

const JobPage = () => {
  return <JpLayoutWithSidebar role="student">{<SearchJob />}</JpLayoutWithSidebar>;
};

export default JobPage;
