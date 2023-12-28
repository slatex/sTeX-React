import Editor from '@monaco-editor/react';
import { Button, Box } from '@mui/material';
import { NextPage } from 'next';
import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const CodeEditor: NextPage = () => {
  const [editorValue, setEditorValue] = useState<string>('// some comment');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = (code: string) => {
    try {
      const capturedLogs: any[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args: any[]) => capturedLogs.push(args);
      const result = eval(code);
      console.log = originalConsoleLog;
      setResult({ result, logs: capturedLogs });
      setShowResult(true);
    } catch (error) {
      setResult({ error: `Error: ${error.message}` });
      setShowResult(true);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    value !== undefined && setEditorValue(value);
    setShowResult(false);
  };

  return (
    <MainLayout title="CodeEditor | VoLL-KI">
      <Editor
        height="50vh"
        defaultLanguage="javascript"
        defaultValue={editorValue}
        onChange={handleEditorChange}
      />
      <Button onClick={() => handleRun(editorValue)} variant="contained">
        Run
      </Button>
      {showResult && (
        <Box mt={2} p={2} border={1} borderColor="black" borderRadius={4}>
          <strong>Result:</strong>
          {result.error ? (
            <pre>{result.error}</pre>
          ) : (
            <>
              {result.logs.map((log, index) => (
                <Box key={index}>
                  {log.map((item: any, i: number) => (
                    <span key={i}>{JSON.stringify(item)}</span>
                  ))}
                </Box>
              ))}
            </>
          )}
        </Box>
      )}
    </MainLayout>
  );
};

export default CodeEditor;
