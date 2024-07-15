import axios from 'axios';
import { AccessControlList } from './access-control';
import { getAuthHeaders } from './lms';

export async function getAllAclIds() : Promise<string[]> {
  const resp = await axios.get('/api/access-control/get-all-acl-ids');
  return resp.data as string[];
}

export async function createAcl(newAcl: CreateACLRequest) : Promise<void> {
  await axios.post('/api/access-control/create-acl', newAcl);
}

export async function getAcl(aclId:string) : Promise<AccessControlList>{
  const resp = await axios.get(
    `/api/access-control/get-acl?id=${aclId}`
  );
  return resp.data as AccessControlList;
}

export async function updateAcl(updateAcl : UpdateACLRequest):Promise<void>{
  await axios.post('/api/access-control/update-acl', updateAcl, {headers: getAuthHeaders()});
}

export async function isUserMember(id : string): Promise<boolean>{
  const {data} = await axios.get(`/api/access-control/is-user-member?id=${id}`,{ headers: getAuthHeaders() });
  return data as boolean;
}

export async function isMember(id : string, userId : string): Promise<boolean>{
  const {data} = await axios.get(`/api/access-control/is-member?id=${id}&userId=${userId}`, { headers: getAuthHeaders() });
  return data as boolean;
}

export async function isValid(id : string):Promise<boolean>{
  const {data} =  await axios.get(`/api/access-control/is-valid?id=${id}`, { headers: getAuthHeaders() });
  return data as boolean;
}

export async function recomputeMemberships() : Promise<number>{
  const {data} = await axios.post('/api/access-control/recompute-memberships', {}, { headers: getAuthHeaders() });
  return data as number;
}

export type UpdateACLRequest = Omit<
  AccessControlList,
   'updatedAt'|'createdAt'
>;

export type CreateACLRequest = Omit<
  AccessControlList,
  'createdAt' | 'updatedAt'
>;
