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
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ALL_LO_TYPES, LoType, sparqlQuery } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { capitalizeFirstLetter, localStore, PRIMARY_COL } from '@stex-react/utils';
import { extractProjectIdAndFilepath } from 'packages/stex-react-renderer/src/lib/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoListDisplay from '../components/LoListDisplay';
import LoCartModal, { CartItem } from '../components/LoCartModal';
import MainLayout from '../layouts/MainLayout';

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

async function fetchLearningObjects(mmtUrl: string, concept: string) {
  if (!concept.trim()) return;

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ulo: <http://mathhub.info/ulo#>

    SELECT DISTINCT ?learningObject ?type
    WHERE {
      ?learningObject rdf:type ?type .
      FILTER(?type IN (ulo:definition, ulo:problem, ulo:example, ulo:para, ulo:statement)).
      FILTER(CONTAINS(STR(?learningObject), "${concept}")).
    }`;
  const response = await sparqlQuery(mmtUrl, query);
  const bindings = response.results.bindings;
  const learningObjectsByType: Record<LoType, string[]> = {
    definition: [],
    problem: [],
    example: [],
    para: [],
    statement: [],
  };
  bindings.forEach(({ learningObject, type }) => {
    const lastIndex = type.value.lastIndexOf('#');
    const typeKey = type.value.slice(lastIndex + 1) as LoType;
    if (!ALL_LO_TYPES.includes(typeKey)) {
      console.error(`Unknown learning object type: ${typeKey}`);
      return;
    }
    learningObjectsByType[typeKey].push(learningObject.value);
  });
  return learningObjectsByType;
}

const LoExplorerPage = () => {
  const [concept, setConcept] = useState('');
  const [chosenModes, setChosenModes] = useState<ConceptMode[]>([]);
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
  const [filteredUris, setFilteredUris] = useState<string[]>(loUris[selectedLo] || []);
  const [uniqueArchives, setUniqueArchives] = useState<string[]>([]);
  const [uniqueArchiveUris, setUniqueArchiveUris] = useState<string[]>([]);
  const [filteredCounts, setFilteredCounts] = useState<Record<LoType, number>>({
    definition: 0,
    problem: 0,
    example: 0,
    para: 0,
    statement: 0,
  });
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
    if (!concept.trim()) {
      alert('Please enter a concept!');
      return;
    }
    try {
      setIsSearching(true);
      setLoUris(await fetchLearningObjects(mmtUrl, concept));
    } catch (error) {
      console.error('Error fetching learning objects:', error);
      alert('Failed to fetch learning objects. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = (uri, uriType) => {
    const uriWithTypeObj = { uri, uriType };
    const existsInCart = cart.some((item) => item.uri === uri && item.uriType === uriType);
    if (!existsInCart) {
      setCart((prev) => [...prev, uriWithTypeObj]);
    }
  };
  const handleRemoveFromCart = (uri: string, uriType: string) => {
    setCart((prev) => prev.filter((item) => !(item.uri === uri && item.uriType === uriType)));
  };

  const handleSelectionChange = (event: any, newValue: string[]) => {
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
            <Box></Box>
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
              <TextField
                fullWidth
                sx={{ flex: '1 1 200px' }}
                label="Enter Concept"
                variant="outlined"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button
                variant="contained"
                sx={{ flex: '0.25 1 100px', height: '55px' }}
                disabled={isSearching || !concept.trim()}
                onClick={handleSubmit}
              >
                {isSearching && <CircularProgress size={20} sx={{ mr: 1 }} />}Search
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '16px',
                width: '100%',
              }}
            >
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel id="concept-mode-label">Concept Modes</InputLabel>
                <Select
                  labelId="concept-mode-label"
                  label="Concept Modes"
                  multiple
                  variant="outlined"
                  value={chosenModes}
                  onChange={(e) => setChosenModes(e.target.value as ConceptMode[])}
                  renderValue={() => renderDropdownLabel(chosenModes)}
                >
                  {ALL_CONCEPT_MODES.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      <Checkbox checked={chosenModes.includes(mode)} />
                      <ListItemText primary={mode} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ flex: 1 }}>
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

              <Autocomplete
                multiple
                options={uniqueArchives}
                value={chosenArchives}
                limitTags={1}
                onChange={handleSelectionChange}
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
            </Box>
          </Box>
          {(!!chosenModes.length || !!chosenLoTypes.length || !!chosenArchives.length) && (
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
              <FilterChipList label="Mode" items={chosenModes} setItems={setChosenModes} />
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
