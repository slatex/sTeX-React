import { Box } from '@mui/material';
import {
  FileNode,
  Problem,
  QuizResult,
  TimerEvent,
  ProblemResponse,
  getDocumentTree,
  getElapsedTime,
  getTotalElapsedTime,
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import {
  ServerLinksContext,
  QuizDisplay,
} from '@stex-react/stex-react-renderer';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MainLayout from '../../../layouts/MainLayout';

export function getQuizResult(
  quizTakerName: string,
  quizName: string,
  events: TimerEvent[],
  problemUrls: string[],
  responses: { [problemId: string]: ProblemResponse },
  points: { [problemId: string]: number | undefined }
): QuizResult {
  return {
    resultId: uuidv4(),
    quizName,
    quizTakerName,
    events,
    duration_ms: getTotalElapsedTime(events),
    problemInfo: problemUrls.map((url, idx) => ({
      duration_ms: getElapsedTime(events, idx),
      url,
      response: responses[url],
      points: points[url],
    })),
  };
}

function getMaaiMayProblemURLs(mmtUrl: string, full: boolean) {
  console.log(mmtUrl);
  const problemFilepaths = [
    'mathliteracy/prob/problem003.en',
    'mathliteracy/prob/problem004.en',
    'mathliteracy/prob/problem005.en',
    'mathliteracy/prob/problem007.en',
    'mathliteracy/prob/problem012.en',
    'mathliteracy/prob/problem000.en',
    'AuD/prob/problem002.de',
    'AuD/prob/problem003.de',
    'AuD/prob/problem005.de',
    'AuD/prob/problem008.de',
    'AuD/prob/problem009.de',
    'AuD/prob/problem010a.de',
    'AuD/prob/problem014.de',
    'programming/prob/loop-complexity.en',
    'theoinf/prob/tsp-props.en',
    'theoinf/prob/lang-props.en',
    'theoinf/prob/fa-ab1.en',
    'theoinf/prob/tf-regular-accepts.en',
    'theoinf/prob/tf-cfl-undec.en',
    'theoinf/prob/TM-equiv.en',
    'db/prob/erdiag1.en',
    'db/prob/erdiag2.en',
    'db/prob/relation-model.en',
    'db/prob/SQL1.en',
    'security/prob/sccrypto-which.en',
    'security/prob/hash-which.en',
    'security/prob/keys.en',
    'security/prob/procmodes.en',
    'logic/prob/pl0-tautologies.en',
    'logic/prob/pl1-classification-short.en',
    'mathliteracy/prob/problem016.en',
    'math/prob/problem002.en',
    'math/prob/problem006.en',
    'math/prob/problem007.en',
    'math/prob/problem008.en',
    'math/prob/problem010.en',
    'math/prob/problem012a.en',
    'math/prob/problem013.en',
    'math/prob/problem016.de',
    'math/prob/problem017.de',
    'math/prob/problem028.de',
    'math/prob/problem042.en',
  ];
  const all = problemFilepaths.map(
    (f) =>
      `${mmtUrl}/:sTeX/document?archive=problems/maai-test&filepath=${f}.xhtml`
  );
  const smallSetIdx = [0, 14, 18, 21];
  return full ? all : all.filter((v, idx) => smallSetIdx.includes(idx));
}

function getAllProblemUrls(
  nodes: FileNode[],
  pathSegments: string[],
  mmtUrl: string
): string[] {
  if (!nodes) return [];
  if (pathSegments.length === 0) {
    return nodes
      .map((node) => {
        const { archive, filepath } = node;
        if (!archive || !filepath) return null;
        return `${mmtUrl}/:sTeX/document?archive=${archive}&filepath=${filepath}`;
      })
      .filter((x) => x);
  }
  const top = pathSegments[0];
  for (const node of nodes) {
    if (node.label === top)
      return getAllProblemUrls(node.children, pathSegments.slice(1), mmtUrl);
  }
  return [];
}

const EMPTY_RESPONSE = {};

const QuizPage: NextPage = () => {
  const router = useRouter();
  const quizId = router.query.quizId as string;
  const [problemUrls, setProblemUrls] = useState([] as string[]);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problems, setProblems] = useState<{ [problemId: string]: Problem }>(
    {}
  );
  const [rootNodes, setRootNodes] = useState<FileNode[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    getDocumentTree(mmtUrl).then(setRootNodes);
  }, [mmtUrl]);

  useEffect(() => {
    if (!quizId?.length || !rootNodes) return;
    const urls = quizId.startsWith('MAAI (may)')
      ? getMaaiMayProblemURLs(mmtUrl, quizId === 'MAAI (may)')
      : getAllProblemUrls(rootNodes, quizId.split('/'), mmtUrl);
    setProblemUrls(urls);

    Promise.all(urls.map((url) => axios.get(url))).then((responses) => {
      const problems: { [problemId: string]: Problem } = {};
      responses.forEach((r, idx) => {
        const htmlStr = hackAwayProblemId(r.data as string);
        problems[urls[idx]] = getProblem(htmlStr, urls[idx]);
      });

      setProblems(problems);
    });
  }, [quizId, mmtUrl, rootNodes]);

  if (!quizId) return <>No Quiz Id</>;
  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box>
        <QuizDisplay
          isFrozen={isSubmitted}
          quizId={undefined}
          showPerProblemTime={true}
          problems={problems}
          onSubmit={async (name, events, responses, points) => {
            setIsSubmitted(true);
            if (!name?.length) return;
            await axios.post(
              '/api/write-quiz-result',
              getQuizResult(
                name,
                quizId,
                events,
                problemUrls,
                responses,
                points
              )
            );
          }}
          existingResponses={EMPTY_RESPONSE}
          showRecordOption={true}
        />
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
