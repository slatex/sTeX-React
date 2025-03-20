import React, { useEffect, useState } from 'react';
import { 
  Avatar, 
  Box, 
  Button, 
  Card, 
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Divider, 
  Stack, 
  Switch, 
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  Paper
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import {
  ANON_USER_ID_PREFIX,
  UserInfo,
  getAllMyComments,
  getAllMyData,
  getUserInfo,
  getUserInformation,
  purgeAllMyData,
  purgeComments,
  purgeStudyBuddyData,
  purgeUserNotifications,
  resetFakeUserData,
  sendVerificationEmail,
  updateSectionReviewStatus,
  updateTrafficLightStatus,
} from '@stex-react/api';
import { PRIMARY_COL, downloadFile } from '@stex-react/utils';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import { PersonaChooser } from './login';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function ConfirmPurgeDialogContent({ onClose }) {
  const router = useRouter();
  const { myProfile: t } = getLocaleObject(router);
  const [text, setText] = useState('');
  
  return (
    <>
      <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
        {t.confirmPurge}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ my: 2 }}>
          {t.purgeWarning}
          <Typography component="div" sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            Enter this text to confirm: <b>{t.confirmText}</b>
          </Typography>
        </DialogContentText>
        <TextField 
          fullWidth
          label={t.confirmation} 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          variant="outlined" 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>
          {t.cancel}
        </Button>
        <Button
          onClick={() => onClose(true)}
          disabled={text.toLocaleLowerCase() !== t.confirmText.toLocaleLowerCase()}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
        >
          {t.purge}
        </Button>
      </DialogActions>
    </>
  );
}

const MyProfilePage = () => {
  const router = useRouter();
  const { myProfile: t, logInSystem: l } = getLocaleObject(router);
  const [userInfo, setUserInfo] = useState(undefined);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [persona, setPresetProfileName] = useState('Blank');
  const [trafficLightStatus, setTrafficLightStatus] = useState(false);
  const [sectionReviewStatus, setSectionReviewStatus] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info) {
        router.push('/login');
        return;
      }
      setUserInfo(info);
    });
  }, [router]);

  useEffect(() => {
    getUserInformation().then((res) => {
      setTrafficLightStatus(res.showTrafficLight);
      setSectionReviewStatus(res.showSectionReview);
      setIsVerifiedUser(res.isVerified);
    });
  }, []);

  async function handleTrafficLight(trafficLightStatus) {
    try {
      await updateTrafficLightStatus(trafficLightStatus);
      setTrafficLightStatus(trafficLightStatus);
    } catch (error) {
      console.error('Error updating traffic light status:', error);
    }
  }
  
  async function handleSectionReviewStatus(sectionReviewStatus) {
    try {
      await updateSectionReviewStatus(sectionReviewStatus);
      setSectionReviewStatus(sectionReviewStatus);
    } catch (error) {
      console.error('Error updating section review status:', error);
    }
  }

  async function handleVerification(userId) {
    try {
      await sendVerificationEmail(userId, crypto.randomUUID());
      alert(l.verificationEmail);
    } catch (error) {
      alert(l.somethingWentWrong);
      console.error('Error in sending verification email:', error);
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  async function handleDataPurge(confirmed) {
    if (!confirmed) {
      setOpenPurgeDialog(false);
      return;
    }
    try {
      await purgeAllMyData();
      await purgeComments();
      await purgeUserNotifications();
      await purgeStudyBuddyData();
      alert(t.dataPurged);
      setOpenPurgeDialog(false);
    } catch (err) {
      console.log(err);
      alert(t.purgeError);
    }
  }

  if (!userInfo) return null;

  return (
    <MainLayout title={`${userInfo.fullName} | ALeA`}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box 
            sx={{ 
              p: 4, 
              bgcolor: PRIMARY_COL,
              color: 'white',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 3
            }}
          >
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                fontSize: '2.5rem',
                bgcolor: 'white',
                color: PRIMARY_COL
              }}
            >
              {userInfo.fullName.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                {userInfo.fullName}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1 }}>
                {userInfo.userId}
              </Typography>
              
              {!isVerifiedUser && !userInfo.userId.startsWith(ANON_USER_ID_PREFIX) && (
                <Button 
                  onClick={() => handleVerification(userInfo.userId)} 
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<EmailIcon />}
                  sx={{ mt: 1 }}
                >
                  {l.sendVerifcationBtn}
                </Button>
              )}
              
              {isVerifiedUser && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <VerifiedUserIcon color="success" />
                  <Typography variant="body2" sx={{ ml: 1 }}>Verified Account</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="profile tabs"
            >
              <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Profile" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
              <Tab icon={<DownloadIcon />} iconPosition="start" label="Data Export" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">Learning Resources</Typography>
                  </Box>
                  <Stack spacing={2} sx={{ p: 2 }}>
                    <Button 
                      component={Link} 
                      href="/my-notes" 
                      variant="contained" 
                      fullWidth
                      startIcon={<NoteAltIcon />}
                    >
                      {t.myNotes}
                    </Button>
                    <Button 
                      component={Link} 
                      href="/my-learner-model" 
                      variant="contained" 
                      fullWidth
                      startIcon={<AssessmentIcon />}
                    >
                      {t.myCompetencyData}
                    </Button>
                    <Button 
                      component={Link} 
                      href="/learner-model-init" 
                      variant="contained" 
                      fullWidth
                      startIcon={<SchoolIcon />}
                    >
                      {t.learnerModelPriming}
                    </Button>
                  </Stack>
                </Card>
              </Box>
              
              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">Account Information</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    {userInfo?.userId?.startsWith('fake_') && (
                      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Test Account Settings
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <PersonaChooser
                            label={t.choosePersona}
                            persona={persona}
                            onPersonaUpdate={(l) => {
                              setPresetProfileName(l);
                            }}
                          />
                          <Button
                            disabled={!persona?.length}
                            variant="contained"
                            size="small"
                            onClick={() => resetFakeUserData(persona)}
                            sx={{ ml: 2 }}
                          >
                            {t.resetFake}
                          </Button>
                        </Box>
                      </Box>
                    )}
                    
                    <Typography variant="body1">
                      Account Type: <strong>{userInfo.userId.startsWith(ANON_USER_ID_PREFIX) ? 'Anonymous' : 'Registered'}</strong>
                    </Typography>
                    
                    {!isVerifiedUser && !userInfo.userId.startsWith(ANON_USER_ID_PREFIX) && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography>{l.verifcationMessage}</Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Card variant="outlined">
              <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h6">Display Settings</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight="medium">
                      Show Traffic Light on Notes
                    </Typography>
                    <Switch
                      checked={trafficLightStatus}
                      onChange={() => handleTrafficLight(!trafficLightStatus)}
                      color="primary"
                    />
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight="medium">
                      Show Review Section on Notes
                    </Typography>
                    <Switch
                      checked={sectionReviewStatus}
                      onChange={() => handleSectionReviewStatus(!sectionReviewStatus)}
                      color="primary"
                    />
                  </Paper>
                </Stack>
              </Box>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined">
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">{t.downloadData}</Typography>
                  </Box>
                  <Stack spacing={2} sx={{ p: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        getAllMyComments().then((data) => {
                          downloadFile(
                            JSON.stringify(data, undefined, 2),
                            `${userInfo.userId}-comments-${Date.now()}.json`,
                            'text/json'
                          );
                        });
                      }}
                      fullWidth
                    >
                      {t.downloadNotes}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        getAllMyData().then((data) => {
                          downloadFile(
                            JSON.stringify(data, undefined, 2),
                            `${userInfo.userId}-lms-${Date.now()}.json`,
                            'text/json'
                          );
                        });
                      }}
                      fullWidth
                    >
                      {t.downloadProfile}
                    </Button>
                  </Stack>
                </Card>
              </Box>

              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined" sx={{ border: '1px solid rgba(255,0,0,0.2)' }}>
                  <Box sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
                    <Typography variant="h6">{t.dataDeletion}</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                      Warning: This action cannot be undone. All your data will be permanently deleted.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => setOpenPurgeDialog(true)}
                      fullWidth
                    >
                      {t.purgeData}
                    </Button>
                  </Box>
                </Card>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Container>

      <Dialog 
        onClose={() => setOpenPurgeDialog(false)} 
        open={openPurgeDialog}
        maxWidth="sm"
        fullWidth
      >
        <ConfirmPurgeDialogContent onClose={handleDataPurge} />
      </Dialog>
    </MainLayout>
  );
};

export default MyProfilePage;