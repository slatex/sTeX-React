import { ResourceAction } from '@stex-react/api';

export abstract class AbstractResourceAssignmentCache {
  abstract initialize(resourceAccessData: ResourceAction[]): Promise<void>;
  abstract storeResourceAccessData(resourceAccessData: ResourceAction[]): Promise<void>;
  abstract getAclId(resourceId: string, actionId: string): Promise<string | { error: any }>;
}
