import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import {
  getCourseInfo,
  getDefiniedaInDoc,
  getDocumentSections,
  SectionsAPIData,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { convertHtmlStringToPlain, CourseInfo } from '@stex-react/utils';
import React, { useContext, useEffect, useState } from 'react';

interface SectionDetails {
  name: string;
  archive?: string;
  filepath?: string;
}

function getSectionDetails(
  data: SectionsAPIData,
  level = 0,
  parentArchive?: string,
  parentFilepath?: string
): SectionDetails[] {
  const sections: SectionDetails[] = [];
  const inheritedArchive = parentArchive;
  const inheritedFilepath = parentFilepath;
  if (data.title?.length) {
    sections.push({
      name: '\xa0'.repeat(level * 4) + convertHtmlStringToPlain(data.title),
      archive: inheritedArchive,
      filepath: inheritedFilepath,
    });
  }

  for (const child of data.children || []) {
    sections.push(
      ...getSectionDetails(child, level + (data.title?.length ? 1 : 0), data.archive, data.filepath)
    );
  }
  return sections;
}

export const CourseConceptsDialog = ({
  open,
  onClose,
  setChosenConcepts,
}: {
  open: boolean;
  onClose: () => void;
  setChosenConcepts: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});
  const [allSectionDetails, setAllSectionDetails] = useState<{
    [courseId: string]: SectionDetails[];
  }>({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourseSections, setSelectedCourseSections] = useState<SectionDetails[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionDetails | null>(null);
  const [sectionConcepts, setSectionConcepts] = useState<{ label: string; value: string }[]>([]);
  const [processedOptions, setProcessedOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    async function getSections() {
      const secDetails: Record<string, SectionDetails[]> = {};
      for (const courseId of Object.keys(courses)) {
        const { notesArchive: archive, notesFilepath: filepath } = courses[courseId];
        const docSections = await getDocumentSections(mmtUrl, archive, filepath);
        secDetails[courseId] = getSectionDetails(docSections);
      }
      setAllSectionDetails(secDetails);
    }
    getSections();
  }, [mmtUrl, courses]);

  const handleCourseChange = (event: SelectChangeEvent) => {
    const courseId: string = event.target.value;
    setSelectedCourse(courseId);
    setSelectedCourseSections(allSectionDetails[courseId]);
  };
  const handleSectionChange = async (event: SelectChangeEvent) => {
    const sectionName = event.target.value;
    const selectedSection = selectedCourseSections.find((section) => section.name === sectionName);
    if (selectedSection) {
      setSelectedSection(selectedSection);
    }
    setLoading(true);
    try {
      const definedConcepts = await getDefiniedaInDoc(
        mmtUrl,
        selectedSection?.archive,
        selectedSection?.filepath
      );
      const conceptsUri = [...new Set(definedConcepts.flatMap((data) => data.symbols))];
      setProcessedOptions(
        [...conceptsUri].map((uri) => ({
          label: `${uri.split('?').pop()} (${uri})`,
          value: uri,
        }))
      );
    } catch (error) {
      console.error('Error fetching concepts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectButtonClick = () => {
    const selectedUris = sectionConcepts.map((item) => item.value);
    setChosenConcepts((prevSelected: string[]) => [...new Set([...prevSelected, ...selectedUris])]);
    setSectionConcepts([]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Choose Course Concepts</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl sx={{ minWidth: '100px' }}>
              <InputLabel id="select-course-label">Course</InputLabel>
              <Select
                labelId="select-course-label"
                value={selectedCourse}
                onChange={handleCourseChange}
                label="Course"
              >
                {Object.keys(courses).map((courseId) => (
                  <MenuItem key={courseId} value={courseId}>
                    {courseId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel id="section-select-label">Choose Section</InputLabel>
              <Select
                labelId="section-select-label"
                value={selectedSection?.name}
                onChange={handleSectionChange}
                label="Choose Section"
                sx={{ width: '300px' }}
              >
                {selectedCourseSections.map((section, idx) => (
                  <MenuItem key={idx} value={section.name}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ marginRight: 2 }} />
                <Typography variant="body1">Loading Concepts...</Typography>
              </Box>
            ) : (
              <Autocomplete
                sx={{
                  flex: 1,
                }}
                ListboxProps={{
                  style: { marginRight: '20px' },
                }}
                multiple
                limitTags={2}
                fullWidth
                disableCloseOnSelect
                options={processedOptions}
                getOptionLabel={(option) => option.label}
                value={sectionConcepts}
                onChange={(event, newValue) => setSectionConcepts(newValue)}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} />
                    <ListItemText primary={option.label} />
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Choose Concept" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.value.split('?').pop()}
                      {...getTagProps({ index })}
                      key={index}
                      color="primary"
                    />
                  ))
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              handleSelectButtonClick();
              onClose();
            }}
            variant="contained"
          >
            Select
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
