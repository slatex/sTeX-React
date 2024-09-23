import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MCQComponent from './McqComponent';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import {
  createGeneration,
  CreateGptProblemsRequest,
  fetchTemplateDetails,
  GenerationHistory,
  GenerationObj,
  getGenerationsHistory,
  Template,
  TemplateData,
} from '@stex-react/api';

import { ChangeEvent, useEffect, useState } from 'react';
import { AssignmentsForm } from '../pages/exp/create-template';
import { AccordionInfo } from '../pages/exp/create-template';

function templateToFormData(template: Template): CreateGptProblemsRequest {
  let templateStrArray: string[];

  if (typeof template.templateStr === 'string') {
    templateStrArray = [template.templateStr];
  } else if (Array.isArray(template.templateStr)) {
    templateStrArray = template.templateStr;
  } else {
    templateStrArray = [];
  }

  return {
    templateName: template?.templateName || '',
    templateVersion: template?.templateVersion || '',
    templateId: template?.templateId,
    templateStr: templateStrArray,
    assignments: template?.defaultAssignments || [],
  };
}

export function CreateGptProblemsForm({ template }: { template: Template }) {
  const [formData, setFormData] = useState<CreateGptProblemsRequest>(templateToFormData(template));
  const [showMCQ, setShowMCQ] = useState<boolean>(false);
  const [generationsHistory, setGenerationsHistory] = useState<GenerationHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGenerationId, setSelectedGenerationId] = useState<number | null>(null);
  const [gptResponse, setGptResponse] = useState<string>('');
  const [respData, setRespData] = useState({});
  const [generationTemplates, setGenerationTemplates] = useState({});

  useEffect(() => {
    setLoading(true);
    getGenerationsHistory(template.templateType)
      .then(setGenerationsHistory)
      .catch((error) => {
        console.error('Error fetching generations history:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [template.templateType]);

  const handleGenerationHistoryChange = (event: SelectChangeEvent<number>) => {
    const selectedId = Number(event.target.value);
    setSelectedGenerationId(selectedId);
    const selectedGen = generationsHistory.find(
      (generation) => generation.generationId === selectedId
    );
    if (selectedGen) {
      setGptResponse(selectedGen.gptResponse);
      const updatedSelectedGen = {
        ...selectedGen,
        extractQuestion: false,
      };
      setRespData(updatedSelectedGen);
    }
    setShowMCQ(true);
    setTimeout(() => {
      const element = document.getElementById('mcq-component');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  };

  const handleGenerateClick = async () => {
    try {
      setLoading(true);
      setShowMCQ(true);
      const { templateId, templateStr, assignments } = formData;

      const response = await createGeneration(formData);
      const { generationId, gptResponse, createdAt } = response.generationObj;
      setGptResponse(gptResponse);
      setGenerationsHistory((prevHistory) => {
        if (!Array.isArray(prevHistory)) {
          prevHistory = [];
        }
        const newEntry: GenerationHistory = {
          generationId: generationId,
          templateId: templateId,
          promptText: templateStr,
          assignment: assignments,
          gptResponse: gptResponse,
          createdAt: createdAt,
        };
        return [...prevHistory, newEntry];
      });
      const updatedGenerationObj = {
        ...response.generationObj,
        extractQuestion: true,
      };
      setRespData(updatedGenerationObj);
    } catch (error) {
      console.error('Error during generation request:', error);
      alert('An error occurred while generating . Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        const element = document.getElementById('mcq-component');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  };

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

  const handleDeleteAssignment = (idx) => {
    setFormData((prevData) => ({
      ...prevData,
      assignments: prevData.assignments.filter((_, i) => i !== idx),
    }));
  };

  const handleKeyChange = (idx, newKey) => {
    setFormData((prevData) => ({
      ...prevData,
      assignments: prevData.assignments.map((assignment, i) =>
        i === idx ? { ...assignment, key: newKey } : assignment
      ),
    }));
  };

  const handleValueChange = (idx, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      assignments: prevData.assignments.map((assignment, i) =>
        i === idx ? { ...assignment, value: newValue } : assignment
      ),
    }));
  };

  const handleAddAssignment = () => {
    const newAssignment = { id: Date.now(), key: '', value: '' };
    setFormData((prevData) => ({
      ...prevData,
      assignments: [...prevData.assignments, newAssignment],
    }));
  };

  const fetchAllTemplates = (): Promise<void> => {
    const templatesMap: { [key: number]: TemplateData } = {};
    const fetchPromises = generationsHistory.map((generation) => {
      if (generation.templateId) {
        return fetchTemplateDetails(generation.templateId).then((templateData) => {
          templatesMap[generation.generationId] = templateData;
        });
      }
      return Promise.resolve();
    });

    return Promise.all(fetchPromises)
      .then(() => {
        setGenerationTemplates(templatesMap);
      })
      .catch((error) => {
        console.error('Error fetching all templates', error);
      });
  };

  useEffect(() => {
    if (!loading && generationsHistory.length > 0) {
      fetchAllTemplates().finally(() => {
        setLoading(false);
      });
    }
  }, [loading, generationsHistory]);

  return (
    <Box
      sx={{
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <div>
        <Typography variant="h5">Prompts</Typography>
        <FormControl fullWidth>
          {formData.templateStr.map((template, index) => (
            <Box key={index} sx={{ mt: '10px' }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Prompt {index + 1}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    value={template}
                    label={'Prompt ' + (index + 1)}
                    onChange={handleArrayItemChange(index, 'templateStr')}
                    fullWidth
                    multiline
                  />
                  <IconButton
                    onClick={() => handleDeleteItem(index, 'templateStr')}
                    aria-label={`delete-prompt-${index + 1}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
          <IconButton onClick={() => handleAddItem('templateStr')} color="primary">
            <AddIcon />
          </IconButton>
        </FormControl>
        <Typography variant="h5">Assignments</Typography>
        <AccordionInfo />
        <AssignmentsForm
          formData={formData.assignments}
          handleDeleteAssignment={handleDeleteAssignment}
          handleKeyChange={handleKeyChange}
          handleValueChange={handleValueChange}
          handleAddAssignment={handleAddAssignment}
        />
        <Box display="flex" alignItems="center" justifyContent="center" gap={3} flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateClick}
            sx={{ mr: 2, height: '4em' }}
          >
            Generate
          </Button>

          {generationsHistory?.length > 0 || loading ? (
            <FormControl>
              <InputLabel id="generation-select-label">Generation History</InputLabel>
              <Select
                labelId="generation-select-label"
                value={selectedGenerationId}
                onChange={handleGenerationHistoryChange}
                label="Generation History"
                disabled={loading}
                sx={{ width: '180px' }}
              >
                {loading ? (
                  <MenuItem value="">
                    <em>Loading...</em>
                  </MenuItem>
                ) : (
                  generationsHistory.map((generation) => {
                    const templateData = generationTemplates[generation.generationId] || {};
                    const { templateName = 'Loading.i..', templateVersion = '' } = templateData;

                    return (
                      <MenuItem key={generation.generationId} value={generation.generationId}>
                        <Typography sx={{ overflow: 'hidden' }}>
                          Generation [ {templateName} ]{' '}
                          <span
                            style={{
                              fontSize: '12px',
                              top: '-3px',
                              left: '2px',
                            }}
                          >
                            v{templateVersion}
                            {'  '}
                          </span>
                          -{generation.createdAt}
                        </Typography>
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          ) : (
            <Box
              p={1}
              border={1}
              borderRadius="8px"
              textAlign="center"
              sx={{ minWidth: 150 }}
              boxShadow={3}
            >
              {' '}
              <Typography variant="h6" color="error">
                No Generation History Found
              </Typography>
            </Box>
          )}
        </Box>
        {gptResponse && (
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#f5f5f5', marginTop: 3 }}>
            <Typography variant="h6" gutterBottom>
              GPT Response:
            </Typography>
            <Typography variant="body1">{gptResponse}</Typography>
          </Paper>
        )}
        {!loading && showMCQ && (
          <div id="mcq-component">
            <MCQComponent respData={respData} />
          </div>
        )}{' '}
      </div>
    </Box>
  );
}
