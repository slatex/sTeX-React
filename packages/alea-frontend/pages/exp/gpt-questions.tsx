import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  CreateGptQuestionsResponse,
  Template,
  createGptQuestions,
  getTemplates,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CreateGptQuestionsForm } from '../../components/CreateGptQuestionsForm';
import MainLayout from '../../layouts/MainLayout';

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // You can add your own feedback here, like a toast or a message
      console.log('Text copied to clipboard:', text);
    })
    .catch((error) => {
      console.error('Error copying text to clipboard:', error);
    });
};

function OutputViewer({ response }: { response?: CreateGptQuestionsResponse }) {
  if (!response)
    return (
      <i style={{ fontSize: 'large' }}>
        Click &apos;Get GPT Response&apos; to see some output
      </i>
    );
  return (
    <Box>
      <h2>Output</h2>
      <h4>Usage</h4>
      <pre style={{ display: 'inline' }}>
        Prompt Tokens: <b>{response.usage.promptTokens}</b>,{' '}
      </pre>
      <pre style={{ display: 'inline' }}>
        Completion Tokens: <b>{response.usage.completionTokens}</b>,{' '}
      </pre>
      <pre style={{ display: 'inline' }}>
        Total Tokens: <b>{response.usage.totalTokens}</b>
      </pre>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Actual Prompts
        </AccordionSummary>
        <AccordionDetails>
          {(response.actualPrompts || []).map((prompt, idx) => (
            <TextField
              key={idx}
              value={prompt}
              variant="outlined"
              fullWidth
              InputProps={{ readOnly: true }}
              multiline
            />
          ))}
        </AccordionDetails>
      </Accordion>
      <pre>
        Approx Cost:{' '}
        <b>
          {response.usage.cost_USD.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </b>
      </pre>
      <Tooltip title="Copy Response">
        <IconButton onClick={() => copyToClipboard(response.response)}>
          <FileCopyIcon />
        </IconButton>
      </Tooltip>
      <TextField
        value={response.response}
        variant="outlined"
        fullWidth
        InputProps={{ readOnly: true }}
        multiline
      />
    </Box>
  );
}

const ADDL_AUTHORIZED_USERS = [
  'yz74isit', // Ali
  'be92xusu', // Shams
  'un03ivoq', // Abhinav
];

const GptQuestions: NextPage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedTemplate = templates[selectedIndex];
  const [isFetchingOutput, setIsFetchingOutput] = useState(false);
  const [gptResponse, setGptResponse] =
    useState<CreateGptQuestionsResponse>(undefined);

  useEffect(() => {
    getUserInfo().then(({ userId }) => {
      if (!isModerator(userId) && !ADDL_AUTHORIZED_USERS.includes(userId)) {
        alert('You dont have permission to access this page!');
        router.push('/');
      }
    });
  }, []);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  return (
    <MainLayout title="GPT Questions | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="850px">
        <Box textAlign="center" m="20px">
          <h1>GPT Questions</h1>
        </Box>
        {templates.map((template, idx) => (
          <Box
            key={template.templateName}
            sx={{
              cursor: 'pointer',
              fontWeight: idx === selectedIndex ? 'bold' : 'normal',
            }}
            onClick={() => setSelectedIndex(idx)}
          >
            {template.templateName}
          </Box>
        ))}
        {selectedTemplate && (
          <CreateGptQuestionsForm
            key={selectedIndex}
            template={selectedTemplate}
            onUpdate={async (f) => {
              if (isFetchingOutput) {
                alert('waiting for previous request to finish...');
                return;
              }
              setIsFetchingOutput(true);
              try {
                setGptResponse(await createGptQuestions(f));
              } catch (e) {
                alert('Error fetching output! see console for details.');
                console.error(e);
              } finally {
                setIsFetchingOutput(false);
              }
            }}
          />
        )}
        {isFetchingOutput && <i>Fetching output...</i>}

        {gptResponse && (
          <Box>
            {isFetchingOutput && <i>Response from previous request:</i>}
            <OutputViewer response={gptResponse} />
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default GptQuestions;
