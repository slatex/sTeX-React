import axios from "axios";

export async function getAllAclIds() {
  const resp = await axios.get('/api/access-control/get-all-acl-ids');
  return resp.data as string[];
}
