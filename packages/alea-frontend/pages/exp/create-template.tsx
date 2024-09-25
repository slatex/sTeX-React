import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  createTemplate,
  getCourseInfo,
  getDocumentSections,
  SectionsAPIData,
  TemplateTypes,
  GptResponseFormat,
  defaultAssignment,
  VariableAssignment,
  checkTemplateExists,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  convertHtmlStringToPlain,
  FileLocation,
  fileLocToString,
  fullDocumentUrl,
  stringToFileLoc,
  CourseInfo,
} from '@stex-react/utils';
import { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useRouter } from 'next/router';

export function TemplateTypeSelect({
  templateType,
  handleTemplateTypeChange,
}: {
  templateType: TemplateTypes | undefined;
  handleTemplateTypeChange: (event: SelectChangeEvent<string>) => void;
}) {
  return (
    <FormControl>
      <InputLabel id="template-type-select-label">Select Template</InputLabel>
      <Select
        labelId="template-type-select-label"
        id="template-type-select"
        value={templateType}
        label="Select Template"
        onChange={handleTemplateTypeChange}
        sx={{ width: 160 }}
      >
        <MenuItem value="CONTEXT_BASED">Context Based</MenuItem>
        <MenuItem value="FROM_SAMPLE_PROBLEM">From Sample Problem</MenuItem>
        <MenuItem value="FROM_MORE_EXAMPLES">From More Examples</MenuItem>
        <MenuItem value="FROM_CONCEPT_COMPARISON">From Concept Comparison</MenuItem>
        <MenuItem value="REMOVE_AMBIGUITY">Remove Ambiguity</MenuItem>
        <MenuItem value="FIX_REFERENCES">Fix References</MenuItem>
        <MenuItem value="FIX_DISTRACTORS">Fix Distractors</MenuItem>
      </Select>
    </FormControl>
  );
}

function getGitlabUrl({ archive, filepath }: FileLocation) {
  if (filepath.endsWith('.xhtml')) filepath = filepath.replace('.xhtml', '.tex');
  return `https://gl.mathhub.info/${archive}/-/blob/main/source/${filepath}`;
}

function getSectionNames(
  data: SectionsAPIData,
  level = 0,
  parentFile: FileLocation = undefined
): { name: string; parentFile: FileLocation }[] {
  const names = [];
  if (data.title?.length)
    names.push({
      name: '\xa0'.repeat(level * 4) + convertHtmlStringToPlain(data.title),
      parentFile,
    });
  const { archive, filepath } = data;
  const stexFilepath = filepath?.replace('.xhtml', '.tex');
  const thisFileLoc = archive && filepath ? { archive, filepath: stexFilepath } : undefined;
  for (const c of data.children || []) {
    names.push(
      ...getSectionNames(c, level + (data.title?.length ? 1 : 0), thisFileLoc || parentFile)
    );
  }
  return names;
}

function SectionPicker({
  sectionParentId,
  onChange,
}: {
  sectionParentId: string;
  onChange: (value: string) => void;
}) {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [sections, setSectionNames] = useState<{ name: string; parentFile: FileLocation }[]>([]);
  const [courseId, setCourseId] = useState<string>('ai-1');
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const fileLoc = stringToFileLoc(sectionParentId);

  useEffect(() => {
    async function fetchData() {
      if (mmtUrl) {
        try {
          const courseInfo = await getCourseInfo(mmtUrl);
          setCourses(courseInfo);
          const archive = courseInfo[courseId]?.notesArchive;
          const filepath = courseInfo[courseId]?.notesFilepath;
          const docSections = await getDocumentSections(mmtUrl, archive, filepath);
          const s = getSectionNames(docSections);
          setSectionNames(s);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }
    fetchData();
  }, [mmtUrl, courseId]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <FormControl sx={{ m: '20px 5px 0' }}>
          <InputLabel id="courseId-label">CourseId</InputLabel>
          <Select
            labelId="courseId-label"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            label="Course Id"
            sx={{ width: '120px' }}
          >
            {courses &&
              Object.keys(courses).map((key) => (
                <MenuItem key={key} value={key}>
                  {key.toUpperCase()}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: '20px 5px 0' }}>
          <InputLabel id="section-select-label">Section Name</InputLabel>
          <Select
            labelId="section-select-label"
            disabled={!courseId}
            value={sectionParentId}
            onChange={(e) => onChange(e.target.value)}
            label="Section Name"
            sx={{ width: '280px' }}
          >
            {sections.map((option) => {
              return (
                <MenuItem
                  key={option.name + option.parentFile.filepath}
                  value={fileLocToString(option.parentFile)}
                >
                  {option.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <br />
      <a
        href={
          mmtUrl +
          fullDocumentUrl({
            archive: fileLoc.archive,
            filepath: fileLoc.filepath.replace('.tex', '.xhtml'),
          })
        }
        style={{ textDecoration: 'underline' }}
        target="_blank"
      >
        {sections
          .find(
            ({ parentFile: { archive, filepath } }) =>
              archive === fileLoc.archive && filepath === fileLoc.filepath
          )
          ?.name?.trim() || ''}
      </a>
      &nbsp;
      <a href={getGitlabUrl(fileLoc)} style={{ textDecoration: 'underline' }} target="_blank">
        Gitlab Link
      </a>
    </>
  );
}

function AssignmentValueInput({
  assignKey,
  value,
  onChange,
}: {
  assignKey: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const isSectionStex = assignKey.startsWith('SECTION_STEX');
  const isSectionTidyStex = assignKey.startsWith('SECTION_TIDY_STEX');
  if (isSectionStex || isSectionTidyStex)
    return <SectionPicker sectionParentId={value} onChange={onChange} />;

  const isFetchUrl = assignKey.startsWith('FETCH_URL');
  const isFetchStex = assignKey.startsWith('FETCH_STEX');
  const fileLoc = isFetchStex && stringToFileLoc(value);
  return (
    <>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        multiline
        placeholder="Assignment Value"
      />
      {isFetchUrl && (
        <a href={value} target="_blank" style={{ textDecoration: 'underline' }}>
          {assignKey}
        </a>
      )}
      {isFetchStex &&
        (fileLoc?.archive && fileLoc?.filepath ? (
          <a href={getGitlabUrl(fileLoc)} style={{ textDecoration: 'underline' }} target="_blank">
            Link
          </a>
        ) : (
          <>
            Must be of the form{' '}
            <span style={{ backgroundColor: '#AAA', padding: '0 3px' }}>archive||filepath</span>
          </>
        ))}
    </>
  );
}

export function AccordionInfo() {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <b>Special Key Prefixes</b>
      </AccordionSummary>
      <AccordionDetails>
        <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
          <tr>
            <th>Prefix</th>
            <th style={{ border: '1px solid black', padding: '0 10px' }}>
              Interpretation of provided value
            </th>
            <th>Replaced by</th>
          </tr>
          <tr style={{ border: '1px solid black' }}>
            <td>FETCH_STEX</td>
            <td style={{ border: '1px solid black', padding: '0 10px' }}>
              Value is a combination of sTeX file&apos;s archive and filepath
            </td>
            <td>Template marker replaced by the stex (recursively expanded)</td>
          </tr>
          <tr style={{ border: '1px solid black' }}>
            <td>SECTION_STEX</td>
            <td style={{ border: '1px solid black', padding: '0 10px' }}>
              A section from AI-1 course
            </td>
            <td>Template marker replaced by the stex (recursively expanded)</td>
          </tr>
          <tr style={{ border: '1px solid black' }}>
            <td>SECTION_TIDY_STEX</td>
            <td style={{ border: '1px solid black', padding: '0 10px' }}>
              A section from AI-1 course
            </td>
            <td>
              Template marker replaced by the stex. All sub fragments are dumped as is to make sure
              that valid stex is generated.
            </td>
          </tr>
          <tr style={{ border: '1px solid black' }}>
            <td>FETCH_URL</td>
            <td style={{ border: '1px solid black', padding: '0 10px' }}>
              Value is interpreted as a url
            </td>
            <td>Template marker replaced by content fetched from url.</td>
          </tr>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}

export const AssignmentsForm = ({
  formData,
  handleDeleteAssignment,
  handleKeyChange,
  handleValueChange,
  handleAddAssignment,
}) => {
  return (
    <FormControl fullWidth>
      {formData.map((assignment, idx) => (
        <Grid container spacing={2} alignItems="center" key={idx} sx={{ mt: '10px' }}>
          <Grid item xs={1}>
            <IconButton onClick={() => handleDeleteAssignment(idx)} sx={{ color: 'crimson' }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Assignment Key"
              value={assignment.key}
              onChange={(e) => handleKeyChange(idx, e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <AssignmentValueInput
              assignKey={assignment.key}
              value={assignment.value}
              onChange={(newValue: string) => {
                handleValueChange(idx, newValue);
              }}
            />
          </Grid>
        </Grid>
      ))}
      <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
        <Tooltip
          placement="top"
          title="Create more assignment keys and values by clicking on this button"
        >
          <IconButton onClick={handleAddAssignment}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </FormControl>
  );
};

const extractKeysFromPrompt = (templateStr: string) => {
  const regex = /%%(\w+)%%/g;
  let match;
  const keys = new Set<string>();

  while ((match = regex.exec(templateStr)) !== null) {
    keys.add(match[1]);
  }

  return Array.from(keys).map((key) => ({ key, value: '' }));
};
const ADDL_AUTHORIZED_USERS = ['yz74isit', 'be92xusu', 'un03ivoq'];

const CreateTemplate: NextPage = () => {
  const [templateName, setTemplateName] = useState<string>('');
  const [templateStr, setTemplateStr] = useState<string>('');
  const [formData, setFormData] = useState<VariableAssignment[]>(defaultAssignment);
  const [templateType, setTemplateType] = useState<TemplateTypes | undefined>(undefined);
  const [selectedResponseFormat, setSelectedResponseFormat] = useState<GptResponseFormat>(
    GptResponseFormat.JSON_FORMAT
  );
  const [templateExists, setTemplateExists] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    getUserInfo().then(({ userId }) => {
      if (!isModerator(userId) && !ADDL_AUTHORIZED_USERS.includes(userId)) {
        alert('You dont have permission to access this page!');
        router.push('/');
      }
    });
  }, []);

  useEffect(() => {
    const checkIfTemplateExists = async () => {
      if (templateName) {
        try {
          const checkResult = await checkTemplateExists(templateName);
          setTemplateExists(checkResult.exists);
        } catch (error) {
          console.error('Error checking if template exists:', error);
        }
      } else {
        setTemplateExists(false);
      }
    };

    checkIfTemplateExists();
  }, [templateName]);

  const handlePromptChange = (newtemplateStr: string) => {
    setTemplateStr(newtemplateStr);

    const containsVariables = /%%[^%]+%%/.test(newtemplateStr);

    if (containsVariables) {
      const newFormData = extractKeysFromPrompt(newtemplateStr);
      setFormData(newFormData);
    } else {
      setFormData(defaultAssignment);
    }
  };

  const handleAddAssignment = () => {
    setFormData([...formData, { key: '', value: '' }]);
  };

  const handleDeleteAssignment = (idx: number) => {
    const updatedAssignments = formData.filter((_, i) => i !== idx);
    setFormData(updatedAssignments);
  };

  const handleKeyChange = (idx: number, newKey: string) => {
    const updatedAssignments = formData.map((assignment, i) =>
      i === idx ? { ...assignment, key: newKey } : assignment
    );
    setFormData(updatedAssignments);
  };

  const handleValueChange = (idx: number, newValue: string) => {
    const updatedAssignments = formData.map((assignment, i) =>
      i === idx ? { ...assignment, value: newValue } : assignment
    );
    setFormData(updatedAssignments);
  };

  const handleCreateTemplate = async () => {
    if (templateType === undefined) {
      alert('Please select Template Type');
      return;
    }

    try {
      const checkResult = await checkTemplateExists(templateName);

      let templateVersion;
      if (checkResult.exists) {
        templateVersion = checkResult.templateVersion + 1;
      } else {
        templateVersion = 1;
      }

      const templateCreationData = {
        templateType,
        templateName,
        formData,
        templateStr,
        selectedResponseFormat,
        templateVersion: templateVersion,
      };

      const createResult = await createTemplate(templateCreationData);
      alert(
        `Template ${checkResult.exists ? 'updated' : 'created'} successfully with ID: ${
          createResult.templateId
        }, Version: ${templateVersion}`
      );
      setTemplateExists(true);
    } catch (error) {
      console.error('Error handling template creation or update:', error);
    }
  };

  const handleTemplateTypeChange = (event: SelectChangeEvent<string>): void => {
    const selectedTemplateType = event.target.value as TemplateTypes;
    setTemplateType(selectedTemplateType);
  };
  const handleResponseFormatChange = (event) => {
    setSelectedResponseFormat(event.target.value);
  };

  return (
    <MainLayout title="GPT Templates | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="850px">
        <Box my="10px">
          <Typography variant="h4">Create a Template</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 2 }}>
          <Box display="flex" gap={2} sx={{ mr: 2, mb: 1 }}>
            <TemplateTypeSelect
              templateType={templateType}
              handleTemplateTypeChange={handleTemplateTypeChange}
            />

            <FormControl>
              <InputLabel id="gpt-response-select-label">Response Format</InputLabel>
              <Select
                labelId="gpt-response-select-label"
                value={selectedResponseFormat}
                onChange={handleResponseFormatChange}
                label="Response Format"
                sx={{ width: 170 }}
              >
                <MenuItem value={GptResponseFormat.JSON_FORMAT}>JSON PARSING </MenuItem>
                <MenuItem value={GptResponseFormat.LATEX_FORMST}>LATEX PARSING</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" sx={{ mb: 1 }}>
            <Button onClick={() => router.push('/exp/gpt-problems')} variant="contained">
              Go to GPT Problems
            </Button>{' '}
          </Box>
        </Box>
        <Box sx={{ mt: 1 }}>
          <TextField
            value={templateStr}
            label="Enter Template String"
            fullWidth
            multiline
            onChange={(e) => handlePromptChange(e.target.value)}
          />
        </Box>
        <Typography variant="h5">Assignments</Typography>
        <AccordionInfo />
        <AssignmentsForm
          formData={formData}
          handleDeleteAssignment={handleDeleteAssignment}
          handleKeyChange={handleKeyChange}
          handleValueChange={handleValueChange}
          handleAddAssignment={handleAddAssignment}
        />

        <Box display="flex" gap={2}>
          <TextField
            size="small"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => handleCreateTemplate()}
            disabled={!templateName}
          >
            {templateExists ? 'Update' : 'Create'}{' '}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CreateTemplate;
