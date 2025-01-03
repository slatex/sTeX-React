import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  createFilterOptions,
  Autocomplete,
  Chip,
  Tooltip,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { CourseConceptsDialog } from './CourseConceptDialog';
import { capitalizeFirstLetter } from '@stex-react/utils';
import {
  ALL_DIM_CONCEPT_PAIR,
  ALL_LO_RELATION_TYPES,
  ALL_LO_TYPES,
  ALL_NON_DIM_CONCEPT,
  AllLoRelationTypes,
  getSparlQueryForDimConcepts,
  getSparlQueryForNonDimConcepts,
  getSparqlQueryForDimConceptsAsLoRelation,
  getSparqlQueryForLoString,
  getSparqlQueryForNonDimConceptsAsLoRelation,
  LoRelationToDimAndConceptPair,
  LoRelationToNonDimConcept,
  LoType,
  sparqlQuery,
} from '@stex-react/api';
import styles from '../../styles/lo-explorer.module.scss';
import { getUrlInfo } from '../LoListDisplay';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { ArchiveMap } from '.';

let cachedConceptsList: Record<string, string> | null = null;

const renderDropdownLabel = (selected: string[]) => {
  if (!selected.length) return '';
  const firstTwo = selected.slice(0, 2).map(capitalizeFirstLetter).join(', ');
  return selected.length > 2 ? firstTwo + '...' : firstTwo;
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

function ConceptAutocomplete({
  conceptsList,
  chosenConcepts,
  setChosenConcepts,
}: {
  conceptsList: Record<string, string>;
  chosenConcepts: string[];
  setChosenConcepts: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 70,
  });
  const conceptKeys = Object.keys(conceptsList);
  const handleConceptChange = (e: React.ChangeEvent<HTMLInputElement>, newValue: string[]) => {
    setChosenConcepts(newValue.map((key) => conceptsList[key]));
  };
  return (
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
  );
}

const LoTypeSelect = ({
  chosenLoTypes,
  setChosenLoTypes,
}: {
  chosenLoTypes: LoType[];
  setChosenLoTypes: React.Dispatch<React.SetStateAction<LoType[]>>;
}) => {
  return (
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
  );
};

function ArchivesAutocomplete({
  uniqueArchivesMap,
  chosenArchivesMap,
  setChosenArchivesMap,
}: {
  uniqueArchivesMap: Record<string, string>;
  chosenArchivesMap: ArchiveMap[];
  setChosenArchivesMap: React.Dispatch<React.SetStateAction<ArchiveMap[]>>;
}) {
  const handleArchiveChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: string[]) => {
    const updatedChosenArchivesMap = newValue.map((archive) => ({
      archive,
      archiveUrl: uniqueArchivesMap[archive],
    }));
    setChosenArchivesMap(updatedChosenArchivesMap);
  };
  return (
    <FormControl fullWidth sx={{ flex: 1, minWidth: '250px' }}>
      <Autocomplete
        multiple
        options={Object.keys(uniqueArchivesMap)}
        value={chosenArchivesMap.map((item) => item.archive)}
        limitTags={1}
        onChange={handleArchiveChange}
        renderInput={(params) => <TextField {...params} label="Archives" />}
        renderOption={(props, option, { selected }) => {
          const uri = uniqueArchivesMap[option];
          const { icon } = getUrlInfo(uri) || {};
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
            const uri = uniqueArchivesMap[selectedOption];
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
  );
}

const RelationWithLOSelect = ({
  chosenConcepts,
  chosenRelations,
  setChosenRelations,
}: {
  chosenConcepts: string[];
  chosenRelations: AllLoRelationTypes[];
  setChosenRelations: React.Dispatch<React.SetStateAction<AllLoRelationTypes[]>>;
}) => {
  return (
    <Tooltip title={chosenConcepts.length === 0 ? 'Please choose a concept first' : ''}>
      <FormControl fullWidth sx={{ flex: 1, minWidth: '200px' }}>
        <InputLabel id="Select-relations-label">Relation with Learning Object</InputLabel>
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
  );
};

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
  loString: string,
  loTypes: LoType[]
): Promise<Record<LoType, string[]>> {
  if (concepts?.length === 0 && !loString.trim()) return;
  if (loTypes?.length === 0) {
    loTypes = [...ALL_LO_TYPES];
  }
  let bindings = [];
  if (concepts?.length === 0) {
    const query = getSparqlQueryForLoString(loString, loTypes);
    const response = await sparqlQuery(mmtUrl, query);
    bindings = response.results?.bindings;
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
      loString,
      loTypes
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
      loString,
      loTypes
    );
    const response = await sparqlQuery(mmtUrl, query);
    if (response?.results?.bindings) {
      bindings.push(...response.results.bindings);
    }
  }
  return constructLearningObjects(bindings);
}

const LoFilterAndSearch = ({
  uniqueArchivesMap,
  chosenArchivesMap,
  setChosenArchivesMap,
  chosenRelations,
  setChosenRelations,
  chosenLoTypes,
  setChosenLoTypes,
  setShowCart,
  setLoUris,
}: {
  uniqueArchivesMap: Record<string, string>;
  chosenArchivesMap: ArchiveMap[];
  setChosenArchivesMap: React.Dispatch<React.SetStateAction<ArchiveMap[]>>;
  chosenRelations: AllLoRelationTypes[];
  setChosenRelations: React.Dispatch<React.SetStateAction<AllLoRelationTypes[]>>;
  chosenLoTypes: LoType[];
  setChosenLoTypes: React.Dispatch<React.SetStateAction<LoType[]>>;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
  setLoUris: React.Dispatch<React.SetStateAction<Record<LoType, string[]>>>;
}) => {
  const [searchString, setSearchString] = useState('');
  const [chosenConcepts, setChosenConcepts] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [conceptsList, setConceptsList] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);

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

  const handleSubmit = async () => {
    if (chosenConcepts?.length === 0 && !searchString.trim()) {
      return;
    }
    try {
      setIsSearching(true);
      const loUris = await fetchLoFromConceptsAsLoRelations(
        mmtUrl,
        chosenConcepts,
        chosenRelations,
        searchString,
        chosenLoTypes
      );
      setLoUris(loUris);
    } catch (error) {
      console.error('Error fetching learning objects:', error);
      alert('Failed to fetch learning objects. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Box className={styles.titleBox}>
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
            '&:hover': { bgcolor: '#f1f1f1', color: 'primary.main' },
          }}
        >
          Show Cart
        </Button>
      </Box>

      <Box className={styles.filterOuterBox}>
        <Box className={styles.filterInnerBox}>
          <Box className={styles.filterFieldsBox}>
            <TextField
              fullWidth
              label="Search Learning Object String"
              variant="outlined"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <ConceptAutocomplete
                chosenConcepts={chosenConcepts}
                conceptsList={conceptsList}
                setChosenConcepts={setChosenConcepts}
              />
              <Button
                variant="outlined"
                onClick={() => setOpen(true)}
                sx={{ flex: 1, minWidth: '180px', minHeight: '50px' }}
              >
                Choose Course Concepts
              </Button>
              <RelationWithLOSelect
                chosenConcepts={chosenConcepts}
                chosenRelations={chosenRelations}
                setChosenRelations={setChosenRelations}
              />
              <LoTypeSelect chosenLoTypes={chosenLoTypes} setChosenLoTypes={setChosenLoTypes} />
            </Box>
          </Box>
          <Box className={styles.searchButtonBox}>
            <Button
              variant="contained"
              sx={{ width: '100%', height: '60%', minHeight: '48px' }}
              disabled={isSearching || (chosenConcepts?.length === 0 && !searchString.trim())}
              onClick={handleSubmit}
            >
              {isSearching && <CircularProgress size={20} sx={{ mr: 1 }} />}Search
            </Button>
          </Box>
        </Box>
        <CourseConceptsDialog
          open={open}
          onClose={() => setOpen(false)}
          setChosenConcepts={setChosenConcepts}
        />
        <ArchivesAutocomplete
          uniqueArchivesMap={uniqueArchivesMap}
          chosenArchivesMap={chosenArchivesMap}
          setChosenArchivesMap={setChosenArchivesMap}
        />
      </Box>
    </>
  );
};

export default LoFilterAndSearch;
