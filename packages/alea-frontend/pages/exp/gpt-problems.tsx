import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CompletionEval,
  CreateGptProblemsRequest,
  CreateGptProblemsResponse,
  Template,
  createGptQuestions,
  getEval,
  getTemplates,
  getUserInfo,
  isModerator,
  saveEval,
  saveTemplate,
} from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CreateGptProblemsForm } from '../../components/CreateGptProblemsForm';
import MainLayout from '../../layouts/MainLayout';
import CompletionEvalForm from '../../components/GptEvalForm';
import Link from 'next/link';

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

export function formDataToTemplate(
  templateName: string,
  updateMessage: string,
  formData: CreateGptProblemsRequest
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

export function OutputViewer({
  response,
}: {
  response?: CreateGptProblemsResponse;
}) {
  const [completionIdx, setCompletionIdx] = useState(0);
  const [completionEval, setCompletionEval] = useState<
    CompletionEval | undefined
  >(undefined);
  useEffect(() => {
    if (!response?.runId) return;
    getEval(response.runId, completionIdx).then(setCompletionEval);
  }, [response?.runId, completionIdx]);

  const completion = response?.completions?.[completionIdx];
  if (!completion) {
    return (
      <i style={{ fontSize: 'large' }}>
        Click &apos;Get GPT Response&apos; to see some output
      </i>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb="10px" sx={{ textDecoration: 'underline' }}>
        Output
      </Typography>

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
      <Typography variant="h6" mt="10px">
        Usage
      </Typography>
      <pre style={{ display: 'inline' }}>
        Prompt Tokens: <b>{completion.usage.promptTokens}</b>,{' '}
      </pre>
      <pre style={{ display: 'inline' }}>
        Completion Tokens: <b>{completion.usage.completionTokens}</b>,{' '}
      </pre>
      <pre style={{ display: 'inline' }}>
        Total Tokens: <b>{completion.usage.totalTokens}</b>
      </pre>
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
      {response?.runId && (
        <CompletionEvalForm
          runId={response.runId}
          completionIdx={completionIdx}
          initial={completionEval}
          onSubmit={(completionEval) => {
            try {
              saveEval(completionEval);
              alert('Saved!');
            } catch (e) {
              alert('Error saving! see console for details.');
              console.error(e);
            }
          }}
        />
      )}
    </Box>
  );
}

export function GptNavigator() {
  return (
    <Box display="flex" gap="10px">
      <Link href="/exp/gpt-problems" passHref>
        <Button color="secondary" variant="contained">
          Create
        </Button>
      </Link>

      <Link href="/exp/gpt-eval" passHref>
        <Button color="secondary" variant="contained">
          Evaluate
        </Button>
      </Link>
      <Link href="/exp/gpt-templates" passHref>
        <Button variant="contained" color="secondary">
          Template
        </Button>
      </Link>
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
    useState<CreateGptProblemsResponse>(undefined);

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
    <MainLayout title="GPT Problems | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="850px">
        <Box textAlign="center" m="20px">
          <h1>GPT Problems</h1>
        </Box>
        <GptNavigator />
        <br />
        <Box display="flex" gap="10px" flexWrap="wrap">
          {templates.map((template, idx) => (
            <Button
              key={template.templateName}
              sx={{ fontWeight: idx === selectedIndex ? 'bold' : 'normal' }}
              onClick={() => setSelectedIndex(idx)}
              variant="outlined"
            >
              {template.templateName}
              <span style={{ fontSize: '8px', top: '-3px', left: '2px' }}>
                v{template.version}
              </span>
            </Button>
          ))}
        </Box>
        <br />
        {selectedTemplate && (
          <CreateGptProblemsForm
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
              formData: CreateGptProblemsRequest
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
