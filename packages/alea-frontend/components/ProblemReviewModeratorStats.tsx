import { getReviewRequests, ReviewType } from "@stex-react/api";
import { ShowReviewRequests } from "packages/stex-react-renderer/src/lib/nap/ShowReviewRequests";
import { useState, useEffect } from "react";

export function ProblemReviewModeratorStats({ courseId }: { courseId: string }){
    const [reviewRequests, setReviewRequests] = useState<
    {
      answers: { subProblemId: number; id: number; answer: string; answerId: number }[];
      questionTitle: string;
    }[]
  >([]);
    useEffect(() => {
        getReviewRequests(ReviewType.INSTRUCTOR,courseId).then(setReviewRequests);
      }, [courseId]);
    return (<><ShowReviewRequests courseId={courseId} reviewRequests={reviewRequests}></ShowReviewRequests></>)
}