import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  ANON_USER_ID_PREFIX,
  getAllMyComments,
  getAllMyData,
  getUserInfo,
  getUserInformation,
  getUserProfile,
  Language,
  myprofile,
  purgeAllMyData,
  purgeComments,
  purgeStudyBuddyData,
  purgeUserNotifications,
  resetFakeUserData,
  sendVerificationEmail,
  updateSectionReviewStatus,
  updateTrafficLightStatus,
  updateUserProfile,
} from '@stex-react/api';
import { downloadFile, PRIMARY_COL } from '@stex-react/utils';
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
      <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>{t.confirmPurge}</DialogTitle>
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
        <Button onClick={() => onClose(false)}>{t.cancel}</Button>
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

export function EditProfileDialog({ open, onClose, profileData, userId, onSave }) {
  const router = useRouter();
  const { myProfile: t } = getLocaleObject(router);
  const [formData, setFormData] = useState<myprofile>({
    firstName: '',
    lastName: '',
    email: '',
    studyProgram: '',
    semester: '',
    languages: Language.English,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        studyProgram: profileData.studyProgram || '',
        email: profileData.email || '',
        semester: profileData.semester || '',
        languages: profileData.languages || '',
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    if (!userId) {
      setError('User ID is missing. Please refresh the page and try again.');
      setIsLoading(false);
      return;
    }

    const updatedProfile = {
      userId,
      ...formData,
    };

    try {
      console.log('Updating profile with:', updatedProfile);
      await updateUserProfile(
        updatedProfile.userId,
        updatedProfile.firstName,
        updatedProfile.lastName,
        updatedProfile.email,
        updatedProfile.studyProgram,
        updatedProfile.semester,
        updatedProfile.languages
      );
      onSave(updatedProfile);
      onClose();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const semesterOptions = [
    'SS16',
    'WS16-17',
    'SS17',
    'WS17-18',
    'SS18',
    'WS18-19',
    'SS19',
    'WS19-20',
    'SS20',
    'WS20-21',
    'SS21',
    'WS21-22',
    'SS22',
    'WS22-23',
    'SS23',
    'WS23-24',
    'SS24',
    'WS24-25',
    'SS25',
    'WS25-26',
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>Edit Profile</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label={t.firstName}
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label={t.lastName}
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label={t.email}
            name="Email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label={t.studyProgram}
            name="studyProgram"
            value={formData.studyProgram}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            select
            label={t.semester}
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            variant="outlined"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a semester</option>
            {semesterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
          <FormControl sx={{ mb: '0.5rem' }} fullWidth>
            <InputLabel id="language-label">{t.languages}</InputLabel>
            <Select
              labelId="language-label"
              id="language-select"
              value={formData.languages ? formData.languages.split(',') : []}
              multiple
              label={t.languages}
              variant="outlined"
              onChange={(e) => {
                const languages = (e.target.value as string[]).join(',');
                setFormData((prev) => ({ ...prev, languages }));
              }}
              renderValue={(selected) => selected.join(', ')}
              fullWidth
            >
              {Object.keys(Language).map((key) => (
                <MenuItem key={key} value={key}>
                  <Checkbox checked={formData.languages.includes(key)} />
                  <ListItemText primary={Language[key]} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={<EditIcon />}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const MyProfilePage = () => {
  const router = useRouter();
  const { myProfile: t, logInSystem: l } = getLocaleObject(router);
  const [userInfo, setUserInfo] = useState(undefined);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [persona, setPresetProfileName] = useState('Blank');
  const [trafficLightStatus, setTrafficLightStatus] = useState(false);
  const [sectionReviewStatus, setSectionReviewStatus] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);

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

  useEffect(() => {
    if (tabValue === 0 && (profileData === null || isProfileUpdated)) {
      getUserProfile()
        .then((data) => {
          setProfileData(data);
          setIsProfileUpdated(false);
        })
        .catch((err) => {
          console.error('Error fetching profile data:', err);
          setProfileData({ error: 'Failed to load profile information' });
        });
    }
  }, [tabValue, profileData, isProfileUpdated]);

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

  const handleProfileUpdate = (updatedData) => {
    setProfileData((prev) => ({
      ...prev,
      ...updatedData,
    }));
    setIsProfileUpdated(true);
  };

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
              gap: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: '2.5rem',
                bgcolor: 'white',
                color: PRIMARY_COL,
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
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Verified Account
                  </Typography>
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
              <Tab icon={<AccountCircleIcon />} iconPosition="start" label={t.profile} />
              <Tab icon={<SettingsIcon />} iconPosition="start" label={t.Settings} />
              <Tab icon={<DownloadIcon />} iconPosition="start" label={t.dataExport} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined">
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'primary.light',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h6">{t.personalInfo}</Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setOpenEditDialog(true)}
                    >
                      Edit
                    </Button>
                  </Box>
                  <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 2 }}>
                    {profileData ? (
                      <Stack spacing={2}>
                        {[
                          { label: t.firstName, value: profileData.firstName },
                          { label: t.lastName, value: profileData.lastName },
                          { label: t.email, value: profileData.email },
                          { label: t.studyProgram, value: profileData.studyProgram },
                          { label: t.semester, value: profileData.semester },
                          { label: t.languages, value: profileData.languages },
                        ].map((field) => (
                          <Box key={field.label} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 140 }}
                            >
                              {field.label}:
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.primary' }}>
                              {field.value || '-'}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography sx={{ color: 'text.secondary' }}>Loading...</Typography>
                    )}
                  </Box>
                </Card>
              </Box>

              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">{t.dataAlea}</Typography>
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
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined">
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">{t.displaySettings}</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography fontWeight="medium">Show Traffic Light on Notes</Typography>
                        <Switch
                          checked={trafficLightStatus}
                          onChange={() => handleTrafficLight(!trafficLightStatus)}
                          color="primary"
                        />
                      </Paper>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography fontWeight="medium">Show Review Section on Notes</Typography>
                        <Switch
                          checked={sectionReviewStatus}
                          onChange={() => handleSectionReviewStatus(!sectionReviewStatus)}
                          color="primary"
                        />
                      </Paper>
                    </Stack>
                  </Box>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 50%' }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">{t.accountInformation}</Typography>
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
                      Account Type:{' '}
                      <strong>
                        {userInfo.userId.startsWith(ANON_USER_ID_PREFIX)
                          ? 'Anonymous'
                          : 'Registered'}
                      </strong>
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
                      Warning: This action cannot be undone. All your data will be permanently
                      deleted.
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

      <EditProfileDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        profileData={profileData}
        userId={userInfo?.userId}
        onSave={handleProfileUpdate}
      />
    </MainLayout>
  );
};

export default MyProfilePage;
