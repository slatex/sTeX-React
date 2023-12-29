import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Button, Box } from '@mui/material';
import { javascript } from '@codemirror/lang-javascript';
import MainLayout from '../../layouts/MainLayout';

function CodeEditor() {
  const defaultCode = "console.log('hello world!');";
  const [value, setValue] = useState(defaultCode);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = () => {
    try {
      const capturedLogs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => capturedLogs.push(args);
      const evaluatedCode = eval(value);
      console.log = originalConsoleLog;
      setResult({ result: evaluatedCode, logs: capturedLogs });
      setShowResult(true);
    } catch (error) {
      setResult({ error: `Error: ${error.message}` });
      setShowResult(true);
    }
  };

  const handleEditorChange = (val) => {
    setValue(val);
  };

  return (
    <MainLayout title="CodeEditor | VoLL-KI">
      <CodeMirror
        value={value}
        height="300px"
        extensions={[javascript({ jsx: true })]}
        onChange={handleEditorChange}
        theme={'dark'}
      />
      <Button onClick={handleRun} variant="contained" sx={{ m: '15px' }}>
        Run Code
      </Button>
      <Button
        onClick={() => setValue(defaultCode)}
        variant="contained"
        sx={{ m: '15px' }}
      >
        Reset
      </Button>
      {showResult && (
        <Box
          p={2}
          border={1}
          borderColor="black"
          bgcolor="#282c34"
          color="white"
          sx={{ height: '200px', overflowY: 'auto' }}
        >
          <Box display="flex" justifyContent="space-between" mx="20px">
            <strong>Output</strong>
            <strong
              style={{ cursor: 'pointer' }}
              onClick={() => setShowResult(false)}
            >
              X
            </strong>
          </Box>
          <hr />
          {result.error ? (
            <pre>{result.error}</pre>
          ) : (
            <>
              {result.logs.map((log, index) => (
                <Box key={index}>
                  {log.map((item, i) => (
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
}

export default CodeEditor;
