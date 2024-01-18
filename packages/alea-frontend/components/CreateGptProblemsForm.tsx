import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  CreateGptProblemsRequest,
  SectionsAPIData,
  Template,
  getDocumentSections,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  FileLocation,
  convertHtmlStringToPlain,
  fileLocToString,
  fullDocumentUrl,
  stringToFileLoc,
} from '@stex-react/utils';
import { ChangeEvent, useContext, useEffect, useState } from 'react';

function templateToFormData(template: Template): CreateGptProblemsRequest {
  return {
    dryRun: true,
    templateName: template?.templateName || '',
    templateVersion: template?.version || '',
    templateStrs: template?.templateStrs || [],
    assignments: template?.defaultAssignment || [],
    postProcessingSteps: [],
  };
}

function getGitlabUrl({ archive, filepath }: FileLocation) {
  if (filepath.endsWith('.xhtml'))
    filepath = filepath.replace('.xhtml', '.tex');
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
  const thisFileLoc =
    archive && filepath ? { archive, filepath: stexFilepath } : undefined;
  for (const c of data.children || []) {
    names.push(
      ...getSectionNames(
        c,
        level + (data.title?.length ? 1 : 0),
        thisFileLoc || parentFile
      )
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
  const [sections, setSectionNames] = useState<
    { name: string; parentFile: FileLocation }[]
  >([]);
  const fileLoc = stringToFileLoc(sectionParentId);

  useEffect(() => {
    async function getSections() {
      const archive = 'MiKoMH/AI';
      const filepath = 'course/notes/notes1.tex';
      const docSections = await getDocumentSections(mmtUrl, archive, filepath);
      const s = getSectionNames(docSections);
      setSectionNames(s);
    }
    getSections();
  }, [mmtUrl]);

  return (
    <>
      <FormControl sx={{ m: '20px 5px 0' }}>
        <InputLabel id="section-select-label">Section Name</InputLabel>
        <Select
          labelId="section-select-label"
          value={sectionParentId}
          onChange={(e) => onChange(e.target.value)}
          label="Section Name"
          sx={{ width: '300px' }}
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
      <a
        href={getGitlabUrl(fileLoc)}
        style={{ textDecoration: 'underline' }}
        target="_blank"
      >
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
  const { mmtUrl } = useContext(ServerLinksContext);
  const isSectionStex = assignKey.startsWith('SECTION_STEX');
  const isSectionTidyStex = assignKey.startsWith('SECTION_TIDY_STEX');
  if (isSectionStex || isSectionTidyStex)
    return <SectionPicker sectionParentId={value} onChange={onChange} />;
  const isFetchUrl = assignKey.startsWith('FETCH_URL');

  const isUriDefMd = assignKey.startsWith('URI_DEF_MD');
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
          <a
            href={getGitlabUrl(fileLoc)}
            style={{ textDecoration: 'underline' }}
            target="_blank"
          >
            Link
          </a>
        ) : (
          <>
            Must be of the form{' '}
            <span style={{ backgroundColor: '#AAA', padding: '0 3px' }}>
              archive||filepath
            </span>
          </>
        ))}
      {isUriDefMd && (
        <a
          href={`${mmtUrl}/:sTeX/declaration?${value}`}
          style={{ textDecoration: 'underline' }}
          target="_blank"
        >
          Definition
        </a>
      )}
    </>
  );
}

export function CreateGptProblemsForm({
  template,
  onUpdate,
  templates,
  onSaveTemplate,
}: {
  template: Template;
  onUpdate: (formData: CreateGptProblemsRequest) => void;
  templates: Template[];
  onSaveTemplate: (
    templateName: string,
    formData: CreateGptProblemsRequest
  ) => any;
}) {
  const [templateName, setTemplateName] = useState<string>(
    template.templateName || ''
  );
  const [formData, setFormData] = useState<CreateGptProblemsRequest>(
    templateToFormData(template)
  );
  const isExisting = templates.some((t) => t.templateName === templateName);
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
      <Typography variant="h5">Prompts</Typography>
      <FormControl fullWidth>
        {formData.templateStrs.map((template, index) => (
          <Box key={index} sx={{ mt: '10px' }}>
            <TextField
              value={template}
              label={'Prompt ' + (index + 1)}
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
      <Typography variant="h5">Assignments</Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <b>Special Key Prefixes</b>
        </AccordionSummary>
        <AccordionDetails>
          <table>
            <tr>
              <td>FETCH_STEX</td>
              <td>value contains archive and filepath of the stex file. </td>
              <td>
                Template marker replaced by the stex (recursively expanded)
              </td>
            </tr>
            <tr>
              <td>SECTION_STEX</td>
              <td>Choose a section from the dropdown</td>
              <td>
                Template marker replaced by the stex (recursively expanded)
              </td>
            </tr>
            <tr>
              <td>URI_DEF_MD</td>
              <td>value is interpreted as a URI</td>
              <td>
                Template marker replaced by the concept definition (markdown)
              </td>
            </tr>
            <tr>
              <td>FETCH_URL</td>
              <td>value is interpreted as a url</td>
              <td>Template marker replaced by content fetched from url.</td>
            </tr>
          </table>
        </AccordionDetails>
      </Accordion>
      <FormControl fullWidth>
        {formData.assignments.map((assignment, idx) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={idx}
            sx={{ mt: '10px' }}
          >
            <Grid item xs={1}>
              <IconButton
                onClick={() => {
                  const n = formData.assignments.filter((_, i) => i !== idx);
                  setFormData({ ...formData, assignments: n });
                }}
                sx={{ color: 'crimson' }}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
            <Grid item xs={5}>
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
              <AssignmentValueInput
                assignKey={assignment.key}
                value={assignment.value}
                onChange={(value) => {
                  formData.assignments[idx].value = value;
                  setFormData({ ...formData });
                }}
              />
            </Grid>
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

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.dryRun}
            onChange={(e) =>
              setFormData({ ...formData, dryRun: e.target.checked })
            }
            name="dryRun"
          />
        }
        label="Dry Run"
      />
      <br />

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
          onClick={() => onSaveTemplate(templateName, formData)}
          variant="contained"
          sx={{ ml: '10px' }}
        >
          {isExisting ? 'Update Template' : 'Create Template'}
        </Button>
      </Box>
    </div>
  );
}
