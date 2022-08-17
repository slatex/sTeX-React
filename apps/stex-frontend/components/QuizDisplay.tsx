import { Box, Button } from '@mui/material';
import { FileNode } from '@stex-react/stex-react-renderer';
import { DEFAULT_BASE_URL } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import ROOT_NODES from '../file-structure.preval';
import { QuestionDisplay } from './QuestionDisplay';

function getAllQuestionUrls(
  nodes: FileNode[],
  pathSegments: string[]
): string[] {
  if (pathSegments.length === 0) {
    return nodes
      .map((node) => {
        const match = /archive=([^&]+)&filepath=([^"]+xhtml)/g.exec(node.link);
        const archive = match?.[1];
        const filepath = match?.[2];
        if (!archive || !filepath) return null;
        return `${DEFAULT_BASE_URL}/:sTeX/document?archive=${archive}&filepath=${filepath}`;
        // https://overleaf.beta.vollki.kwarc.info/:sTeX/document?archive=problems/IWGS&filepath=progintro/quiz/comments.de.xhtml
      })
      .filter((x) => x);
  }
  const top = pathSegments[0];
  for (const node of nodes) {
    if (node.label === top)
      return getAllQuestionUrls(node.children, pathSegments.slice(1));
  }
  return [];
}

interface QuestionStatus {
  selectedIndex: number;
  isCorrect: boolean;
}

export function QuizDisplay({ path }: { path: string }) {
  const [questionUrls, setQuestionUrls] = useState([] as string[]);
  const [questionStatuses, setQuestionStatuses] = useState(
    [] as QuestionStatus[]
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!path?.length) return;
    const urls = getAllQuestionUrls(ROOT_NODES, path.split('/'));
    setQuestionUrls(urls);
    setQuestionStatuses(
      new Array(urls.length).fill({ selectedIndex: -1, isCorrect: false })
    );
    setIsSubmitted(false);
  }, [path]);

  function onSelectedIndexUpdate(
    questionIdx: number,
    selectedIndex: number,
    isCorrect: boolean
  ) {
    setQuestionStatuses((previous) => {
      previous[questionIdx] = { selectedIndex, isCorrect };
      return previous;
    });
  }
  return (
    <Box>
      <h2>This quiz contains {questionUrls.length} questions.</h2>
      {questionUrls.map((url, qIdx) => (
        <Box my="10px" key={url}>
          <QuestionDisplay
            questionUrl={url}
            isSubmitted={isSubmitted}
            onSelectedIndexUpdate={(selectedIndex, isCorrect) =>
              onSelectedIndexUpdate(qIdx, selectedIndex, isCorrect)
            }
          />
        </Box>
      ))}
      {isSubmitted ? (
        <i style={{ margin: '20px 0', color: '#333', fontSize: '26px' }}>
          You answered{' '}
          {questionStatuses.reduce(
            (prev, s) => prev + (s.isCorrect ? 1 : 0),
            0
          )}{' '}
          out of {questionUrls.length} questions correctly
        </i>
      ) : (
        <Button
          onClick={() => {
            const left = questionStatuses.filter(
              (s) => s.selectedIndex < 0
            ).length;
            const leftStatement =
              left > 0 ? `You did not answer ${left} questions.` : '';
            if (confirm(leftStatement + 'Are you sure you want to submit?')) {
              setIsSubmitted(true);
            }
          }}
          sx={{ my: '20px' }}
          variant="contained"
        >
          Submit
        </Button>
      )}
    </Box>
  );
}
