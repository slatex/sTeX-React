import { Box, Button } from '@mui/material';
import { conceptUriToName } from '@stex-react/api';
import React, { useState } from 'react';

type DiagnosticToolProps = {
  diagnosticType: string;
  textArray: string[];
  responseButtons: string[];
  messages: Array<{ type: 'system' | 'user'; text: string }>;
  setMessages: React.Dispatch<
    React.SetStateAction<Array<{ type: 'system' | 'user'; text: string }>>
  >;
  onResponseSelect: (response: string, diagnosticType: string) => void;
  leafConceptData: string[];
  currentConceptIndex: number;
};
const getRandomMessage = (messagesArray, context) => {
  const template = messagesArray[Math.floor(Math.random() * messagesArray.length)];
  return template.replace('{{concept}}', context);
};

const DiagnosticTool: React.FC<DiagnosticToolProps> = ({
  diagnosticType,
  textArray,
  responseButtons,
  messages,
  setMessages,
  onResponseSelect,
  leafConceptData,
  currentConceptIndex,
}) => {
  const [showButtons, setShowButtons] = useState(false);
  React.useEffect(() => {
    if (textArray?.length > 0) {
      if (leafConceptData.length > currentConceptIndex) {
        const updatedMessages: { type: 'system' | 'user'; text: string } = {
          type: 'system',
          text: getRandomMessage(textArray, conceptUriToName(leafConceptData[currentConceptIndex])),
        };

        setTimeout(() => {
          setMessages((prevMessages) => [...prevMessages, updatedMessages]);
        }, 1000);
      }
      const buttonTimer = setTimeout(() => {
        setShowButtons(true);
      }, 1000);
      return () => clearTimeout(buttonTimer);
    }
  }, [textArray]);

  const handleResponseClick = (response: string, diagnosticType: string) => {
    setShowButtons(false);
    setMessages((prevMessages) => [...prevMessages, { type: 'user', text: response }]);

    onResponseSelect(response, diagnosticType);
  };
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#f0f4f7', borderRadius: '8px', mt: 2 }}>
      {showButtons && (
        <Box sx={{ display: 'flex', gap: '10px', mt: 2 }}>
          {responseButtons.map((buttonText, index) => (
            <Button
              key={index}
              variant="contained"
              onClick={() => handleResponseClick(buttonText, diagnosticType)}
            >
              {buttonText}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DiagnosticTool;
