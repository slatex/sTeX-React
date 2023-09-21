import { Box } from '@mui/material';
import { simpleHash } from '@stex-react/utils';
import React from 'react';

interface QuizJson {
  title: string;
  problems: string[];
}

function problemsListToObjectWithId(problems: string[]) {
  const problemObj: { [problemId: string]: string } = {};
  for (const problem of problems) {
    const problemId = simpleHash(problem);
    problemObj[problemId] = problem;
  }
  return problemObj;
}

export function QuizFileReader({
  setTitle,
  setProblems,
}: {
  setTitle: (title: string) => void;
  setProblems: (problems: { [problemId: string]: string }) => void;
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e.target?.result);
      const contents = e.target?.result as string;
      try {
        const parsedJson = JSON.parse(contents) as QuizJson;
        console.log(parsedJson);
        // Check if the parsed content is a valid JSON object before updating the state
        if (typeof parsedJson === 'object' && parsedJson !== null) {
          setProblems(problemsListToObjectWithId(parsedJson.problems));
          setTitle(parsedJson.title);
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
