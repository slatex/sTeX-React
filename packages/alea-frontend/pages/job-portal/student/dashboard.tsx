import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  canAccessResource,
  getAllJobPosts,
  getJobApplicationsByUserId,
  getStudentProfile,
  StudentData,
} from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { useRouter } from 'next/router';
import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
import { useEffect, useState } from 'react';
import Chart from 'react-google-charts';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatIcon from '@mui/icons-material/Chat';
import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
// import { StudentDashboard } from '../dashboard';
const recruiterData = [
  ['Category', 'Count'],
  ['Applicants', 25],
  ['Shortlisted', 10],
  ['On Hold', 5],
  ['InterviewStage', 8],
  ['Offers', 2],
];

const studentData = [
  ['Day', 'Activities'],
  ['Mon', 20],
  ['Tue', 30],
  ['Wed', 40],
  ['Thu', 50],
  ['Fri', 60],
];
export const JobDetails = ({ job }) => {
  return (
    <Box mt={2}>
      <Typography variant="body1" fontWeight="bold">
        Job Description:
      </Typography>
      <Typography variant="body2" paragraph>
        {job.jobDescription}
      </Typography>

      <Typography variant="body1" fontWeight="bold">
        Qualification:
      </Typography>
      <Typography variant="body2">{job.qualification}</Typography>

      <Typography variant="body1" fontWeight="bold">
        Session:
      </Typography>
      <Typography variant="body2">{job.session}</Typography>

      <Typography variant="body1" fontWeight="bold">
        Facilities:
      </Typography>
      <Typography variant="body2">{job.facilities}</Typography>

      <Typography variant="body1" fontWeight="bold">
        Open Positions:
      </Typography>
      <Typography variant="body2">{job.openPositions}</Typography>
    </Box>
  );
};

export const JobCard = ({ job }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={job.id}>
      <Card sx={{ borderRadius: '15px', boxShadow: 3, p: 2, maxWidth: 350 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <WorkIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {job.jobTitle}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <BusinessIcon color="secondary" />
            <Typography variant="body1">{job.organizationId}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <LocationOnIcon color="action" />
            <Typography variant="body2">{job.trainingLocation}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <AttachMoneyIcon color="success" />
            <Typography variant="body2">
              {job.stipend} {job.currency}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <EventIcon color="error" />
            <Typography variant="body2">
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </Typography>
          </Box>

          <Box mt={2}>
            <Button variant="contained" color="primary" fullWidth onClick={handleToggleDetails}>
              {showDetails ? 'Hide Details' : 'More Details'}
            </Button>
          </Box>

          {showDetails && <JobDetails job={job} />}
        </CardContent>
      </Card>
    </Grid>
  );
};
const colors = ['#1CD083', '#5A69E2', '#48A9F8', '#8BC741'];
const icons = [
  <EmojiPeopleIcon sx={{ fontSize: '60px' }} />,
  <AssignmentIcon sx={{ fontSize: '60px' }} />,
  <CancelIcon sx={{ fontSize: '60px' }} />,
  <ChatIcon sx={{ fontSize: '60px' }} />,
];
const isBetween = (date: string, start: string, end: string) => {
  return (
    dayjs(date).isAfter(dayjs(start).subtract(1, 'day')) &&
    dayjs(date).isBefore(dayjs(end).add(1, 'day'))
  );
};
export const JobStatsChart = ({ applicationData }) => {
  const allData = [
    { date: '2024-03-01', sent: 10, interviewStage: 3, rejected: 5 },
    { date: '2024-03-05', sent: 7, interviewStage: 2, rejected: 4 },
    { date: '2024-03-10', sent: 12, interviewStage: 5, rejected: 6 },
    { date: '2024-03-15', sent: 8, interviewStage: 3, rejected: 2 },
    { date: '2024-03-20', sent: 15, interviewStage: 7, rejected: 8 },
  ];
  const transformApplicationData = (applicationData) => {
    const dateStats = {};
    console.log('in', applicationData);
    applicationData?.forEach((application) => {
      const { applicationStatus, createdAt } = application;
      console.log({ applicationStatus });
      console.log({ createdAt });
      if (!dateStats[createdAt]) {
        dateStats[createdAt] = {
          sent: 0,
          interviewStage: 0,
          rejected: 0,
        };
      }

      if (applicationStatus === 'ACCEPTED') {
        dateStats[createdAt].interviewStage += 1;
      } else if (applicationStatus === 'REJECTED') {
        dateStats[createdAt].rejected += 1;
      } else {
        dateStats[createdAt].sent += 1;
      }
    });

    const allData = Object.keys(dateStats).map((date) => ({
      date,
      sent: dateStats[date].sent,
      interviewStage: dateStats[date].interviewStage,
      rejected: dateStats[date].rejected,
    }));

    return allData;
  };

  //   const allData = transformApplicationData(applicationData);
  console.log('object', allData);
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [filters, setFilters] = useState({
    sent: true,
    interviewStage: true,
    rejected: true,
  });

  const handleFilterChange = (event) => {
    const { name, checked } = event.target;

    // If unchecking, make sure at least one filter is still selected
    if (!checked) {
      const remainingFilters = Object.values({ ...filters, [name]: checked }).filter(Boolean);
      if (remainingFilters.length === 0) {
        return; // Prevent unchecking the last filter
      }
    }

    // Update the filter state
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const filteredData = allData.filter((item) => {
    const itemDate = item.date;
    if (filter === 'week') {
      return isBetween(
        itemDate,
        dayjs().startOf('week').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD')
      );
    } else if (filter === 'custom' && startDate && endDate) {
      return isBetween(itemDate, startDate, endDate);
    }
    return true;
  });

  const chartData = [
    [
      'Date',
      ...(filters.sent ? ['Sent'] : []),
      ...(filters.interviewStage ? ['InterviewStage'] : []),
      ...(filters.rejected ? ['Rejected'] : []),
    ],
    ...filteredData.map(({ createdAt, sent, interviewStage, rejected }) => [
      dayjs(createdAt).format('MMM DD'),
      ...(filters.sent ? [sent] : []),
      ...(filters.interviewStage ? [interviewStage] : []),
      ...(filters.rejected ? [rejected] : []),
    ]),
  ];
  console.log({ chartData });
  const selectedFilters = Object.values(filters).filter(Boolean).length;
  const chartHeight = 250 + selectedFilters * 40;
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ flex: 2, ml: 2, flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FormControlLabel
            control={<Checkbox checked={filters.sent} onChange={handleFilterChange} name="sent" />}
            label="Application Sent"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.interviewStage}
                onChange={handleFilterChange}
                name="interviewStage"
              />
            }
            label="InterviewStage"
          />
          <FormControlLabel
            control={
              <Checkbox checked={filters.rejected} onChange={handleFilterChange} name="rejected" />
            }
            label="Rejected"
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, ml: 2 }}>
        <FormControl size="small">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>

        {filter === 'custom' && (
          <>
            <TextField
              size="small"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}
      </Box>
      {/* Chart */}
      {chartData.length > 1 ? (
        <Box sx={{ maxWidth: '900px', overflow: 'hidden' }}>
          <Chart
            chartType="BarChart"
            data={chartData}
            options={{
              title: 'Job Applications Overview',
              colors: ['#1E88E5', '#43A047', '#E53935'].filter(
                (_, index) => Object.values(filters)[index]
              ),
              bar: { groupWidth: '50%' },
              legend: { position: 'bottom' },
            }}
            height={`${chartHeight}px`}
          />
        </Box>
      ) : (
        <Typography>No data available for the selected filters.</Typography>
      )}
    </Box>
  );
};

export function StudentDashboard() {
  const [filters, setFilters] = useState({
    sent: true,
    interviewStage: true,
    rejected: true,
    dateRange: '',
  });
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData>(null);
  const [applications, setApplications] = useState<any>(null);
  const [statusState, setStatusState] = useState<any>(null);
  const [allJobPosts, setAllJobPosts] = useState<any>(null);

  const router = useRouter();
  useEffect(() => {
    const checkAccess = async () => {
      setAccessCheckLoading(true);
      const hasAccess = await canAccessResource(ResourceName.JOB_PORTAL, Action.APPLY, {
        instanceId: CURRENT_TERM,
      });
      if (!hasAccess) {
        alert('You donot have access to this page.');
        router.push('/job-portal');
        return;
      }
      setAccessCheckLoading(false);
    };

    checkAccess();
  }, []);
  useEffect(() => {
    if (accessCheckLoading) return;
    const fetchStudentData = async () => {
      try {
        setLoading(true);

        const res = await getStudentProfile();
        setStudent(res[0]);
        const applications = await getJobApplicationsByUserId();
        setApplications(applications);
        const statusState = transformApplicationData(applications);
        setStatusState(statusState);
        const jobPosts = await getAllJobPosts();
        setAllJobPosts(jobPosts);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [accessCheckLoading]);
  const transformApplicationData = (applicationData) => {
    const statusStats = {
      applied: 0,
      accepted: 0,
      rejected: 0,
      messages: 0, // You can implement logic here for messages if available
    };

    applicationData?.forEach((application) => {
      const { applicationStatus, createdAt } = application;

      // Counting the applications based on their status
      if (applicationStatus === 'APPLIED') {
        statusStats.applied += 1;
      } else if (applicationStatus === 'ACCEPTED') {
        statusStats.accepted += 1;
      } else if (applicationStatus === 'REJECTED') {
        statusStats.rejected += 1;
      } else {
        // Add logic for Messages if you have a message field in application data
        statusStats.messages += 1; // Adjust this part if you have message-related data
      }
    });

    return statusStats;
  };

  console.log({ student });
  console.log({ applications });
  console.log({ allJobPosts });
  const {
    userId,
    name,
    resumeURL,
    email,
    mobile,
    programme,
    yearOfAdmission,
    yearOfGraduation,
    courses,
    grades,
    about,
  } = student || {};
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ p: '70px 20px 20px 20px' }}>
        {['Interviews', 'Applied', 'Rejected', 'Messages'].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat}>
            <Card
              sx={{
                bgcolor: colors[index],
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '15px',
                boxShadow: 3,
                height: '200px',
              }}
            >
              <Icon
                sx={{
                  fontSize: 80,
                  mr: 10,
                  color: 'white',
                  border: '1px solid #fff',
                  borderRadius: '15px',
                  pb: '20px',
                }}
              >
                {icons[index]}
              </Icon>{' '}
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#FFFFFF', fontWeight: '500', fontSize: '1.5rem' }}
                >
                  {stat}
                </Typography>
                <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: '600' }}>
                  {Math.floor(Math.random() * 100) % 10}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* <Grid container spacing={2} sx={{ p: '70px 20px 20px 20px' }}>
        {statusState?.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat}>
            <Card
              sx={{
                bgcolor: colors[index],
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '15px',
                boxShadow: 3,
                height: '200px',
              }}
            >
              <Icon
                sx={{
                  fontSize: 80,
                  mr: 10,
                  color: 'white',
                  border: '1px solid #fff',
                  borderRadius: '15px',
                  pb: '20px',
                }}
              >
                {icons[index]}
              </Icon>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#FFFFFF', fontWeight: '500', fontSize: '1.5rem' }}
                >
                  {stat}
                </Typography>
                <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: '600' }}>
                  {stat === 'Applied'
                    ? statusState.applied
                    : stat === 'Accepted'
                    ? statusState.accepted
                    : stat === 'Rejected'
                    ? statusState.rejected
                    : stat === 'Messages'
                    ? statusState.messages
                    : 0}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid> */}
      <Box sx={{ display: 'flex', flexGrow: 1, p: 2 }}>
        <Card
          elevation={3}
          sx={{
            flex: '1 1 1%',
            padding: 4,
            borderRadius: 3,
            backgroundColor: '#f9f9f9',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ textAlign: 'center', marginBottom: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontSize: 32,
                }}
              >
                {name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ marginTop: 2, fontWeight: 'bold' }}>
                {name}({userId})
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Email
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Contact No
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {mobile}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Programme
              </Typography>

              <Typography variant="body2" color="textSecondary">
                {programme}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Courses
              </Typography>

              <Typography variant="body2" color="textSecondary">
                {courses}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Year of Admission
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {yearOfAdmission}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Year of Graduation
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {yearOfGraduation}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Grades
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {grades}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Resume URL
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {resumeURL}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                About
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {about}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        <Box sx={{ flex: '2', ml: 2, flexDirection: 'column' }}>
          <JobStatsChart applicationData={applications} />
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Recommended Jobs</Typography>

            <Grid container spacing={2}>
              {allJobPosts?.slice(0, 3).map((job, index) => (
                <JobCard job={job} key={index} />
              ))}
            </Grid>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Add />}
                onClick={() => router.push('/job-portal/search-job')}
              >
                More Jobs
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const Dashboard = () => {
  return <JpLayoutWithSidebar role="student">{<StudentDashboard />}</JpLayoutWithSidebar>;
};

export default Dashboard;
