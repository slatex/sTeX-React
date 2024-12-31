import { Book, MicExternalOn, Quiz, SupervisedUserCircle } from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ALL_DIM_CONCEPT_PAIR,
  ALL_LO_RELATION_TYPES,
  ALL_LO_TYPES,
  ALL_NON_DIM_CONCEPT,
  AllLoRelationTypes,
  getCourseInfo,
  getDefiniedaInDoc,
  getDocumentSections,
  getSparlQueryForDimConcepts,
  getSparlQueryForNonDimConcepts,
  getSparqlQueryForDimConceptsAsLoRelation,
  getSparqlQueryForLoString,
  getSparqlQueryForNonDimConceptsAsLoRelation,
  LoRelationToDimAndConceptPair,
  LoRelationToNonDimConcept,
  LoType,
  SectionsAPIData,
  sparqlQuery,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  capitalizeFirstLetter,
  convertHtmlStringToPlain,
  CourseInfo,
  localStore,
  PRIMARY_COL,
} from '@stex-react/utils';
import { extractProjectIdAndFilepath } from 'packages/stex-react-renderer/src/lib/utils';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import LoListDisplay from '../components/LoListDisplay';
import LoCartModal, { CartItem } from '../components/LoCartModal';
import MainLayout from '../layouts/MainLayout';

let cachedConceptsList: Record<string, string> | null = null;

const ALL_CONCEPT_MODES = [
  'Appears Anywhere',
  'Annotated as Prerequisite',
  'Annotated as Objective',
] as const;

export type ConceptMode = (typeof ALL_CONCEPT_MODES)[number];
interface UrlData {
  projectName: string;
  topic: string;
  fileName: string;
  icon?: JSX.Element;
}

export function getUrlInfo(url: string): UrlData {
  const [archive, filePath] = extractProjectIdAndFilepath(url);
  const fileParts = filePath.split('/');
  const fileName = fileParts[fileParts.length - 1].split('.')[0];
  let projectName = '';
  let topic = '';
  let icon = null;
  const projectParts = archive.split('/');
  if (archive.startsWith('courses/')) {
    projectName = projectParts[2];
    topic = fileParts[0];
    icon = <SchoolIcon sx={{ color: 'primary.main', fontSize: '18px' }} />;
  } else if (archive.startsWith('problems/')) {
    projectName = projectParts[1];
    topic = fileParts[0];
    icon = <Quiz sx={{ color: 'primary.main', fontSize: '18px' }} />;
  } else if (archive.startsWith('KwarcMH/')) {
    projectName = projectParts[0];
    topic = fileParts[0];
    icon = <SchoolIcon sx={{ color: 'primary.main', fontSize: '18px' }} />;
  } else if (archive.startsWith('smglom/')) {
    projectName = projectParts[0];
    topic = projectParts[1];
    icon = <Book sx={{ color: 'primary.main', fontSize: '18px' }} />;
  } else if (archive.startsWith('mkohlhase/')) {
    projectName = projectParts[0];
    topic = fileParts[0];
    icon = <SupervisedUserCircle sx={{ color: 'primary.main', fontSize: '18px' }} />;
  } else if (archive.startsWith('talks/')) {
    projectName = projectParts[0];
    topic = projectParts[1];
    icon = <MicExternalOn sx={{ color: 'primary.main', fontSize: '18px' }} />;
  }

  return { projectName, topic, fileName, icon };
}
const renderDropdownLabel = (selected: string[]) => {
  if (!selected.length) return '';
  const firstTwo = selected.slice(0, 2).map(capitalizeFirstLetter).join(', ');
  return selected.length > 2 ? firstTwo + '...' : firstTwo;
};
const FilterChipList = ({
  label,
  items,
  setItems,
}: {
  label: string;
  items: string[];
  setItems;
}) => {
  const bgcolor =
    label === 'Mode'
      ? '#b3e5fc'
      : label === 'LO'
      ? '#fbe9e7'
      : label === 'Archive'
      ? '#c8e6c9'
      : 'rgba(224, 224, 224, 0.4)';

  return items.map((item) => {
    const { icon, projectName } =
      label === 'Archive' ? getUrlInfo(item) : { icon: null, projectName: null };
    return (
      <Chip
        key={item}
        label={
          label === 'Archive' ? (
            <Box display="flex" alignItems="center" gap="5px">
              <Typography variant="body2">{`${label}:`}</Typography>
              {icon}
              <Typography variant="body2">{projectName}</Typography>
            </Box>
          ) : (
            `${label}: ${item}`
          )
        }
        onDelete={() => setItems((prev) => prev.filter((v) => v !== item))}
        sx={{ m: 0.5, bgcolor }}
      />
    );
  });
};
async function fetchConceptList(mmtUrl: string): Promise<Record<string, string>> {
  const nonDimConceptQuery = getSparlQueryForNonDimConcepts();
  const dimConceptQuery = getSparlQueryForDimConcepts();

  const [nonDimBindings, dimBindings] = await Promise.all([
    sparqlQuery(mmtUrl, nonDimConceptQuery),
    sparqlQuery(mmtUrl, dimConceptQuery),
  ]);
  const bindings = [...nonDimBindings.results.bindings, ...dimBindings.results.bindings];
  const conceptsList = {};
  bindings.forEach((binding) => {
    const uri = binding.x.value;
    const key = uri.split('?').pop();
    conceptsList[key] = uri;
  });
  return conceptsList;
}

function constructLearningObjects(bindings: any[]): Record<LoType, string[]> {
  const learningObjectsByType: Record<LoType, string[]> = {
    definition: [],
    problem: [],
    example: [],
    para: [],
    statement: [],
  };
  bindings.forEach(({ lo, type }) => {
    const lastIndex = type?.value.lastIndexOf('#');
    const typeKey = type?.value.slice(lastIndex + 1) as LoType;
    if (!ALL_LO_TYPES.includes(typeKey)) {
      console.error(`Unknown learning object type: ${typeKey}`);
      return;
    }
    learningObjectsByType[typeKey].push(lo?.value);
  });
  return learningObjectsByType;
}

async function fetchLoFromConceptsAsLoRelations(
  mmtUrl: string,
  concepts: string[],
  relations: AllLoRelationTypes[],
  loString: string
): Promise<Record<LoType, string[]>> {
  if (concepts?.length === 0 && !loString.trim()) return;
  let bindings = [];
  if (concepts?.length === 0) {
    const query = getSparqlQueryForLoString(mmtUrl, loString);
    const response = await sparqlQuery(mmtUrl, query);
    bindings = response.results.bindings;
    return constructLearningObjects(bindings);
  }
  if (relations.length === 0) {
    relations = [...ALL_LO_RELATION_TYPES];
  }
  const dimRelations = relations.filter((relation) =>
    ALL_DIM_CONCEPT_PAIR.includes(relation as LoRelationToDimAndConceptPair)
  );
  const nonDimRelations = relations.filter((relation) =>
    ALL_NON_DIM_CONCEPT.includes(relation as LoRelationToNonDimConcept)
  );
  if (dimRelations.length) {
    const query = getSparqlQueryForDimConceptsAsLoRelation(
      concepts,
      dimRelations as LoRelationToDimAndConceptPair[],
      loString
    );
    const response = await sparqlQuery(mmtUrl, query);
    if (response?.results?.bindings) {
      bindings.push(...response.results.bindings);
    }
  }

  if (nonDimRelations.length) {
    const query = getSparqlQueryForNonDimConceptsAsLoRelation(
      concepts,
      nonDimRelations as LoRelationToNonDimConcept[],
      loString
    );
    const response = await sparqlQuery(mmtUrl, query);
    if (response?.results?.bindings) {
      bindings.push(...response.results.bindings);
    }
  }
  return constructLearningObjects(bindings);
}

export interface SectionDetails {
  name: string;
  archive?: string;
  filepath?: string;
}
export function getSectionDetails(
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

const CourseConceptsDialog = ({
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
    const sectionName = event.target.value as string;
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
                  style: {
                    marginRight: '20px',
                  },
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

const LoExplorerPage = () => {
  const [loString, setLoString] = useState('');
  const [chosenRelations, setChosenRelations] = useState<AllLoRelationTypes[]>([]);
  const [chosenConcepts, setChosenConcepts] = useState<string[]>([]);
  const [chosenLoTypes, setChosenLoTypes] = useState<LoType[]>([]);
  const [chosenArchives, setChosenArchives] = useState<string[]>([]);
  const [chosenArchivesUris, setChosenArchivesUris] = useState<string[]>([]);
  const [loUris, setLoUris] = useState<Record<LoType, string[]>>({
    definition: [],
    problem: [],
    example: [],
    para: [],
    statement: [],
  });
  const [selectedUri, setSelectedUri] = useState('');
  const [selectedLo, setSelectedLo] = useState<LoType>('problem');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [conceptsList, setConceptsList] = useState<Record<string, string>>({});
  const [filteredUris, setFilteredUris] = useState<string[]>(loUris[selectedLo] || []);
  const [uniqueArchives, setUniqueArchives] = useState<string[]>([]);
  const [uniqueArchiveUris, setUniqueArchiveUris] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [filteredCounts, setFilteredCounts] = useState<Record<LoType, number>>({
    definition: 0,
    problem: 0,
    example: 0,
    para: 0,
    statement: 0,
  });

  useEffect(() => {
    async function fetchAndSetConceptList() {
      if (cachedConceptsList) {
        setConceptsList(cachedConceptsList);
      } else {
        const fetchedConceptsList = await fetchConceptList(mmtUrl);
        cachedConceptsList = fetchedConceptsList;
        setConceptsList(fetchedConceptsList);
      }
    }
    fetchAndSetConceptList();
  }, [mmtUrl]);

  useEffect(() => {
    setFilteredUris(loUris[selectedLo] || []);
  }, [selectedLo, loUris]);
  useEffect(() => {
    setSelectedUri(filteredUris.length > 0 ? filteredUris[0] : '');
  }, [filteredUris]);
  useEffect(() => {
    const uniqueProjects: string[] = [];
    const uniqueProjectUris: string[] = [];
    Object.keys(loUris).forEach((loType) => {
      const currentUris = loUris[loType as LoType] || [];
      const uniqueProjectNames = Array.from(
        new Set(
          currentUris
            .filter((uri) => uri !== undefined)
            .map((uri) => getUrlInfo(uri)?.projectName)
            .filter((projectName) => projectName)
        )
      );
      uniqueProjectNames.forEach((projectName) => {
        if (!uniqueProjects.includes(projectName)) {
          const projectUris = currentUris.find(
            (uri) => getUrlInfo(uri)?.projectName === projectName
          );
          uniqueProjects.push(projectName);
          uniqueProjectUris.push(projectUris);
        }
      });
    });
    setUniqueArchives(uniqueProjects);
    setUniqueArchiveUris(uniqueProjectUris);
  }, [loUris]);
  useEffect(() => {
    const uris = chosenArchives.map((projectName) => {
      return uniqueArchiveUris.find((uri) => getUrlInfo(uri)?.projectName === projectName);
    });
    if (JSON.stringify(uris) !== JSON.stringify(chosenArchivesUris)) {
      setChosenArchivesUris(uris);
    }
  }, [chosenArchives]);

  useEffect(() => {
    const archives = chosenArchivesUris.map((uri) => getUrlInfo(uri)?.projectName);
    if (JSON.stringify(archives) !== JSON.stringify(chosenArchives)) {
      setChosenArchives(archives);
    }
  }, [chosenArchivesUris]);

  useEffect(() => {
    if (chosenArchives.length > 0) {
      const filtered = (loUris[selectedLo] || []).filter((uri) => {
        const { projectName } = getUrlInfo(uri);
        return chosenArchives.some(
          (archive) => archive.toLowerCase() === projectName.toLowerCase()
        );
      });
      setFilteredUris(filtered);
    } else setFilteredUris(loUris[selectedLo] || []);
  }, [chosenArchives, selectedLo, loUris]);

  useEffect(() => {
    const storedCart = JSON.parse(localStore?.getItem('lo-cart')) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStore?.setItem('lo-cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    const counts: Record<LoType, number> = {
      definition: 0,
      problem: 0,
      example: 0,
      para: 0,
      statement: 0,
    };
    ALL_LO_TYPES.forEach((loType) => {
      counts[loType] = getFilteredUris(loType).length;
    });
    setFilteredCounts(counts);
  }, [loUris, chosenArchives]);

  const handleSubmit = async () => {
    if (chosenConcepts?.length === 0 && !loString.trim()) {
      return;
    }
    try {
      setIsSearching(true);
      const loUris = await fetchLoFromConceptsAsLoRelations(
        mmtUrl,
        chosenConcepts,
        chosenRelations,
        loString
      );
      setLoUris(loUris);
    } catch (error) {
      console.error('Error fetching learning objects:', error);
      alert('Failed to fetch learning objects. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConceptChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: string[]) => {
    setChosenConcepts(newValue.map((key) => conceptsList[key]));
  };

  const handleAddToCart = (uri: string, uriType: LoType) => {
    const uriWithTypeObj = { uri, uriType };
    const existsInCart = cart.some((item) => item.uri === uri && item.uriType === uriType);
    if (!existsInCart) {
      setCart((prev) => [...prev, uriWithTypeObj]);
    }
  };

  const handleRemoveFromCart = (uri: string, uriType: LoType) => {
    setCart((prev) => prev.filter((item) => !(item.uri === uri && item.uriType === uriType)));
  };

  const handleArchiveChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: string[]) => {
    setChosenArchives(newValue);
  };

  const getFilteredUris = (loType) => {
    const uris = loUris[loType] || [];
    if (chosenArchives.length > 0) {
      return uris.filter((uri) => {
        const { projectName } = getUrlInfo(uri);
        return chosenArchives.some(
          (archive) => archive.toLowerCase() === projectName?.toLowerCase()
        );
      });
    }
    return uris;
  };

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 70,
  });

  const conceptKeys = Object.keys(conceptsList);

  return (
    <MainLayout title="Learning Objects | ALeA">
      <Paper elevation={3} sx={{ m: '16px' }}>
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            color: '#333',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Learning Objects Explorer
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              onClick={() => setShowCart(true)}
              sx={{
                backgroundColor: 'brown',
                '&:hover': { bgcolor: '#f1f1f1', color: PRIMARY_COL },
              }}
            >
              Show Cart
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: 'column',
                  flex: '3 1 0',
                  minWidth: '350px',
                  width: '100%',
                }}
              >
                <TextField
                  fullWidth
                  label="Search Learning Object String"
                  variant="outlined"
                  value={loString}
                  onChange={(e) => setLoString(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Autocomplete
                    sx={{ flex: 1, minWidth: '350px' }}
                    multiple
                    limitTags={2}
                    fullWidth
                    disableCloseOnSelect
                    options={conceptKeys}
                    getOptionLabel={(key: string) => `${key} (${conceptsList[key]})`}
                    value={conceptKeys.filter((key) => chosenConcepts.includes(conceptsList[key]))}
                    onChange={handleConceptChange}
                    renderOption={(props, option: string, { selected }) => (
                      <li {...props}>
                        <Checkbox checked={selected} />
                        <ListItemText primary={`${option} (${conceptsList[option]})`} />{' '}
                      </li>
                    )}
                    filterOptions={filterOptions}
                    renderInput={(params) => <TextField {...params} label="Choose Concept" />}
                    renderTags={(value: string[], getTagProps) =>
                      value.map((key, index) => (
                        <Chip label={key} {...getTagProps({ index })} key={index} color="primary" />
                      ))
                    }
                  />

                  <Button
                    variant="outlined"
                    onClick={() => setOpen(true)}
                    sx={{
                      flex: 1,
                      minWidth: '180px',
                      minHeight: '50px',
                    }}
                  >
                    Choose Course Concepts
                  </Button>
                  <Tooltip
                    title={chosenConcepts.length === 0 ? 'Please choose a concept first' : ''}
                  >
                    <FormControl fullWidth sx={{ flex: 1, minWidth: '200px' }}>
                      <InputLabel id="Select-relations-label">
                        Relation with Learning Object
                      </InputLabel>
                      <Select
                        labelId="Select-relations-label"
                        label="Relation with Learning Object"
                        multiple
                        variant="outlined"
                        value={chosenRelations}
                        onChange={(e) => setChosenRelations(e.target.value as AllLoRelationTypes[])}
                        renderValue={() => renderDropdownLabel(chosenRelations)}
                        disabled={chosenConcepts.length === 0}
                      >
                        {ALL_LO_RELATION_TYPES.map((relation) => (
                          <MenuItem key={relation} value={relation}>
                            <Checkbox checked={chosenRelations.includes(relation)} />
                            <ListItemText primary={relation} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Tooltip>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: '1 1 0',
                  minWidth: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Button
                  variant="contained"
                  sx={{ width: '100%', height: '60%', minHeight: '48px' }}
                  disabled={isSearching || (chosenConcepts?.length === 0 && !loString.trim())}
                  onClick={handleSubmit}
                >
                  {isSearching && <CircularProgress size={20} sx={{ mr: 1 }} />}Search
                </Button>
              </Box>
            </Box>
            <CourseConceptsDialog
              open={open}
              onClose={() => {
                setOpen(false);
              }}
              setChosenConcepts={setChosenConcepts}
            />
            <Box display="flex" gap="16px" flexWrap="wrap" sx={{ width: '100%' }}>
              <FormControl fullWidth sx={{ flex: 1, minWidth: '250px' }}>
                <InputLabel id="learning-object-type-label">Learning Object Types</InputLabel>
                <Select
                  labelId="learning-object-type-label"
                  label="Learning Object Types"
                  multiple
                  value={chosenLoTypes}
                  onChange={(e) => setChosenLoTypes(e.target.value as LoType[])}
                  renderValue={() => renderDropdownLabel(chosenLoTypes)}
                >
                  {ALL_LO_TYPES.map((lo) => (
                    <MenuItem key={lo} value={lo}>
                      <Checkbox checked={chosenLoTypes.includes(lo)} />
                      <ListItemText primary={capitalizeFirstLetter(lo)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ flex: 1, minWidth: '250px' }}>
                <Autocomplete
                  multiple
                  options={uniqueArchives}
                  value={chosenArchives}
                  limitTags={1}
                  onChange={handleArchiveChange}
                  renderInput={(params) => <TextField {...params} label="Archives" />}
                  renderOption={(props, option, { selected }) => {
                    const { icon } = getUrlInfo(
                      uniqueArchiveUris.find((uri) => getUrlInfo(uri).projectName === option)
                    );
                    return (
                      <li {...props}>
                        <Checkbox checked={selected} />
                        <ListItemText primary={option} />
                        {icon}
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((selectedOption, index) => {
                      const uri = uniqueArchiveUris.find(
                        (uri) => getUrlInfo(uri)?.projectName === selectedOption
                      );
                      const { icon } = getUrlInfo(uri) || {};
                      return (
                        <Chip
                          key={selectedOption}
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              {icon}
                              <Typography variant="body2">{selectedOption}</Typography>
                            </Box>
                          }
                          {...getTagProps({ index })}
                        />
                      );
                    })
                  }
                  sx={{ flex: '1 ' }}
                  disableCloseOnSelect
                  fullWidth
                />
              </FormControl>
            </Box>
          </Box>
          {(!!chosenRelations.length || !!chosenLoTypes.length || !!chosenArchives.length) && (
            <Box
              sx={{
                mb: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                borderRadius: '8px',
                p: 1,
                border: '1px solid #ccc',
                bgcolor: '#f9f9f9',
              }}
            >
              <FilterChipList
                label="Relations"
                items={chosenRelations}
                setItems={setChosenRelations}
              />
              <FilterChipList label="LO" items={chosenLoTypes} setItems={setChosenLoTypes} />
              <FilterChipList
                label="Archive"
                items={chosenArchivesUris}
                setItems={setChosenArchivesUris}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, width: '100%', flexWrap: 'wrap' }}>
            {(chosenLoTypes.length ? chosenLoTypes : ALL_LO_TYPES).map((lo) => (
              <Button
                key={lo}
                variant={selectedLo === lo ? 'contained' : 'outlined'}
                sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
                onClick={() => setSelectedLo(lo)}
              >
                ({lo} {filteredCounts[lo] || 0})
              </Button>
            ))}
          </Box>
          <LoListDisplay
            uris={filteredUris}
            loType={selectedLo}
            cart={cart}
            selectedUri={selectedUri}
            setSelectedUri={setSelectedUri}
            handleAddToCart={handleAddToCart}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        </Box>

        <LoCartModal
          showCart={showCart}
          setShowCart={setShowCart}
          cart={cart}
          handleRemoveFromCart={handleRemoveFromCart}
        />
      </Paper>
    </MainLayout>
  );
};

export default LoExplorerPage;
