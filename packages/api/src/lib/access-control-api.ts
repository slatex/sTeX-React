import axios from 'axios';
import { AccessControlList } from './access-control';

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
  await axios.post('/api/access-control/update-acl', updateAcl)
}


export type UpdateACLRequest = Omit<
  AccessControlList,
   'updatedAt'|'createdAt'
>;

export type CreateACLRequest = Omit<
  AccessControlList,
  'createdAt' | 'updatedAt'
>;
