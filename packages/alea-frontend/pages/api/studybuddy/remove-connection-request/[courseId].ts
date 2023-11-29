import { NextApiRequest, NextApiResponse } from "next";
import { checkIfPostOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from "../../comment-utils";
import { StudyBuddyConnection } from "@stex-react/api";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (!checkIfPostOrSetError(req, res)) return;
    const userId = await getUserIdOrSetError(req, res);

    const courseId = req.query.courseId as string

    const { receiverId } = req.body as StudyBuddyConnection;

    let results = undefined;

    results = await executeAndEndSet500OnError(
        'DELETE FROM StudyBuddyConnections WHERE userId=? AND receiverId=? AND courseId=?',
        [ userId, receiverId, courseId],
        res
      );

    if (!results) return;
    res.status(204).end();
  }