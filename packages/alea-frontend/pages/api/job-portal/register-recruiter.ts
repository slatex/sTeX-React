import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, getUserIdOrSetError } from '../comment-utils';
import { CURRENT_TERM } from '@stex-react/utils';
import { unsafeCreateResourceAccessUnlessForced } from '../access-control/create-resourceaction';
import { checkInviteToOrg } from './check-org-invitations';
import { getOrganizationByDomain } from './get-org-by-domain';
import { createOrganizationProfile } from './create-organization-profile';
import { getOrganizationId } from './get-organization-id';
import { createRecruiterProfile } from './create-recruiter-profile';
import { createAcl } from '../access-control/create-acl';
import { addRemoveMember } from '../access-control/add-remove-member';
import {
  deleteAcl,
  deleteOrganizationProfile,
  deleteRecruiterProfile,
  RecruiterData,
} from '@stex-react/api';

export async function createNewOrganizationAndRecruiter(
  companyName: string,
  domain: string,
  recruiterData: { name: string; email: string; position: string },
  userId: string,
  res: NextApiResponse
) {
  let orgId: string;
  let aclResult: { status: number; message?: string };
  let recruiter: RecruiterData;
  try {
    const organizationData = { companyName, domain };
    const result = await createOrganizationProfile(organizationData, res);
    if (!result) throw new Error('Failed to create Organization Profile');
    orgId = await getOrganizationId(companyName, res);
    recruiter = await createRecruiterProfile(
      { ...recruiterData, userId: userId, organizationId: orgId },
      res
    );
    if (!recruiter) throw new Error('Failed to create Recruiter Profile');
    const newAcl = {
      id: `org${orgId}-recruiters`,
      description: `Recruiters of ${companyName}`,
      memberUserIds: [userId],
      memberACLIds: [],
      updaterACLId: `org${orgId}-recruiters`,
      isOpen: false,
    };
    aclResult = await createAcl(newAcl, res);
    if (aclResult.status !== 201) {
      throw new Error(aclResult.message || 'Failed to create ACL');
    }
    const resourceId = `/instance/${CURRENT_TERM}/orgId/${orgId}`;
    const actionId = 'CREATE_JOB_POST';
    const aclId = `org${orgId}-recruiters`;
    const resourceAccessResult = await unsafeCreateResourceAccessUnlessForced(
      resourceId,
      actionId,
      aclId,
      res
    );
    if (resourceAccessResult.status !== 200) {
      throw new Error(resourceAccessResult.message || 'Failed to create resource acess');
    }
    return {
      status: 201,
      message: 'Organization, recruiter, ACL, and resource access created successfully',
    };
  } catch (error) {
    // Rollback
    if (orgId) {
      await deleteOrganizationProfile(orgId);
    }
    if (recruiter) {
      await deleteRecruiterProfile(String(recruiter?.organizationId));
    }
    if (aclResult?.status === 201) {
      await deleteAcl(`org${orgId}-recruiters`);
    }
    if (res.writableEnded) return;
    res.status(500).json({
      message: error.message || 'An error occurred while creating organization and recruiter',
    });
  }
}

export async function createRecruiterAndAddToAcl(
  recruiterData: { name: string; email: string; position: string },
  orgId: string,
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  let recruiter: RecruiterData;
  try {
    const recruiter = await createRecruiterProfile(
      { ...recruiterData, userId, organizationId: orgId },
      res
    );
    if (!recruiter) throw new Error('Failed to create Recruiter Profile');
    const result = await addRemoveMember(
      {
        memberId: userId,
        aclId: `org${orgId}-recruiters`,
        isAclMember: false,
        toBeAdded: true,
      },
      req,
      res
    );
    if (result.status !== 200) throw new Error('Failed to add member to ACL');
  } catch {
    //Rollback
    if (recruiter) {
      await deleteRecruiterProfile(String(recruiter.organizationId));
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const { name, email, position, companyName } = req.body;

  if (!email || !name || !position || !userId) {
    return res.status(422).send('Missing required fields');
  }
  const domain = email.split('@')[1];
  const existingOrg = await getOrganizationByDomain(domain, res);
  if (Array.isArray(existingOrg) && existingOrg.length > 0) {
    const orgId = existingOrg[0].id;
    const inviteResp = await checkInviteToOrg(orgId, email, res);
    const hasInvite = inviteResp?.hasInvites;
    if (!hasInvite) {
      return res.status(200).json({ message: 'No invite found', showInviteDialog: true });
    }
    await createRecruiterAndAddToAcl({ name, email, position }, orgId, userId, req, res);
    return res
      .status(200)
      .json({ message: 'Recruiter profile created successfully', showProfilePopup: true });
  }
  const result = await createNewOrganizationAndRecruiter(
    companyName,
    domain,
    { name, email, position },
    userId,
    res
  );
  if (result.status === 201)
    return res.status(200).json({
      message: 'Recruiter profile and organization created successfully',
      showProfilePopup: true,
    });
}
