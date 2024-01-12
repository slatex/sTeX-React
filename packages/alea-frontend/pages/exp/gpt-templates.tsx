import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Template, getTemplateVersions, getTemplates } from '@stex-react/api';
import {
  FixedPositionMenu,
  LayoutWithFixedMenu,
} from '@stex-react/stex-react-renderer';
import { PRIMARY_COL, shouldUseDrawer } from '@stex-react/utils';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { KeyValueDisplay } from './gpt-eval';
import { GptNavigator } from './gpt-problems';

function TemplateMenu({
  templates,
  onClose,
  onSelectTemplate,
  selectedTemplate,
}: {
  templates: Template[];
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  selectedTemplate: Template;
}) {
  return (
    <FixedPositionMenu
      staticContent={
        <Box display="flex" justifyContent="space-between">
          <Typography
            p="5px"
            textAlign="center"
            fontWeight="bold"
            fontSize="20px"
            color={PRIMARY_COL}
          >
            Template List
          </Typography>
          <IconButton sx={{ m: '2px' }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      }
    >
      <Box sx={{ cursor: 'pointer' }}>
        {templates.map((template: Template) => (
          <Typography
            ml="20px"
            mt="5px"
            key={template.templateName}
            onClick={() => onSelectTemplate(template)}
            fontWeight={
              template.templateName === selectedTemplate?.templateName
                ? 'bold'
                : undefined
            }
          >
            {template.templateName}
          </Typography>
        ))}
      </Box>
    </FixedPositionMenu>
  );
}

function TemplatePrompt({
  prompt,
  updateMessage,
  updater,
}: {
  prompt: string;
  updateMessage: string;
  updater: string;
}) {
  const boxStyle = {
    border: '1px solid gray',
    borderRadius: '4px',
    padding: '5px',
    whiteSpace: 'pre-wrap' as const,
    marginBottom: '5px',
  };
  return (
    <>
      <Box style={boxStyle}>
        <Typography>
          <b>Update Message ({updater})</b> : {updateMessage}{' '}
        </Typography>
      </Box>
      <Box style={boxStyle}>
        <Typography>{prompt}</Typography>
      </Box>
    </>
  );
}

const GptEval: NextPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateVersions, setTemplateVersions] = useState<Template[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const handleSelectTemplate = (template: Template) => {
    getTemplateVersions(template.templateName)
      .then((versions) => {
        setTemplateVersions(versions.reverse());
        setSelectedTemplate(versions[0]);
      })
      .catch((error) => {
        console.error('Error fetching template versions:', error);
      });
  };

  return (
    <MainLayout title="GPT Templates | VoLL-KI">
      <LayoutWithFixedMenu
        menu={
          <TemplateMenu
            templates={templates}
            onClose={() => setShowDashboard(false)}
            onSelectTemplate={handleSelectTemplate}
            selectedTemplate={selectedTemplate}
          />
        }
        topOffset={64}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
      >
        <Box mt="5px" mb="10px">
          <GptNavigator />
        </Box>
        <Box>
          <Box display="flex" gap="10px" flexWrap="wrap" p="10px">
            {templateVersions?.map((template, idx) => (
              <Button
                key={idx}
                sx={{ fontWeight: idx === selectedIndex ? 'bold' : 'normal' }}
                onClick={() => {
                  setSelectedTemplate(template);
                  setSelectedIndex(idx);
                }}
                variant="outlined"
              >
                {template.templateName}
                <span style={{ fontSize: '8px', top: '-3px', left: '2px' }}>
                  v{template.version}
                </span>
              </Button>
            ))}
          </Box>
          {selectedTemplate && (
            <TemplatePrompt
              prompt={selectedTemplate?.templateStrs[0]}
              updateMessage={selectedTemplate?.updateMessage}
              updater={selectedTemplate?.updater}
            />
          )}
          {selectedTemplate &&
            selectedTemplate.defaultAssignment.map((a) => (
              <KeyValueDisplay key={a.key} dispKey={a.key} value={a.value} />
            ))}
        </Box>
      </LayoutWithFixedMenu>
    </MainLayout>
  );
};

export default GptEval;
