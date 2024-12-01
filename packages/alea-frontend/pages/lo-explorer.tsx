import { HelpOutline } from '@mui/icons-material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArticleIcon from '@mui/icons-material/Article';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Alert,
  alpha,
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
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ALL_LO_TYPES, getLearningObjectShtml, LoType, sparqlQuery } from '@stex-react/api';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { capitalizeFirstLetter, localStore, PRIMARY_COL } from '@stex-react/utils';
import Image from 'next/image';
import { PracticeQuestions } from 'packages/stex-react-renderer/src/lib/PracticeQuestions';
import { extractProjectIdAndFilepath } from 'packages/stex-react-renderer/src/lib/utils';
import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const handleStexCopy = (uri: string, uriType: LoType) => {
  const [archive, filePath] = extractProjectIdAndFilepath(uri, '');
  let stexSource = '';
  switch (uriType) {
    case 'problem':
      stexSource = `\\includeproblem[pts=TODO,archive=${archive}]{${filePath}}`;
    case 'definition':
    case 'example':
    case 'para':
    case 'statement':
      stexSource = `\\include${uriType}[archive=${archive}]{${filePath}}`;
    default:
  }

  if (stexSource) navigator.clipboard.writeText(stexSource);
};
interface QuizModalProps {
  open: boolean;
  selectedItems: CartItem[];
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ open, onClose, selectedItems }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const generatedQuizContent = useMemo(() => {
    const staticLines = [
      '\\documentclass{article}',
      '\\usepackage[notes,hints]{hwexam} % ,',
      '\\libinput{hwexam-preamble}',
      '\\title{TODO}',
      '\\begin{document}',
      '\\begin{assignment}[title={TODO},number=TODO,given=TODO,due=TODO]',
    ];
    const dynamicLines = selectedItems
      .filter((i) => i.uriType === 'problem')
      .map((item) => {
        const [archive, filePath] = extractProjectIdAndFilepath(item.uri, '');
        return `       \\includeproblem[pts=TODO,archive=${archive}]{${filePath}}`;
      })
      .join('\n');
    const closingLines = ['\\end{assignment}', '\\end{document}'];

    return `${staticLines.join('\n')}\n${dynamicLines}\n${closingLines.join('\n')}`;
  }, [selectedItems]);

  const handleCopyQuiz = () => {
    navigator.clipboard.writeText(generatedQuizContent);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            overflowX: 'auto',
            overflowY: 'auto',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '16px' }}>
            Quiz Content
          </Typography>
          <Box
            sx={{
              background: '#f9f9f9',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px',
              marginBottom: '16px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {generatedQuizContent}
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="contained" onClick={handleCopyQuiz} disabled={!selectedItems?.length}>
              Copy Quiz Content
            </Button>
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Quiz content copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

const IconDisplayComponent: React.FC<{ uriType: LoType }> = ({ uriType }) => {
  switch (uriType) {
    case 'problem':
      return (
        <Image
          src="/practice_problems.svg"
          width={34}
          height={34}
          alt=""
          style={{
            filter:
              'invert(16%) sepia(17%) saturate(3640%) hue-rotate(193deg) brightness(94%) contrast(90%)',
          }}
        />
      );
    case 'definition':
      return <ArticleIcon sx={{ fontSize: '2rem', color: '#00bcd4' }} />;

    case 'example':
      return <DeviceHubIcon sx={{ fontSize: '2rem', color: 'success.light' }} />;

    default:
      return <HelpOutline sx={{ fontSize: '2rem', color: 'error.main' }} />;
  }
};

interface CartItem {
  uri: string;
  uriType: LoType;
}

interface DetailsPanelProps {
  uriType: LoType;
  selectedUri: string | null;
}

const LoViewer: React.FC<{ uri: string; uriType: LoType }> = ({ uri, uriType }) => {
  const [learningObject, setLearningObject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  const fetchLo = async (uri) => {
    try {
      setLoading(true);
      setError(null);
      setLearningObject(await getLearningObjectShtml(mmtUrl, uri));
    } catch (err) {
      setError(err.message || 'Failed to fetch example.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (uri) {
      fetchLo(uri);
    }
  }, [uri]);

  return (
    <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f9f9f9' }}>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : learningObject ? (
        mmtHTMLToReact(learningObject)
      ) : (
        <Typography>No example found.</Typography>
      )}
    </Box>
  );
};

const DetailsPanel: React.FC<DetailsPanelProps> = memo(({ uriType, selectedUri }) => {
  return (
    <Box
      sx={{
        flex: 2,
        background: 'rgba(240, 255, 240, 0.9)',
        borderRadius: '8px',
        padding: '16px',
        height: '90vh',
        overflowY: 'auto',
        boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography color="secondary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        <Tooltip title={selectedUri} arrow placement="top">
          <span style={{ wordBreak: 'break-word' }}>{`${(uriType || '').toUpperCase()}: ${
            selectedUri || 'None'
          }`}</span>
        </Tooltip>
      </Typography>

      {!!selectedUri &&
        (uriType === 'problem' ? (
          <PracticeQuestions problemIds={[selectedUri]} />
        ) : (
          <LoViewer uri={selectedUri} uriType={uriType} />
        ))}
    </Box>
  );
});

interface CartModalProps {
  showCart: boolean;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
  cart: CartItem[];
  handleRemoveFromCart: (uri: string, uriType: string) => void;
}

const renderDropdownLabel = (selected: string[]) => {
  if (!selected.length) return '';
  const firstTwo = selected.slice(0, 2).map(capitalizeFirstLetter).join(', ');
  return selected.length > 2 ? firstTwo + '...' : firstTwo;
};

const CartModal: React.FC<CartModalProps> = ({
  showCart,
  setShowCart,
  cart,
  handleRemoveFromCart,
}) => {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [displayedItem, setDisplayedItem] = useState<CartItem | undefined>(undefined);

  const toggleItemsSelection = (uri: string, uriType: LoType) => {
    setSelectedItems((prevSelected) => {
      const isItemSelected = prevSelected.some(
        (item) => item.uri === uri && item.uriType === uriType
      );

      if (isItemSelected) {
        return prevSelected.filter((item) => !(item.uri === uri && item.uriType === uriType));
      } else {
        return [...prevSelected, { uri, uriType }];
      }
    });
  };

  return (
    <>
      <Dialog open={showCart} onClose={() => setShowCart(false)} maxWidth="xl">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" gap={5} alignItems="center">
            <Typography variant="h6" color="primary" fontWeight="bold">
              Cart Items
            </Typography>

            <Box sx={{ display: 'flex' }}>
              <IconButton onClick={() => setShowCart(false)}>
                <CancelIcon sx={{ color: 'error.main' }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={1}>
            <Box flex="1 1 200px" maxWidth="400px">
              {!cart?.length && <Typography>No items in the cart.</Typography>}
              {(cart || []).map((item, idx) => (
                <Paper
                  key={idx}
                  elevation={2}
                  sx={{
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    cursor: 'pointer',

                    ...(displayedItem?.uri === item.uri && {
                      backgroundColor: 'rgba(200, 225, 255, 0.9)',
                    }),
                  }}
                >
                  <Checkbox
                    checked={selectedItems.some(
                      (selectedItem) =>
                        selectedItem.uri === item.uri && selectedItem.uriType === item.uriType
                    )}
                    disabled={!(item.uriType === 'problem')}
                    onChange={() => toggleItemsSelection(item.uri, item.uriType)}
                    color="primary"
                  />
                  <IconDisplayComponent uriType={item.uriType} />
                  <Typography
                    sx={{
                      ml: '4px',
                      fontWeight: 'normal',
                      fontSize: '0.75rem',
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#1976d2',
                      },
                    }}
                    onClick={() => setDisplayedItem(item)}
                  >
                    <Tooltip title={item.uri} placement="bottom">
                      <>{item.uri}</>
                    </Tooltip>
                  </Typography>

                  <Tooltip title="Copy as STeX" arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleStexCopy(item.uri, item.uriType)}
                      sx={{ mr: '8px' }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    color="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (displayedItem?.uri === item.uri) {
                        setDisplayedItem(undefined);
                        console.log('deleteing');
                      }
                      handleRemoveFromCart(item.uri, item.uriType);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ))}
            </Box>

            {displayedItem && (
              <Box
                sx={{
                  flex: '1 1 200px',
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                }}
              >
                <DetailsPanel uriType={displayedItem.uriType} selectedUri={displayedItem.uri} />
              </Box>
            )}
          </Box>
        </DialogContent>
        {selectedItems.some((i) => i.uriType === 'problem') && (
          <DialogActions>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                sx={{ mt: '16px' }}
                onClick={() => setShowQuizModal(true)}
              >
                Create Quiz
              </Button>
            </Box>
          </DialogActions>
        )}
      </Dialog>

      <QuizModal
        open={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        selectedItems={selectedItems}
      />
    </>
  );
};

const ALL_CONCEPT_MODES = [
  'Appears Anywhere',
  'Annotated as Prerequisite',
  'Annotated as Objective',
] as const;

export type ConceptMode = (typeof ALL_CONCEPT_MODES)[number];
const COURSES = ['AI1', 'AI2'];

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
      : label === 'Course'
      ? '#c8e6c9'
      : 'rgba(224, 224, 224, 0.4)';
  return items.map((item) => (
    <Chip
      key={item}
      label={`${label}: ${item}`}
      onDelete={() => setItems((prev) => prev.filter((v) => v !== item))}
      sx={{ m: 0.5, bgcolor }}
    />
  ));
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

const LoListDisplay = ({
  uris,
  selectedUri,
  cart,
  loType,
  setSelectedUri,
  handleAddToCart,
  handleRemoveFromCart,
}: {
  uris: string[];
  selectedUri: string;
  cart: CartItem[];
  loType: LoType;
  setSelectedUri: React.Dispatch<React.SetStateAction<string>>;
  handleAddToCart: (uri: string, uriType: string) => void;
  handleRemoveFromCart: (uri: string, uriType: string) => void;
}) => {
  return (
    <Box sx={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
      <Box
        sx={{
          flex: 1,
          background: 'rgba(240, 240, 255, 0.9)',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          maxHeight: '90vh',
          boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          color={PRIMARY_COL}
          sx={{ marginBottom: '16px', fontWeight: 'bold' }}
        >
          {uris.length} {capitalizeFirstLetter(loType)}s
        </Typography>
        {uris.map((uri, index) => {
          const isInCart = cart.some((item) => item.uri === uri && item.uriType === loType);
          return (
            <Paper
              key={index}
              elevation={3}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                background: isInCart ? 'rgba(220, 255, 220, 0.9)' : 'white',
                '&:hover': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' },
              }}
            >
              <Typography
                sx={{
                  cursor: 'pointer',
                  flex: 1,
                  wordBreak: 'break-word',
                  color: selectedUri === uri ? '#096dd9' : '#333',
                  fontWeight: selectedUri === uri ? 'bold' : 'normal',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: alpha('#096dd9', 0.7),
                  },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setSelectedUri(uri)}
              >
                <Tooltip title={uri} placement="bottom">
                  <>{uri}</>
                </Tooltip>
              </Typography>

              <Tooltip title="Copy as STeX" arrow>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleStexCopy(uri, loType)}
                  sx={{
                    marginRight: '8px',
                  }}
                  disabled={!(loType === 'problem')}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                color={isInCart ? 'secondary' : 'primary'}
                onClick={() =>
                  isInCart ? handleRemoveFromCart(uri, loType) : handleAddToCart(uri, loType)
                }
              >
                {isInCart ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
              </IconButton>
            </Paper>
          );
        })}
      </Box>
      <DetailsPanel uriType={loType} selectedUri={selectedUri} />
    </Box>
  );
};

const LoExplorerPage = () => {
  const [concept, setConcept] = useState('');
  const [chosenModes, setChosenModes] = useState<ConceptMode[]>([]);
  const [chosenLoTypes, setChosenLoTypes] = useState<LoType[]>([]);
  const [chosenCourses, setChosenCourses] = useState<string[]>([]);
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

  const filteredUris = loUris[selectedLo] || [];

  useEffect(() => {
    const storedCart = JSON.parse(localStore?.getItem('lo-cart')) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStore?.setItem('lo-cart', JSON.stringify(cart));
  }, [cart]);

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
              <FormControl fullWidth>
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

              <FormControl fullWidth>
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

              <FormControl fullWidth>
                <InputLabel id="courses-label">Courses</InputLabel>
                <Select
                  labelId="courses-label"
                  label="Courses"
                  multiple
                  value={chosenCourses}
                  onChange={(e) => setChosenCourses(e.target.value as string[])}
                  renderValue={() => renderDropdownLabel(chosenCourses)}
                >
                  {COURSES.map((item) => (
                    <MenuItem key={item} value={item}>
                      <Checkbox checked={chosenCourses.includes(item)} />
                      <ListItemText primary={item} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          {(!!chosenModes.length || !!chosenLoTypes.length || !!chosenCourses.length) && (
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
              <FilterChipList label="Course" items={chosenCourses} setItems={setChosenCourses} />
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
                {lo} ({loUris[lo]?.length || 0})
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

        <CartModal
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
