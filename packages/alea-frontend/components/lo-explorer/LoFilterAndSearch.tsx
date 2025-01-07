import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  createFilterOptions,
  FormControl,
  ListItemText,
  Tooltip,
  Typography,
  TextField,
} from '@mui/material';
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
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { capitalizeFirstLetter } from '@stex-react/utils';
import React, { useContext, useEffect, useState } from 'react';
import { ArchiveMap } from '.';
import styles from '../../styles/lo-explorer.module.scss';
import { getUrlInfo } from '../LoListDisplay';
import { CourseConceptsDialog } from './CourseConceptDialog';

let cachedConceptsList: Record<string, string> | null = null;

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

type LoTypeWithSelectAll = 'Select All' | LoType;
const LoTypeSelect = ({
  chosenLoTypes,
  setChosenLoTypes,
}: {
  chosenLoTypes: LoType[];
  setChosenLoTypes: React.Dispatch<React.SetStateAction<LoType[]>>;
}) => {
  const selectAllKey = 'Select All';
  const isAllSelected = chosenLoTypes.length === ALL_LO_TYPES.length;

  const handleLoTypesChange = (_e: any, newValue: LoTypeWithSelectAll[]) => {
    if (newValue.includes(selectAllKey)) {
      setChosenLoTypes(isAllSelected ? [] : [...ALL_LO_TYPES]);
    } else {
      setChosenLoTypes(newValue as LoType[]);
    }
  };

  return (
    <FormControl fullWidth sx={{ flex: 1, minWidth: '200px' }}>
      <Autocomplete
        multiple
        limitTags={2}
        value={chosenLoTypes}
        onChange={handleLoTypesChange}
        options={[selectAllKey, ...ALL_LO_TYPES]} // Add "Select All" as the first option
        disableCloseOnSelect
        getOptionLabel={(option) =>
          option === selectAllKey
            ? `${selectAllKey} (${ALL_LO_TYPES.length})`
            : capitalizeFirstLetter(option)
        }
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              checked={option === selectAllKey ? isAllSelected : selected}
              style={{ marginRight: 8 }}
            />
            <ListItemText
              primary={
                option === selectAllKey
                  ? `${selectAllKey} (${ALL_LO_TYPES.length})`
                  : capitalizeFirstLetter(option)
              }
            />
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Learning Object Types" />}
        renderTags={(value: LoType[], getTagProps) =>
          value.map((lo, index) => (
            <Chip
              label={capitalizeFirstLetter(lo)}
              {...getTagProps({ index })}
              key={index}
              sx={{ bgcolor: '#fbe9e7' }}
            />
          ))
        }
      />
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
  const selectAllKey = 'Select All';
  const archiveKeys = Object.keys(uniqueArchivesMap);

  const handleArchiveChange = (_e: any, newValue: string[]) => {
    if (newValue.includes(selectAllKey)) {
      if (newValue.length === archiveKeys.length + 1) {
        setChosenArchivesMap([]);
      } else {
        setChosenArchivesMap(
          archiveKeys.map((archive) => ({
            archive,
            archiveUrl: uniqueArchivesMap[archive],
          }))
        );
      }
    } else {
      setChosenArchivesMap(
        newValue.map((archive) => ({
          archive,
          archiveUrl: uniqueArchivesMap[archive],
        }))
      );
    }
  };

  return (
    <FormControl fullWidth sx={{ flex: 1, minWidth: '250px' }}>
      <Autocomplete
        multiple
        limitTags={5}
        value={chosenArchivesMap.map((item) => item.archive)}
        options={archiveKeys.length > 0 ? [selectAllKey, ...archiveKeys] : archiveKeys}
        onChange={handleArchiveChange}
        getOptionLabel={(option) =>
          option === selectAllKey ? `${selectAllKey} (${archiveKeys.length})` : option
        }
        renderOption={(props, option, { selected }) => {
          const isAllSelected =
            chosenArchivesMap.length === archiveKeys.length && archiveKeys.length > 0;
          const uri = uniqueArchivesMap[option] || '';
          const { icon } = getUrlInfo(uri) || {};
          return (
            <li {...props}>
              <Checkbox
                checked={option === selectAllKey ? isAllSelected : selected}
                style={{ marginRight: 8 }}
              />
              <ListItemText
                primary={
                  option === selectAllKey ? `${selectAllKey} (${archiveKeys.length})` : option
                }
              />
              {icon}
            </li>
          );
        }}
        renderTags={(value, getTagProps) =>
          value.map((selectedOption, index) => {
            const uri = uniqueArchivesMap[selectedOption] || '';
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
                sx={{ backgroundColor: '#b3e5fc' }}
              />
            );
          })
        }
        renderInput={(params) => <TextField {...params} label="Archives" />}
        disableCloseOnSelect
        fullWidth
      />
    </FormControl>
  );
}

type AllLoRelationTypesWithSelectAll = 'Select All' | AllLoRelationTypes;
const RelationWithLOSelect = ({
  chosenConcepts,
  chosenRelations,
  setChosenRelations,
}: {
  chosenConcepts: string[];
  chosenRelations: AllLoRelationTypes[];
  setChosenRelations: React.Dispatch<React.SetStateAction<AllLoRelationTypes[]>>;
}) => {
  const selectAllKey = 'Select All';
  const isAllSelected = chosenRelations.length === ALL_LO_RELATION_TYPES.length;

  const handleRelationChange = (_e: any, newValue: AllLoRelationTypesWithSelectAll[]) => {
    if (newValue.includes(selectAllKey)) {
      setChosenRelations(isAllSelected ? [] : [...ALL_LO_RELATION_TYPES]);
    } else {
      setChosenRelations(newValue as AllLoRelationTypes[]);
    }
  };

  const selectAllLabel = `${selectAllKey} (${ALL_LO_RELATION_TYPES.length})`;

  return (
    <Tooltip title={chosenConcepts.length === 0 ? 'Please choose a concept first' : ''}>
      <FormControl fullWidth sx={{ flex: 1, minWidth: '200px' }}>
        <Autocomplete
          multiple
          limitTags={1}
          value={chosenRelations}
          onChange={handleRelationChange}
          disableCloseOnSelect
          options={[selectAllKey, ...ALL_LO_RELATION_TYPES]}
          renderInput={(params) => <TextField {...params} label="Relation with Learning Object" />}
          renderOption={(props, option, { selected }) => {
            return (
              <li {...props}>
                <Checkbox checked={option === selectAllKey ? isAllSelected : selected} />
                <ListItemText
                  primary={option === selectAllKey ? selectAllLabel : capitalizeFirstLetter(option)}
                />
              </li>
            );
          }}
          renderTags={(value: AllLoRelationTypes[], getTagProps) =>
            value.map((relation, index) => (
              <Chip
                label={capitalizeFirstLetter(relation)}
                {...getTagProps({ index })}
                key={index}
                sx={{ backgroundColor: '#E6E6FA' }}
              />
            ))
          }
          disabled={chosenConcepts.length === 0}
        />
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

export async function fetchLoFromConceptsAsLoRelations(
  mmtUrl: string,
  concepts: string[],
  relations: AllLoRelationTypes[],
  loString?: string,
  loTypes?: LoType[]
): Promise<Record<LoType, string[]>> {
  if (!concepts?.length && (!loString || !loString.trim())) return;
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
      loTypes,
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
      loTypes,
      loString
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
  setLoUris,
}: {
  uniqueArchivesMap: Record<string, string>;
  chosenArchivesMap: ArchiveMap[];
  setChosenArchivesMap: React.Dispatch<React.SetStateAction<ArchiveMap[]>>;
  chosenRelations: AllLoRelationTypes[];
  setChosenRelations: React.Dispatch<React.SetStateAction<AllLoRelationTypes[]>>;
  chosenLoTypes: LoType[];
  setChosenLoTypes: React.Dispatch<React.SetStateAction<LoType[]>>;
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
  );
};

export default LoFilterAndSearch;
