import { Box, CircularProgress } from '@mui/material';
import {
  canAccessResource,
  getJobApplicationsByJobPost,
  getJobPosts,
  getOrganizationProfile,
  getRecruiterProfile,
  JobApplicationInfo,
  JobPostInfo,
  OrganizationData,
  RecruiterData,
} from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { useRouter } from 'next/router';
import JpLayoutWithSidebar from 'packages/alea-frontend/layouts/JpLayoutWithSidebar';
import { useEffect, useMemo, useState } from 'react';

import { Group, HourglassEmpty, HowToReg, TaskAlt } from '@mui/icons-material';
import { DashboardJobSection, StatsSection } from '../student/dashboard';
import {
  RecruiterProfileData,
  UserProfileCard,
} from 'packages/alea-frontend/components/job-portal/UserProfileCard';

export function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState<RecruiterData>(null);
  const [organization, setOrganization] = useState<OrganizationData>(null);
  const [statusState, setStatusState] = useState<{
    totalApplications: number;
    pendingApplications: number;
    shortlistedCandidates: number;
    offeredCandidates: number;
  }>({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedCandidates: 0,
    offeredCandidates: 0,
  });
  const [jobPostsByRecruiter, setJobPostsByRecruiter] = useState<JobPostInfo[]>([]);
  const router = useRouter();
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const recProfile = await getRecruiterProfile();
        setRecruiter(recProfile);

        const hasAccess = await canAccessResource(
          ResourceName.JOB_PORTAL_ORG,
          Action.CREATE_JOB_POST,
          {
            orgId: String(recProfile.organizationId),
            instanceId: CURRENT_TERM,
          }
        );

        if (!hasAccess) {
          alert('You do not have access to this page.');
          router.push('/job-portal');
          return;
        }

        const organizationDetail = await getOrganizationProfile(recProfile?.organizationId);
        setOrganization(organizationDetail);
        const orgJobPosts = await getJobPosts(organizationDetail.id);
        const recruiterPosts = orgJobPosts.filter(
          (post) => post.createdByUserId === recProfile.userId
        );
        setJobPostsByRecruiter(recruiterPosts);
        const applicationsByJobPost = await Promise.all(
          recruiterPosts.map(async (job) => {
            const applications = await getJobApplicationsByJobPost(job.id);
            return { jobId: job.id, applications };
          })
        );
        const applicationsMap = applicationsByJobPost.reduce((acc, { jobId, applications }) => {
          acc[jobId] = applications;
          return acc;
        }, {} as Record<number, JobApplicationInfo[]>);
        setStatusState(transformApplicationData(applicationsMap));
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const stats = [
    //TODO , later on will add Interviews
    { key: 'totalApplications', label: 'Applications Received' },
    { key: 'pendingApplications', label: 'Pending Applications' },
    { key: 'shortlistedCandidates', label: 'Shortlisted Candidates' },
    { key: 'offeredCandidates', label: 'Offer Sent' },
  ];
  const colors = ['#1CD083', '#5A69E2', '#48A9F8', '#8BC741'];
  const iconComponents = [Group, HourglassEmpty, HowToReg, TaskAlt];
  const transformApplicationData = (applicationData: { [jobId: string]: JobApplicationInfo[] }) => {
    const stats = {
      totalApplications: 0,
      pendingApplications: 0,
      shortlistedCandidates: 0,
      offeredCandidates: 0,
    };
    Object.values(applicationData).forEach((applications) => {
      applications.forEach(({ recruiterAction }) => {
        stats.totalApplications += 1;

        if (recruiterAction === 'NONE') {
          stats.pendingApplications += 1;
        } else if (recruiterAction === 'SHORTLIST_FOR_INTERVIEW') {
          stats.shortlistedCandidates += 1;
        } else if (recruiterAction === 'SEND_OFFER') {
          stats.offeredCandidates += 1;
        }
      });
    });
    return stats;
  };

  const recruiterWithOrg: RecruiterProfileData | null = useMemo(() => {
    if (!recruiter || !organization) return null;
    const { domain, id, ...orgWithoutFields } = organization;
    const { organizationId, ...recruiterWithoutOrgId } = recruiter;
    return {
      ...recruiterWithoutOrgId,
      organization: orgWithoutFields,
    };
  }, [recruiter, organization]);

  if (loading) {
    return <CircularProgress color="primary" />;
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: { xs: '30px 16px', md: '30px' } }}>
      <StatsSection
        stats={stats}
        iconComponents={iconComponents}
        colors={colors}
        statusState={statusState}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 5 }}>
        <UserProfileCard type="recruiter" userData={recruiterWithOrg} />
        <DashboardJobSection
          title="Jobs Posted by you"
          jobs={jobPostsByRecruiter}
          buttonText="Post More Jobs"
          buttonLink="/job-portal/recruiter/create-job"
          hideJobRedirect={true}
        />
      </Box>
    </Box>
  );
}

const Dashboard = () => {
  return <JpLayoutWithSidebar role="recruiter">{<RecruiterDashboard />}</JpLayoutWithSidebar>;
};

export default Dashboard;
