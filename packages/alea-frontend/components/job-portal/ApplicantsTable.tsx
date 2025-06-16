import {
  Cancel,
  Download,
  FileOpen,
  PauseCircle,
  PersonAdd,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ApplicantWithProfile, updateJobApplication } from '@stex-react/api';
import Link from 'next/link';
import { useState } from 'react';
import { getSocialIcon, UserProfileCard } from './UserProfileCard';

const ActionButtons = ({
  applicant,
  updateApplicant,
}: {
  applicant: ApplicantWithProfile;
  updateApplicant: (updatedApplicant: ApplicantWithProfile) => void;
}) => {
  async function handleShortlistApplication(applicant: ApplicantWithProfile) {
    const application = {
      ...applicant,
      applicationStatus: 'SHORTLISTED_FOR_INTERVIEW',
      recruiterAction: 'SHORTLIST_FOR_INTERVIEW',
    };
    const res = await updateJobApplication(application);
    updateApplicant(application);
  }

  async function handleRejectApplication(applicant: ApplicantWithProfile) {
    const application = {
      ...applicant,
      applicationStatus: 'REJECTED',
      recruiterAction: 'REJECT',
    };
    const res = await updateJobApplication(application);
    updateApplicant(application);
  }
  async function handleKeepOnHoldApplication(applicant: ApplicantWithProfile) {
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
      {Object.entries(socialLinks).map(([platform, url], index) => (
        <Tooltip key={index} title={platform.charAt(0).toUpperCase() + platform.slice(1)} arrow>
          <IconButton component="a" href={url ? String(url) : '#'} target="_blank">
            {getSocialIcon(platform)}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};
const ApplicantRow = ({
  applicant,
  index,
  updateApplicant,
}: {
  applicant: ApplicantWithProfile;
  index: number;
  updateApplicant: (updatedApplicant: ApplicantWithProfile) => void;
}) => {
  console.log({ applicant });
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleViewApplicant = (applicant: ApplicantWithProfile) => {
    const profile = { ...applicant.studentProfile };
    const socialLinks = profile?.socialLinks || {};
    profile.socialLinks = {
      linkedin: socialLinks.linkedin || 'N/A',
      github: socialLinks.github || 'N/A',
      twitter: socialLinks.twitter || 'N/A',
      ...socialLinks,
    };
    setSelectedProfile(profile);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };
  const handleDownloadResume = (applicant: ApplicantWithProfile) => {
    alert('Download Functionality not active as of now');
  };
  return (
    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <Box sx={{ textAlign: 'left' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {applicant.studentProfile.name}
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
              p: 2,
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
              <UserProfileCard type="student" userData={selectedProfile} showPortfolioLinks />
            </Box>
          </Box>
        </Modal>
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>{applicant?.jobPostTitle}</TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <SocialLinks socialLinks={applicant.studentProfile.socialLinks} />
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <ActionButtons applicant={applicant} updateApplicant={updateApplicant} />
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        {new Date(applicant.createdAt).toLocaleString()}
      </TableCell>
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
            <Link href={applicant?.studentProfile?.resumeUrl || '#'} passHref legacyBehavior>
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
export const ApplicantTable = ({
  loading,
  filteredApplicants,
  setFilteredApplicants,
}: {
  loading: boolean;
  filteredApplicants: ApplicantWithProfile[];
  setFilteredApplicants: React.Dispatch<React.SetStateAction<ApplicantWithProfile[]>>;
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const handleSort = (criteria: 'date' | 'name') => {
    const sortedApplicants = [...filteredApplicants];
    if (criteria === 'date') {
      sortedApplicants.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (criteria === 'name') {
      sortedApplicants.sort((a, b) => a.studentProfile.name.localeCompare(b.studentProfile.name));
    }
    setFilteredApplicants(sortedApplicants);
    setSortBy(criteria);
  };
  const updateApplicant = (updatedApplicant: ApplicantWithProfile) => {
    setFilteredApplicants((prev: ApplicantWithProfile[]) =>
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
