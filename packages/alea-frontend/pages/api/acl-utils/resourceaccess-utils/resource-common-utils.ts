import { RESOURCE_CACHE } from './resource-store';
export function getCacheKey(resourceId: string, actionId: string) {
  return `resource-assignment:${resourceId}-${actionId}`;
}

export async function returnAclIdForResourceIdAndActionId(resourceId: string, actionId: string) {
  try {
    const aclId = await RESOURCE_CACHE.getAclId(resourceId, actionId);
    return aclId;
  } catch (error) {
    // console.error(error);
    return null;
  }
}
