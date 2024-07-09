import axios from 'axios';
import { AccessControlList } from './access-control';
import { getAuthHeaders } from './lms';

export async function getAllAclIds() {
  const resp = await axios.get('/api/access-control/get-all-acl-ids');
  return resp.data as string[];
}

export async function createAcl(newAcl: CreateACLRequest){
  await axios.post('/api/access-control/create-acl', newAcl);
}

export async function getAcl(aclId:string){
  const resp = await axios.get(
    `/api/access-control/get-acl?id=${aclId}`
  );
  return resp.data as AccessControlList;
}

export async function updateAcl(updateAcl : UpdateACLRequest){
  await axios.post('/api/access-control/update-acl', {updateAcl}, {headers: getAuthHeaders()});
}

export async function isUserMember(id : string){
  const {data} = await axios.get(`/api/access-control/is-user-member?id=${id}`,{ headers: getAuthHeaders() });
  return data;
}

export async function isMember(id : string, userId : string){
  const {data} = await axios.get(`/api/access-control/is-member?id=${id}&userId=${userId}`, { headers: getAuthHeaders() });
  return data;
}

export async function isValid(id : string){
  const {data} =  await axios.get(`/api/access-control/is-valid?id=${id}`, { headers: getAuthHeaders() });
  return data;
}

export async function recomputeMemberships(){
  await axios.post('/api/access-control/recompute-memberships', {}, { headers: getAuthHeaders() });
}

export type UpdateACLRequest = Omit<
  AccessControlList,
   'updatedAt'|'createdAt'
>;

export type CreateACLRequest = Omit<
  AccessControlList,
  'createdAt' | 'updatedAt'
>;
