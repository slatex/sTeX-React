import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Grid,
  Badge,
  InputAdornment,
  Icon,
  Avatar,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
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
import { Chart } from 'react-google-charts';
import { PRIMARY_COL } from '@stex-react/utils';
import { FilterList, Search } from '@mui/icons-material';

const recruiterData = [
  ['Category', 'Count'],
  ['Applicants', 25],
  ['Shortlisted', 10],
  ['On Hold', 5],
  ['Interviewed', 8],
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
const colors = ['#1CD083', '#5A69E2', '#48A9F8', '#8BC741'];
const icons = [
  <EmojiPeopleIcon sx={{ fontSize: '60px' }} />,
  <AssignmentIcon sx={{ fontSize: '60px' }} />,
  <CancelIcon sx={{ fontSize: '60px' }} />,
  <ChatIcon sx={{ fontSize: '60px' }} />,
];
const getRandomStudentProfile = () => {
  const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown'];
  const randomName = names[Math.floor(Math.random() * names.length)];

  return {
    name: 'fakejoy',
    email: 'fakejoy@gmail.com',
    contactNo: '+49 163 555 1584',
    programme: 'Artificial Intelligence',
    yearOfAdmission: '2024',
    yearOfGraduation: '2026',
    grades: 'A',
    resumeURL: 'http://example.com/resume',
    about: 'A motivated AI developer with a passion for research in generative AI.',
  };
};

const selectedStudentProfile = getRandomStudentProfile();

function StudentDashboard() {
  const [filters, setFilters] = useState({
    sent: true,
    interviewed: true,
    rejected: true,
    dateRange: '',
  });

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.checked });
  };

  const handleDateChange = (event) => {
    setFilters({ ...filters, dateRange: event.target.value });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          bgcolor: '#f9f5f2',
          padding: '16px',
          position: 'fixed',
          top: 0,
          left: '240px',
          right: 0,
          zIndex: 1000,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            edge="start"
            color="inherit"
            sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px' }}
          >
            <MenuIcon />
          </IconButton>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            sx={{
              bgcolor: 'white',
              borderRadius: '20px',
              width: '50%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
              '& .MuiInputAdornment-root': {
                marginRight: '8px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px', marginRight: '18px' }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px', marginRight: '18px' }}
            >
              <Badge badgeContent={2} color="error">
                <MessageIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px' }}
            >
              <PersonIcon />
            </IconButton>
            <Typography variant="body1" sx={{ ml: 1 }}>
              fakejoy
            </Typography>
          </Box>
        </Toolbar>
      </Box>

      <Grid container spacing={2} sx={{ p: '100px 20px 20px 20px' }}>
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
                {selectedStudentProfile.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ marginTop: 2, fontWeight: 'bold' }}>
                {selectedStudentProfile.name}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Email
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Contact No
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.contactNo}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Programme
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.programme}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Year of Admission
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.yearOfAdmission}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Year of Graduation
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.yearOfGraduation}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Grades
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.grades}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Resume URL
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.resumeURL}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                About
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudentProfile.about}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        <Box sx={{ flex: '2', ml: 2, flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FormControlLabel
              control={
                <Checkbox checked={filters.sent} onChange={handleFilterChange} name="sent" />
              }
              label="Application Sent"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.interviewed}
                  onChange={handleFilterChange}
                  name="interviewed"
                />
              }
              label="Interviewed"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.rejected}
                  onChange={handleFilterChange}
                  name="rejected"
                />
              }
              label="Rejected"
            />
            <TextField
              type="date"
              variant="outlined"
              size="small"
              onChange={handleDateChange}
              sx={{ minWidth: '180px' }}
            />
          </Box>
          <Chart
            chartType="BarChart"
            width="100%"
            height="300px"
            data={studentData}
            options={{
              title: 'Application Status',
              backgroundColor: '#f9f9f9',
              legend: { position: 'bottom' },
            }}
          />
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Recommended Jobs</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Filter by job title..."
                sx={{ flexGrow: 1, mr: 2 }}
              />
              <TextField
                variant="outlined"
                size="small"
                placeholder="Filter by company..."
                sx={{ flexGrow: 1 }}
              />
            </Box>
            <Grid container spacing={2}>
              {[...Array(3)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ borderRadius: '15px', boxShadow: 3, p: 2, maxWidth: 350 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1}>
                        <WorkIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          SWE
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <BusinessIcon color="secondary" />
                        <Typography variant="body1">Nike</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <LocationOnIcon color="action" />
                        <Typography variant="body2">Berlin</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <AttachMoneyIcon color="success" />
                        <Typography variant="body2">10,000 Euro</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <EventIcon color="error" />
                        <Typography variant="body2">Deadline: 24/06/2025</Typography>
                      </Box>

                      <Box mt={2}>
                        <Button variant="contained" color="primary" fullWidth>
                          More Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
function SearchJob() {
  const jobData = [
    {
      title: 'Software Engineer',
      company: 'SAP',
      location: 'Berlin, Germany',
      salary: '€6,000/month',
      deadline: 'March 15, 2025',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg',
    },
    {
      title: 'Frontend Developer',
      company: 'Siemens',
      location: 'Munich, Germany',
      salary: '€5,500/month',
      deadline: 'April 5, 2025',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Siemens_AG_logo.svg/2560px-Siemens_AG_logo.svg.png',
    },
    {
      title: 'Backend Developer',
      company: 'Bosch',
      location: 'Stuttgart, Germany',
      salary: '€5,800/month',
      deadline: 'March 25, 2025',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bosch-logo.svg/1920px-Bosch-logo.svg.png',
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filters, setFilters] = useState({ remote: false, onsite: false });

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.checked });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          bgcolor: '#f9f5f2',
          padding: '16px',
          position: 'fixed',
          top: 0,
          left: '240px',
          right: 0,
          zIndex: 1000,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            edge="start"
            color="inherit"
            sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px' }}
          >
            <MenuIcon />
          </IconButton>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            sx={{
              bgcolor: 'white',
              borderRadius: '20px',
              width: '50%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
              '& .MuiInputAdornment-root': {
                marginRight: '8px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px', marginRight: '18px' }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px', marginRight: '18px' }}
            >
              <Badge badgeContent={2} color="error">
                <MessageIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              sx={{ bgcolor: 'white', borderRadius: '50%', padding: '10px' }}
            >
              <PersonIcon />
            </IconButton>
            <Typography variant="body1" sx={{ ml: 1 }}>
              fakejoy
            </Typography>
          </Box>
        </Toolbar>
      </Box>

      <Box sx={{ p: '100px 50px 0' }}>
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

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <FilterList />
          <FormControlLabel
            control={
              <Checkbox name="remote" checked={filters.remote} onChange={handleFilterChange} />
            }
            label="Remote"
          />
          <FormControlLabel
            control={
              <Checkbox name="onsite" checked={filters.onsite} onChange={handleFilterChange} />
            }
            label="Onsite"
          />
        </Box>

        <Grid container spacing={5}>
          {jobData.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, position: 'relative' }}>
                <img
                  src={job.logo}
                  alt={job.company}
                  style={{ width: 50, height: 50, position: 'absolute', top: 10, right: 10 }}
                />
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {job.company}
                  </Typography>
                  <Typography variant="body2">📍 {job.location}</Typography>
                  <Typography variant="body2">💰 {job.salary}</Typography>
                  <Typography variant="body2">⏳ Deadline: {job.deadline}</Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {jobData.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, position: 'relative' }}>
                <img
                  src={job.logo}
                  alt={job.company}
                  style={{ width: 50, height: 50, position: 'absolute', top: 10, right: 10 }}
                />
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {job.company}
                  </Typography>
                  <Typography variant="body2">📍 {job.location}</Typography>
                  <Typography variant="body2">💰 {job.salary}</Typography>
                  <Typography variant="body2">⏳ Deadline: {job.deadline}</Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {jobData.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, position: 'relative' }}>
                <img
                  src={job.logo}
                  alt={job.company}
                  style={{ width: 50, height: 50, position: 'absolute', top: 10, right: 10 }}
                />
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {job.company}
                  </Typography>
                  <Typography variant="body2">📍 {job.location}</Typography>
                  <Typography variant="body2">💰 {job.salary}</Typography>
                  <Typography variant="body2">⏳ Deadline: {job.deadline}</Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {jobData.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative', p: 2 }}>
                <img
                  src={job.logo}
                  alt={job.company}
                  style={{ width: 50, height: 50, position: 'absolute', top: 10, right: 10 }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="body1" color="textSecondary">
                    {job.company}
                  </Typography>
                  <Typography variant="body2">📍 {job.location}</Typography>
                  <Typography variant="body2">💰 {job.salary}</Typography>
                  <Typography variant="body2">⏳ Deadline: {job.deadline}</Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
const RecruiterDashboard = () => (
  <Box>
    <Typography variant="h4"> Dashboard</Typography>
    <Card>
      <CardContent>
        <Typography variant="h6"> Overview</Typography>
        <Chart
          chartType="PieChart"
          width="100%"
          height="300px"
          data={recruiterData}
          options={{ title: 'Recruiter Metrics' }}
        />
      </CardContent>
    </Card>
  </Box>
);
const Applications = () => (
  <Box>
    <Typography variant="h4"> Applications</Typography>
  </Box>
);
const News = () => (
  <Box>
    <Typography variant="h4"> News</Typography>
  </Box>
);
const Profile = () => (
  <Box>
    <Typography variant="h4">Edit Profile</Typography>
  </Box>
);
const Messages = () => (
  <Box>
    <Typography variant="h4"> Messages</Typography>
  </Box>
);

const Dashboard = () => {
  const [role, setRole] = useState('student');
  const [drawerOpen, setDrawerOpen] = useState(true);

  const getDashboardContent = () => {
    switch (role) {
      case 'dashboard':
        return <StudentDashboard />;

      case 'search job':
        return <SearchJob />;
      case 'applications':
        return <Applications />;
      case 'messages':
        return <Messages />;
      case 'statistics':
        return <RecruiterDashboard />;
      case 'news':
        return <News />;
      case 'profile':
        return <Profile />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? 240 : 70,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          bgcolor: PRIMARY_COL,
          borderRadius: '0 15px 15px 0',
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(to bottom, #806BE7, #4A69E1, #525AE2, #5C49E0)',
          },
          zIndex: 0,
        }}
      >
        <List>
          <ListItem button onClick={() => setDrawerOpen(!drawerOpen)}>
            <ListItemIcon>
              <MenuIcon sx={{ color: 'white' }} />
            </ListItemIcon>
          </ListItem>
          {[
            'dashboard',
            'search job',
            'applications',
            'messages',
            'profile',
            'statistics',
            'news',
          ].map((item) => (
            <ListItem
              button
              key={item}
              onClick={() => setRole(item)}
              sx={{
                bgcolor: role === item ? '#f9f5f2' : 'transparent',
                color: role === item ? PRIMARY_COL : 'white',
                borderRadius: '30px 0 0 30px',
                m: '5px',
                pr: 10,
                // mr: 0,
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: role === item ? PRIMARY_COL : 'white' }} />
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText primary={`${item.charAt(0).toUpperCase() + item.slice(1)} `} />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f9f5f2',
          borderRadius: '20px 0 0 0',
          zIndex: '1',
          ml: '-20px',
        }}
      >
        {getDashboardContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
