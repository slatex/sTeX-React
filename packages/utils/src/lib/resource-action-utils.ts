import { NextApiRequest, NextApiResponse } from "next";
import {isMemberOfAcl} from '../../../alea-frontend/pages/api/acl-utils/acl-common-utils'
import {executeAndEndSet500OnError, getUserIdOrSetError} from '../../../alea-frontend/pages/api/comment-utils'

export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}