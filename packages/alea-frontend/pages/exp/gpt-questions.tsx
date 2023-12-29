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
  CreateGptQuestionsRequest,
  CreateGptQuestionsResponse,
  Template,
  createGptQuestions,
  getTemplates,
  getUserInfo,
  isModerator,
  saveTemplate,
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

function formDataToTemplate(
  templateName: string,
  updateMessage: string,
  formData: CreateGptQuestionsRequest
): Template {
  return {
    version: 'unused',
    updateMessage,
    templateName,
    templateStrs: formData.templateStrs,
    defaultAssignment: formData.assignments,
    updater: 'unused',
    updateTime: 'unused',
  };
}

function OutputViewer({ response }: { response?: CreateGptQuestionsResponse }) {
  const completion = response?.completions?.[0];
  if (!completion)
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
        Prompt Tokens: <b>{completion.usage.promptTokens}</b>,{' '}
      </pre>
      <pre style={{ display: 'inline' }}>
        Completion Tokens: <b>{completion.usage.completionTokens}</b>,{' '}
      </pre>
      <pre style={{ display: 'inline' }}>
        Total Tokens: <b>{completion.usage.totalTokens}</b>
      </pre>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Actual Prompts
        </AccordionSummary>
        <AccordionDetails>
          {(completion.actualPrompts || []).map((prompt, idx) => (
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
          {completion.usage.cost_USD.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </b>
      </pre>
      <Tooltip title="Copy Response">
        <IconButton onClick={() => copyToClipboard(completion.response)}>
          <FileCopyIcon />
        </IconButton>
      </Tooltip>
      <TextField
        value={completion.response}
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
            {template.templateName}{' '}
            <span style={{ fontSize: '10px' }}>{template.version}</span>
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
            onSaveTemplate={async (
              templateName: string,
              formData: CreateGptQuestionsRequest
            ) => {
              const isExisting = templates.some(
                (t) => t.templateName === templateName
              );
              const updateMessage = prompt(
                `Template ${isExisting ? 'update ' : ''}description`
              );
              if (updateMessage === null) return;

              await saveTemplate(
                formDataToTemplate(templateName, updateMessage, formData)
              );
              alert(`Template ${isExisting ? 'updated' : 'saved'}!`);
              getTemplates().then(setTemplates);
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
