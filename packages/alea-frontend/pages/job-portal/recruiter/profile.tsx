import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
import { Action, CURRENT_TERM, PRIMARY_COL, ResourceName } from '@stex-react/utils';
import EditIcon from '@mui/icons-material/Edit';
import {
  canAccessResource,
  getOrganizationProfile,
  getRecruiterProfile,
  OrganizationData,
  RecruiterData,
  updateRecruiterProfile,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import {
  LinkedIn,
  YouTube,
  Language,
  GitHub,
  Twitter,
  OpenInNew,
  InsertDriveFile,
} from '@mui/icons-material';
import Link from 'next/link';

export const getSocialIcon = (name) => {
  switch (name.toLowerCase()) {
    case 'linkedin':
      return <LinkedIn sx={{ color: ' #0077b5' }} />;
    case 'twitter':
      return <Twitter sx={{ color: ' #08a0e9' }} />;
    case 'github':
      return <GitHub sx={{ color: 'black' }} />;
    case 'youtube':
      return <YouTube sx={{ color: 'red' }} />;

    default:
      return (
        <Avatar sx={{ bgcolor: '#806BE7', color: 'white', fontWeight: 'bold' }}>
          {name[0].toUpperCase()}
        </Avatar>
      );
  }
};

const ProfileForm = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    position: '',
    email: '',
    mobile: '',
    alternateMobile: '',
    about: '',
    socialLinks: {},
    organization: {
      companyName: '',
      isStartup: '',
      companyType: '',
      incorporationYear: '',
      website: '',
      about: '',
      officeAddress: '',
      officePincode: '',
    },
  });

  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [recruiter, setRecruiter] = useState<RecruiterData>(null);
  const [organization, setOrganization] = useState<OrganizationData>(null);
  const router = useRouter();
  useEffect(() => {
    const checkAccess = async () => {
      setAccessCheckLoading(true);
      const hasAccess = await canAccessResource(ResourceName.JOB_PORTAL, Action.CREATE_JOB_POST, {
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
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);

        const res = await getRecruiterProfile();
        let parsedSocialLinks = res?.socialLinks ? JSON.parse(res.socialLinks) : {};
        console.log({ parsedSocialLinks });
        const requiredSocialLinks = {
          linkedin: parsedSocialLinks.linkedin || 'N/A',
          github: parsedSocialLinks.github || 'N/A',
          twitter: parsedSocialLinks.twitter || 'N/A',
          ...parsedSocialLinks,
        };
        console.log({ requiredSocialLinks });
        console.log({ res });
        setRecruiter(res);
        const organizationDetail = await getOrganizationProfile(res?.organizationId);
        setOrganization(organizationDetail);
        setProfileData((prevData) => ({
          ...prevData,
          name: res?.name || '',
          position: res?.position || '',
          email: res?.email || '',
          mobile: res?.mobile || '',
          alternateMobile: res?.altMobile || '',
          about: res.about,
          socialLinks: requiredSocialLinks,
          organization: {
            companyName: organizationDetail?.companyName || 'N/A',
            isStartup: organizationDetail?.isStartup || 'N/A',
            companyType: organizationDetail?.companyType || 'N/A',
            incorporationYear: organizationDetail?.incorporationYear || 'N/A',
            website: organizationDetail?.website || 'N/A',
            about: organizationDetail?.about || 'N/A',
            officeAddress: organizationDetail?.officeAddress || 'N/A',
            officePincode: organizationDetail?.officePincode || 'N/A',
          },
        }));
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, [accessCheckLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleEdit = () => {
    console.log('editing');
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedProfile = {
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.mobile,
        altMobile: profileData.alternateMobile,
        position: profileData.position,
        about: profileData.about,
      };

      await updateRecruiterProfile(updatedProfile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // const { userId, name, email, mobile, altMobile, position } = recruiter || {};

  // const { companyName, companyType, officeAddress, officePincode, website } = organization || {};

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <Box
        sx={{
          maxWidth: 1200,
          flex: 2,
          padding: 4,
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Profile Information
        </Typography>

        <Card sx={{ marginBottom: 1, px: 10, borderRadius: '20px' }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              sx={{ mb: 6 }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom color={PRIMARY_COL}>
                Edit Profile
              </Typography>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: '50px',
                    paddingX: 5,
                    paddingY: 1,
                    textTransform: 'none',
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    borderRadius: '50px',
                    paddingX: 5,
                    paddingY: 1,
                    textTransform: 'none',
                    bgcolor: '#806BE7',
                    color: 'white',
                  }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Box>
            </Box>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', mb: '20px' }}
            >
              Personal Details
              <Box
                sx={{
                  flexGrow: 1,
                  height: '1px',
                  backgroundColor: '#cfd0d1',
                  marginLeft: 2,
                }}
              />
            </Typography>

            <Box display="flex" flexDirection="column">
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" width="100%">
                <TextField
                  label="Full Name"
                  variant="standard"
                  fullWidth
                  sx={{ maxWidth: '350px', m: '30px 0 0' }}
                  value={profileData.name}
                  onChange={handleChange}
                  name="name"
                />

                <TextField
                  label="Designation"
                  variant="standard"
                  fullWidth
                  sx={{ maxWidth: '350px', m: '20px 0 0' }}
                  value={profileData.position}
                  onChange={handleChange}
                  name="position"
                />
              </Box>

              <Box display="flex" flexWrap="wrap" justifyContent="space-between" width="100%">
                <TextField
                  label="Email"
                  variant="standard"
                  fullWidth
                  sx={{ maxWidth: '350px', m: '20px 0 0' }}
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  name="email"
                />

                <TextField
                  label="Mobile"
                  variant="standard"
                  fullWidth
                  sx={{ maxWidth: '350px', m: '20px 0 0' }}
                  value={profileData.mobile}
                  onChange={handleChange}
                  name="mobile"
                  type="tel"
                />
              </Box>

              <Box display="flex" flexWrap="wrap" justifyContent="space-between" width="100%">
                <TextField
                  label="Alternate Mobile"
                  variant="standard"
                  fullWidth
                  sx={{ maxWidth: '350px', overflowX: 'auto', m: '20px 0 0' }}
                  value={profileData.alternateMobile}
                  onChange={handleChange}
                  name="alternateMobile"
                  type="tel"
                />
              </Box>
            </Box>
          </CardContent>
          <Card sx={{ m: '30px 0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About Me
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={profileData.about}
                onChange={handleChange}
                name="about"
              />
            </CardContent>
          </Card>
        </Card>

        <Card sx={{ marginBottom: 3, borderRadius: '20px' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Organization Details
              </Typography>
              <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography>
                  <strong>Organization:</strong> {profileData?.organization?.companyName}
                </Typography>
                <Typography>
                  <strong>Startup:</strong> {profileData?.organization?.isStartup}
                </Typography>
                <Typography>
                  <strong>Company Type:</strong> {profileData?.organization?.companyType || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Incorporation Year:</strong>{' '}
                  {profileData?.organization?.incorporationYear || 'N/A'}
                </Typography>
              </Box>

              {/* Right Side */}
              <Box sx={{ flex: '1 1 45%' }}>
                <Typography>
                  <strong>Website:</strong> {profileData?.organization?.website || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Office Address:</strong>{' '}
                  {profileData?.organization?.officeAddress || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Office Pincode:</strong>{' '}
                  {profileData?.organization?.officePincode || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography>
                <strong>About:</strong> {profileData?.organization?.about || 'N/A'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#e0e0e0',
          padding: 3,
        }}
      >
        <ProfileCard userType="employee" profileData={profileData} />
      </Box>
    </Box>
  );
};
const Profile = () => {
  return <JpLayoutWithSidebar role="recruiter">{<ProfileForm />}</JpLayoutWithSidebar>;
};

export const ProfileCard = ({ profileData, userType }) => {
  console.log({ profileData });
  console.log({ userType });
  const { name, email, mobile, socialLinks } = profileData;
  console.log({ socialLinks });
  const websiteUrl = profileData?.organization?.website.startsWith('http')
    ? profileData?.organization?.website
    : `https://${profileData?.organization?.website}`;

  return (
    // <Box sx={{ flex: 1, backgroundColor: '#e0e0e0', padding: 3 }}>
    <Box sx={{ flex: 1 }}>
      <Paper sx={{ padding: 3, backgroundColor: 'white' }}>
        <Card elevation={3} sx={{ padding: 4, borderRadius: 3, backgroundColor: '#f9f9f9' }}>
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
                {name}
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

            {userType === 'student' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Programme
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.programme}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Course
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.courses}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Grades
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.grades}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Year Of Admission
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.yearOfAdmission}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Year Of Graduation
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.yearOfGraduation}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Resume
                  </Typography>
                  {profileData.resumeUrl ? (
                    <Link href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <InsertDriveFile sx={{ color: '#1976d2' }} />
                      Open Resume
                    </Link>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No resume available
                    </Typography>
                  )}
                </Grid>
              </>
            )}

            {userType === 'employee' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Position
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.position}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Organization
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.organization?.companyName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Organization Website
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <Link href={websiteUrl} target="_blank" rel="noopener noreferrer">
                      {profileData.organization.website}
                      <OpenInNew fontSize="small" />
                    </Link>
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Card>
      </Paper>

      <Paper sx={{ padding: 3, mt: 2, backgroundColor: 'white' }}>
        <Card
          elevation={3}
          sx={{ flex: '1 1 1%', padding: 4, borderRadius: 3, backgroundColor: '#f9f9f9' }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Portfolios
          </Typography>
          {socialLinks && Object.keys(socialLinks).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(socialLinks).map(([name, url], index) => (
                <Grid item xs={12} key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title={name.charAt(0).toUpperCase() + name.slice(1)} arrow>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: 'white',
                        fontSize: 'large',
                        cursor: 'pointer',
                      }}
                    >
                      {getSocialIcon(name)}
                    </Avatar>
                  </Tooltip>
                  {url && url !== 'N/A' ? (
                    <Link href={String(url)} passHref>
                      <a
                        target="_blank"
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: '#333',
                          textDecoration: 'underline',
                        }}
                      >
                        {String(url)}
                      </a>
                    </Link>
                  ) : (
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', color: '#777' }}>
                      N/A
                    </Typography>
                  )}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No social links available</Typography>
          )}
        </Card>
      </Paper>
    </Box>
  );
};

export default Profile;
