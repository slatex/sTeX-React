import { Info, InfoOutlined, Search } from '@mui/icons-material';
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
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

export function SearchJob() {
  const [jobPosts, setJobPosts] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filters, setFilters] = useState({ remote: false, onsite: false });
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

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.checked });
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
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: '80px 50px 0' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            mb: 3,
            px: 3,
            py: 2,
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: 2,
          }}
        >
          <TextField
            label="Search Jobs"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'gray', mr: 1 }} />,
            }}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#f9f9f9',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              },
            }}
          />

          <FormControl variant="outlined" sx={{ minWidth: 180 }}>
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
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="salary">Highest Salary</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {jobPosts.map((job, index) => (
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
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
                    <Typography variant="body2">€ {job.stipend}</Typography>
                  </Box>

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
      </Box>

      <Modal
        open={openJobModal}
        onClose={handleCloseJobModal}
        closeAfterTransition
        sx={{ zIndex: 2005 }}
      >
        <Fade in={openJobModal}>
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
                  <strong>Description:</strong> {selectedJob.jobDescription}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Facilities:</strong> {selectedJob.facilities}
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

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleCloseJobModal}
                    sx={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                    }}
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
    </Box>
  );
}

const JobPage = () => {
  return <JpLayoutWithSidebar role="student">{<SearchJob />}</JpLayoutWithSidebar>;
};

export default JobPage;
