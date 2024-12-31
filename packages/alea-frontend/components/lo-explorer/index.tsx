import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  createFilterOptions,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
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
import { capitalizeFirstLetter, localStore, PRIMARY_COL } from '@stex-react/utils';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import styles from '../../styles/lo-explorer.module.scss';
import LoListDisplay, { getUrlInfo } from '../LoListDisplay';
import { CourseConceptsDialog } from './CourseConceptDialog';
import LoCartModal, { CartItem } from './LoCartModal';

let cachedConceptsList: Record<string, string> | null = null;

const ALL_CONCEPT_MODES = [
  'Appears Anywhere',
  'Annotated as Prerequisite',
  'Annotated as Objective',
] as const;

export type ConceptMode = (typeof ALL_CONCEPT_MODES)[number];

const renderDropdownLabel = (selected: string[]) => {
  if (!selected.length) return '';
  const firstTwo = selected.slice(0, 2).map(capitalizeFirstLetter).join(', ');
  return selected.length > 2 ? firstTwo + '...' : firstTwo;
};

type FilterName = 'Mode' | 'LO' | 'Archive' | 'Relations';
const FilterChipList = ({
  label,
  items,
  setItems,
}: {
  label: FilterName;
  items: string[];
  setItems: any;
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

function ArchivesAutocomplete({
  uniqueArchives,
  uniqueArchiveUris,
  chosenArchives,
  setChosenArchives,
}: {
  uniqueArchives: string[];
  uniqueArchiveUris: string[];
  chosenArchives: string[];
  setChosenArchives: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const handleArchiveChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: string[]) => {
    setChosenArchives(newValue);
  };

  return (
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
  );
}

const getFilteredUris = (
  loType: LoType,
  loUris: Record<LoType, string[]>,
  chosenArchives: string[]
): string[] => {
  const uris = loUris[loType] || [];
  if (chosenArchives.length > 0) {
    return uris.filter((uri) => {
      const { projectName } = getUrlInfo(uri);
      return chosenArchives.some((archive) => archive.toLowerCase() === projectName?.toLowerCase());
    });
  }
  return uris;
};

export function LoExplorer() {
  const [searchString, setSearchString] = useState('');
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
  const filteredUris = useMemo(() => {
    return getFilteredUris(selectedLo, loUris, chosenArchives);
  }, [selectedLo, loUris, chosenArchives]);

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
      counts[loType] = getFilteredUris(loType, loUris, chosenArchives).length;
    });
    setFilteredCounts(counts);
  }, [loUris, chosenArchives]);

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
        searchString
      );
      setLoUris(loUris);
    } catch (error) {
      console.error('Error fetching learning objects:', error);
      alert('Failed to fetch learning objects. Please try again.');
    } finally {
      setIsSearching(false);
    }
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

  return (
    <Box className={styles.outerBox}>
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
            '&:hover': { bgcolor: '#f1f1f1', color: PRIMARY_COL },
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
              <ArchivesAutocomplete
                uniqueArchiveUris={uniqueArchiveUris}
                uniqueArchives={uniqueArchives}
                chosenArchives={chosenArchives}
                setChosenArchives={setChosenArchives}
              />
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
        </Box>
      </Box>
      {(!!chosenRelations.length || !!chosenLoTypes.length || !!chosenArchives.length) && (
        <Box className={styles.filterChipListBox}>
          <FilterChipList label="Relations" items={chosenRelations} setItems={setChosenRelations} />
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

      <LoCartModal
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        handleRemoveFromCart={handleRemoveFromCart}
      />
    </Box>
  );
}
