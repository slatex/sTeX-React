import { getReviewRequests, ReviewType } from '@stex-react/api';
import { useRouter } from 'next/router';
import { ShowReviewRequests } from 'packages/stex-react-renderer/src/lib/nap/ShowReviewRequests';
import { useState, useEffect } from 'react';

export function ProblemReviewModeratorStats({ courseId }: { courseId: string }) {
  const [reviewRequests, setReviewRequests] = useState<
    {
      answers: { subProblemId: number; id: number; answer: string; answerId: number }[];
      questionTitle: string;
    }[]
  >([]);
  const router = useRouter();
  useEffect(() => {
    getReviewRequests(ReviewType.INSTRUCTOR, courseId).then(setReviewRequests);
  }, [courseId]);
  function onAnswerSelected(reviewId: number) {
    router.push(`./${courseId}/${reviewId}`);
  }
  return (
    <>
      <ShowReviewRequests
        onAnswerSelected={onAnswerSelected}
        courseId={courseId}
        reviewRequests={reviewRequests}
      ></ShowReviewRequests>
    </>
  );
}
