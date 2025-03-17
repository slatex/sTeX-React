import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Header } from '../components/Header';
import { PRIMARY_COL } from '@stex-react/utils';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/router';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Sidebar = ({
  drawerOpen,
  setDrawerOpen,
  role,
}: {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  role: 'student' | 'recruiter' | 'admin';
}) => {
  const router = useRouter();
  const menuItems = {
    student: [
      { label: 'Dashboard', path: '/job-portal/student/dashboard' },
      { label: 'Search Job', path: '/job-portal/search-job' },
      { label: 'Applications', path: '/job-portal/student/applications' },
      { label: 'Messages', path: '/job-portal/student/messages' },
      { label: 'Profile', path: '/job-portal/student/profile' },
      //   { label: 'Statistics', path: '/job-portal/student/statistics' },
      //   { label: 'News', path: '/job-portal/student/news' },
    ],
    recruiter: [
      { label: 'Dashboard', path: '/job-portal/recruiter/dashboard' },
      { label: 'Create Job', path: '/job-portal/recruiter/create-job' },
      { label: 'Applications', path: '/job-portal/recruiter/applications' },
      { label: 'Messages', path: '/job-portal/recruiter/messages' },
      { label: 'Profile', path: '/job-portal/recruiter/profile' },
      //   { label: 'Offer Status', path: '/job-portal/recruiter/offer-status' },

      //   { label: 'Company Profile', path: '/job-portal/recruiter/company-profile' },
      { label: 'Statistics', path: '/job-portal/recruiter/statistics' },
    ],
    admin: [
      { label: 'Admin Dashboard', path: '/job-portal/admin/dashboard' },
      { label: 'Manage Users', path: '/job-portal/admin/users' },
      { label: 'Manage Jobs', path: '/job-portal/admin/jobs' },
      { label: 'Reports', path: '/job-portal/admin/reports' },
      { label: 'Settings', path: '/job-portal/admin/settings' },
    ],
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerOpen ? 270 : 140,
        transition: 'width 0.3s',
        overflowX: 'hidden',
        borderRadius: '0 15px 15px 0',
        '& .MuiDrawer-paper': {
          width: drawerOpen ? 270 : 140,
          transition: 'width 0.3s',
          background: 'linear-gradient(to bottom, #806BE7, #4A69E1, #525AE2, #5C49E0)',
        },
        zIndex: 0,
      }}
    >
      <List>
        <ListItem component="button" onClick={() => setDrawerOpen(!drawerOpen)}>
          <ListItemIcon>
            <MenuIcon sx={{ color: 'white' }} />
          </ListItemIcon>
        </ListItem>

        {menuItems[role]?.map(({ label, path }) => {
          const isActive = router.pathname === path;
          return (
            <Box
              key={path}
              sx={{
                p: '4px',
              }}
            >
              <ListItem
                component="button"
                onClick={() => router.push(path)}
                sx={{
                  bgcolor: isActive ? '#f9f5f2' : 'transparent',
                  color: isActive ? '#4A69E1' : '#f9f5f2',

                  pr: 4,
                  borderRadius: '30px 0 0px 30px ',
                  '&:hover': isActive
                    ? { bgcolor: 'white' }
                    : {
                        bgcolor: 'rgba(249, 245, 242, 0.1)',
                      },
                  '&:hover .MuiListItemIcon-root': {
                    color: PRIMARY_COL,
                  },
                }}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary={label} />}
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
};

const JpLayoutWithSidebar = ({
  role,
  children,
}: {
  role: 'student' | 'recruiter' | 'admin';
  children: any;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f4f4f4' }}>
      <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} role={role} />
      <Box
        sx={{
          borderRadius: '40px',
          padding: '0 30px  30px',
          bgcolor: '#f9f5f2',
          ml: '-64px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header showBrowserAutocomplete={false} headerBgColor="#f9f5f2" />

        <Box
          sx={{
            height: '58px',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '95%',
            zIndex: 2000,
            borderTop: '4px solid #f9f5f2',
            borderBottom: '4px solid #f9f5f2',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px 0 0',
            borderLeft: '40px solid #f9f5f2',
            borderRight: '40px solid #f9f5f2',
            pointerEvents: 'none',
          }}
        ></Box>

        <Box
          sx={{
            overflowY: 'auto',
            pb: '10px',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default JpLayoutWithSidebar;
