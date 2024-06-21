import axios from 'axios';
import { AccessControlList } from './access-control';

export async function getAllAclIds() {
  const resp = await axios.get('/api/access-control/get-all-acl-ids');
  return resp.data as string[];
}

export type CreateACLRequest = Omit<
  AccessControlList,
  'createdAt' | 'updatedAt'
>;
