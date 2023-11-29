import { NextApiRequest, NextApiResponse } from "next";
import { checkIfPostOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from "../../comment-utils";
import { Studybuddy } from "@stex-react/api";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (!checkIfPostOrSetError(req, res)) return;
    const userId = await getUserIdOrSetError(req, res);

    const courseId = req.query.courseId as string

    const { intro, studyProgram, email, semester, presence, languages, time } = req.body as Studybuddy;

    const active = true;

    let results = undefined;

    results = await executeAndEndSet500OnError(
        'REPLACE INTO StudyBuddyConnectUsers (intro, studyProgram, email, semester, presence, languages, time, active, userId, courseId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [intro, studyProgram, email, semester, presence, languages, time, active, userId, courseId],
        res
      );

    if (!results) return;
    res.status(204).end();
  }