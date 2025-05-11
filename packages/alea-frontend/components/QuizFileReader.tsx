import { Box } from '@mui/material';
import { FTMLProblemWithSolution, CSS } from '@stex-react/api';
import { Quiz, FTMLQuizElement } from '@stex-react/ftml-utils';
import React from 'react';


function getProblemsFromQuiz(quiz: Quiz): Record<string, FTMLProblemWithSolution> {
  const result: Record<string, FTMLProblemWithSolution> = {};

  function processQuizElement(element: FTMLQuizElement) {
    if ('Problem' in element) {
      const problem = element.Problem;
      const solution = quiz.solutions[problem.uri] || '';
      result[problem.uri] = { problem, solution };
    } else if ('Section' in element) {
      element.Section.elements.forEach(processQuizElement);
    }
  }

  quiz.elements.forEach(processQuizElement);
  console.log(result);
  return result;
}

export function QuizFileReader({
  setCss,
  setTitle,
  setProblems,
}: {
  setTitle: (title: string) => void;
  setProblems: (problems: Record<string, FTMLProblemWithSolution>) => void;
  setCss: (css: CSS[]) => void;
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e.target?.result);
      const contents = e.target?.result as string;
      try {
        const parsedJson = JSON.parse(contents) as Quiz;
        console.log(parsedJson);
        // Check if the parsed content is a valid JSON object before updating the state
        if (typeof parsedJson === 'object' && parsedJson !== null) {
          setProblems(getProblemsFromQuiz(parsedJson));
          setTitle(parsedJson.title);
          setCss(parsedJson.css);
        } else {
          alert('Invalid JSON file.');
        }
      } catch (error) {
        alert('Error parsing JSON: ' + error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <input type="file" accept=".json" onChange={handleFileChange} />
    </Box>
  );
}
