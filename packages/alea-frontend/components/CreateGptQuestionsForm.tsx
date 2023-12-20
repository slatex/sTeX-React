import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import {
  CreateGptQuestionsRequest,
  Template,
  saveTemplate,
} from '@stex-react/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';

function templateToFormData(template: Template): CreateGptQuestionsRequest {
  return {
    templateStrs: template?.templateStrs || [],
    assignments: template?.defaultAssignment || [],
    postProcessingSteps: [],
  };
}

function formDataToTemplate(
  templateName: string,
  formData: CreateGptQuestionsRequest
): Template {
  return {
    templateName,
    templateStrs: formData.templateStrs,
    defaultAssignment: formData.assignments,
  };
}

export function CreateGptQuestionsForm({
  template,
  onUpdate,
}: {
  template: Template;
  onUpdate: (formData: CreateGptQuestionsRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateGptQuestionsRequest>(
    templateToFormData(template)
  );
  const [templateName, setTemplateName] = useState<string>('');
  const { gptUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    setFormData(templateToFormData(template));
  }, [template]);

  const handleArrayItemChange =
    (index: number, prop: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const newArray = [...formData[prop]];
      newArray[index] = event.target.value;
      setFormData({ ...formData, [prop]: newArray });
    };

  const handleAddItem = (prop: string) => {
    setFormData({ ...formData, [prop]: [...formData[prop], ''] });
  };

  const handleDeleteItem = (index: number, prop: string) => {
    const newArray = formData[prop].filter((_, i) => i !== index);
    setFormData({ ...formData, [prop]: newArray });
  };

  return (
    <div>
      <Typography variant="h6">Templates</Typography>
      <FormControl fullWidth>
        {formData.templateStrs.map((template, index) => (
          <Box key={index} sx={{ mt: '10px' }}>
            <TextField
              value={template}
              label={'Template ' + (index + 1)}
              onChange={handleArrayItemChange(index, 'templateStrs')}
              fullWidth
              multiline
            />
            <IconButton onClick={() => handleDeleteItem(index, 'templateStrs')}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <IconButton
          onClick={() => handleAddItem('templateStrs')}
          color="primary"
        >
          <AddIcon />
        </IconButton>
      </FormControl>

      <Typography variant="h6">Assignments</Typography>
      <FormControl fullWidth>
        {formData.assignments.map((assignment, idx) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={idx}
            sx={{ mt: '10px' }}
          >
            <Grid item xs={6}>
              <TextField
                label="Assignment Key"
                value={assignment.key}
                onChange={(e) => {
                  formData.assignments[idx].key = e.target.value;
                  setFormData({ ...formData });
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Assignment Value"
                value={assignment.value}
                onChange={(e) => {
                  formData.assignments[idx].value = e.target.value;
                  setFormData({ ...formData });
                }}
                fullWidth
              />
            </Grid>
            <IconButton
              onClick={() => {
                const n = formData.assignments.filter((_, i) => i !== idx);
                setFormData({ ...formData, assignments: n });
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        ))}
        <IconButton
          onClick={() => {
            setFormData({
              ...formData,
              assignments: [...formData.assignments, { key: '', value: '' }],
            });
          }}
        >
          <AddIcon />
        </IconButton>
      </FormControl>

      <Button
        variant="contained"
        onClick={() => onUpdate(formData)}
        color="primary"
      >
        Get GPT Response
      </Button>

      <Box display="flex" sx={{ mt: '20px' }}>
        <TextField
          label="New template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          size="small"
        />
        <Button
          onClick={async () => {
            await saveTemplate(
              gptUrl,
              formDataToTemplate(templateName, formData)
            );
            alert('template saved');
          }}
          variant="contained"
          sx={{ ml: '10px' }}
          disabled={!templateName}
        >
          Save Template
        </Button>
      </Box>
    </div>
  );
}
