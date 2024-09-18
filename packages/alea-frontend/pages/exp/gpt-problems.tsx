import { Box, Button, Typography, Stack, SelectChangeEvent } from '@mui/material';
import { Template, getTemplates, getUserInfo, isModerator, TemplateTypes } from '@stex-react/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CreateGptProblemsForm } from '../../components/CreateGptProblemsForm';
import MainLayout from '../../layouts/MainLayout';
import Link from 'next/link';
import { TemplateTypeSelect } from './create_template';

export function GptNavigator() {
  const router = useRouter();

  const getBackgroundColor = (path: string) => {
    return router.pathname === path ? 'rgb(0, 144, 255)' : undefined;
  };

  return (
    <Box display="flex" gap="10px" flexWrap="wrap">
      <Link href="/exp/create_template" passHref>
        <Button
          color="secondary"
          variant="contained"
          style={{ backgroundColor: getBackgroundColor('/exp/create_template') }}
        >
          Create Template
        </Button>
      </Link>
      <Link href="/exp/gpt-problems" passHref>
        <Button
          color="secondary"
          variant="contained"
          style={{ backgroundColor: getBackgroundColor('/exp/gpt-problems') }}
        >
          Generate Problems
        </Button>
      </Link>

      <Link href="/exp/gpt-eval" passHref>
        <Button
          color="secondary"
          variant="contained"
          style={{ backgroundColor: getBackgroundColor('/exp/gpt-eval') }}
        >
          Evaluate
        </Button>
      </Link>
      <Link href="/exp/gpt-templates" passHref>
        <Button
          color="secondary"
          variant="contained"
          style={{ backgroundColor: getBackgroundColor('/exp/gpt-templates') }}
        >
          Templates
        </Button>
      </Link>
    </Box>
  );
}

const ADDL_AUTHORIZED_USERS = ['yz74isit', 'be92xusu', 'un03ivoq'];

const GptQuestions: NextPage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
  const [templateType, setTemplateType] = useState<TemplateTypes>(TemplateTypes.CONTEXT_BASED);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInfo().then(({ userId }) => {
      if (!isModerator(userId) && !ADDL_AUTHORIZED_USERS.includes(userId)) {
        alert('You dont have permission to access this page!');
        router.push('/');
      }
    });
  }, []);

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((error) => {
        console.error('error in getting templates', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    const template = templates.find((template) => template.templateId === selectedIndex);
    setSelectedTemplate(template);
  }, [templates, selectedIndex]);

  useEffect(() => {
    const filtered = templates.filter((template) => template.templateType === templateType);
    setFilteredTemplates(filtered);
  }, [templateType, templates]);
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      setSelectedIndex(filteredTemplates[0].templateId);
    } else {
      setSelectedIndex(undefined);
    }
  }, [filteredTemplates]);
  const handleTemplateTypeChange = (event: SelectChangeEvent<string>): void => {
    const selectedTemplateType = event.target.value as TemplateTypes;
    setTemplateType(selectedTemplateType);
  };
  return (
    <MainLayout title="GPT Problems | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="850px">
        <Box textAlign="center" m="20px">
          <h1>GPT Problems</h1>
        </Box>
        <GptNavigator />
        <br />
        <Box display="flex" gap="10px" flexWrap="wrap">
          <TemplateTypeSelect
            templateType={templateType}
            handleTemplateTypeChange={handleTemplateTypeChange}
          />
          {filteredTemplates.length === 0 && !loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="50vh"
              width="100vw"
              bgcolor="background.paper"
              borderRadius={4}
              boxShadow={3}
            >
              <Stack spacing={2} textAlign="center">
                {' '}
                <Typography variant="h4" color="error">
                  No Templates Available
                </Typography>
                <Typography variant="h6" color="secondary">
                  {' '}
                  First Create Template For Problem Generation
                </Typography>
              </Stack>
            </Box>
          ) : (
            // {
            filteredTemplates.map((template) => (
              <Button
                key={template.templateId}
                sx={{ fontWeight: template.templateId === selectedIndex ? 'bold' : 'normal' }}
                onClick={() => setSelectedIndex(template.templateId)}
                variant="outlined"
              >
                {template.templateName}
                <span style={{ fontSize: '8px', top: '-3px', left: '2px' }}>
                  v{template.templateVersion}
                </span>
              </Button>
            ))
          )}
        </Box>
        <br />

        {selectedTemplate && (
          <CreateGptProblemsForm key={selectedIndex} template={selectedTemplate} />
        )}
      </Box>
    </MainLayout>
  );
};

export default GptQuestions;
