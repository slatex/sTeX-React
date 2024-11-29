import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Chip,
  FormControl,
  Checkbox,
  ListItemText,
  Button,
  Paper,
  IconButton,
  Modal,
  alpha,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { PRIMARY_COL } from '@stex-react/utils';
import { sparqlQuery } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';

import { PracticeQuestions } from 'packages/stex-react-renderer/src/lib/PracticeQuestions';
import DefinitionsViewer from '../components/DefinitionsViewer';
import ExamplesViewer from '../components/ExamplesViewer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { extractProjectIdAndFilepath } from 'packages/stex-react-renderer/src/lib/utils';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import Image from 'next/image';
import { HelpOutline } from '@mui/icons-material';
import SplitScreenIcon from '@mui/icons-material/SplitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CancelIcon from '@mui/icons-material/Cancel';

const handleStexCopy = (uri, uriType) => {
  let archive, filePath;
  if (uriType === 'Problem') [archive, filePath] = extractProjectIdAndFilepath(uri, false);
  const collectionString = `\\includeproblem[pts=TODO,archive=${archive}]{${filePath}}`;
  navigator.clipboard.writeText(collectionString);
};
interface QuizModalProps {
  open: boolean;
  selectedItems: CartItem[];
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ open, onClose, selectedItems }) => {
  const [quizCollection, setQuizCollection] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  useEffect(() => {
    const updatedQuizCollection = selectedItems.reduce((collection, item) => {
      if (item.uriType === 'Problem') {
        const [archive, filePath] = extractProjectIdAndFilepath(item.uri, false);

        const collectionString = `\\includeproblem[pts=TODO,archive=${archive}]{${filePath}}`;

        if (!collection.includes(collectionString)) {
          collection.push(collectionString);
        }
      }
      return collection;
    }, []);

    setQuizCollection(updatedQuizCollection);
  }, [selectedItems]);
  const generateQuizContent = () => {
    const staticLines = [
      '\\documentclass{article}',
      '\\usepackage[notes,hints]{hwexam} % ,',
      '\\libinput{hwexam-preamble}',
      '\\title{TODO}',
      '\\begin{document}',
      '\\begin{assignment}[title={TODO},number=TODO,given=TODO,due=TODO]',
    ];
    const dynamicLines = quizCollection.map((line) => `       ${line}`).join('\n');
    const closingLines = ['\\end{assignment}', '\\end{document}'];

    return `${staticLines.join('\n')}\n${dynamicLines}\n${closingLines.join('\n')}`;
  };
  const handleCopyQuiz = () => {
    const quizContent = generateQuizContent();
    navigator.clipboard.writeText(quizContent);
    setSnackbarOpen(true);
  };
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
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
            {quizCollection.length > 0 ? generateQuizContent() : 'No URIs selected for the quiz.'}
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleCopyQuiz}
              disabled={quizCollection.length === 0}
            >
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

type IconDisplayProps = {
  uriType: 'Problem' | 'Definition' | 'Example';
};
const IconDisplayComponent: React.FC<IconDisplayProps> = ({ uriType }) => {
  switch (uriType) {
    case 'Problem':
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
    case 'Definition':
      return <ArticleIcon sx={{ fontSize: '2rem', color: '#00bcd4' }} />;

    case 'Example':
      return <DeviceHubIcon sx={{ fontSize: '2rem', color: 'success.light' }} />;

    default:
      return <HelpOutline sx={{ fontSize: '2rem', color: 'error.main' }} />;
  }
};

interface DetailsPanelProps {
  uriType: string;
  selectedUri: string | null;
}
interface CartItem {
  uri: string;
  uriType: string;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ uriType, selectedUri }) => {
  return (
    <Box
      sx={{
        flex: 2,
        background: 'rgba(240, 255, 240, 0.9)',
        borderRadius: '8px',
        padding: '16px',
        height: '500px',
        overflowY: 'auto',
        boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="primary">
        Details
      </Typography>
      <Typography
        color="secondary"
        variant="subtitle1"
        sx={{
          fontWeight: 'bold',
        }}
      >
        <Tooltip title={selectedUri} arrow placement="top">
          Uri Selected: <span style={{ wordBreak: 'break-word' }}>{selectedUri || 'None'}</span>
        </Tooltip>
      </Typography>

      {uriType === 'Problem' && selectedUri && <PracticeQuestions problemIds={[selectedUri]} />}
      {uriType === 'Definition' && selectedUri && <DefinitionsViewer uris={[selectedUri]} />}
      {uriType === 'Example' && selectedUri && <ExamplesViewer uris={[selectedUri]} />}
    </Box>
  );
};

interface CartModalProps {
  showCart: boolean;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
  cart: CartItem[];
  handleRemoveFromCart: (uri: string, uriType: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({
  showCart,
  setShowCart,
  cart,
  handleRemoveFromCart,
}) => {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [selectedUri, setSelectedUri] = useState('');
  const [selectedUriType, setSelectedUriType] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(true);
  useEffect(() => {
    if (cart.length > 0 && !selectedUri) {
      setSelectedUri(cart[0].uri);
    }
  }, [cart, selectedUri]);

  const toggleItemsSelection = (uri: string, uriType: string) => {
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
      <Modal
        open={showCart}
        onClose={() => setShowCart(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            width: 'auto',
            maxWidth: '70vw',
            maxHeight: '70vh',
            boxShadow: 24,
            overflowX: 'auto',
            overflowY: 'auto',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              width: isFullScreen ? '100%' : '30%',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              <Typography variant="h6" color="primary" fontWeight="bold">
                Cart Items
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, position: 'absolute', right: 16 }}>
                <IconButton
                  onClick={() => setIsFullScreen((prev) => !prev)}
                  disabled={cart.length == 0}
                >
                  {isFullScreen ? <SplitScreenIcon /> : <FullscreenIcon />}
                </IconButton>

                <IconButton onClick={() => setShowCart(false)}>
                  <CancelIcon sx={{ color: 'error.main' }} />
                </IconButton>
              </Box>
            </Box>

            {cart.length > 0 ? (
              cart.map((item, idx) => (
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

                    ...(selectedUri === item.uri && {
                      backgroundColor: 'rgba(200, 225, 255, 0.9)',
                    }),
                  }}
                >
                  <Checkbox
                    checked={selectedItems.some(
                      (selectedItem) =>
                        selectedItem.uri === item.uri && selectedItem.uriType === item.uriType
                    )}
                    disabled={!(item.uriType === 'Problem')}
                    onChange={() => toggleItemsSelection(item.uri, item.uriType)}
                    color="primary"
                  />
                  <IconDisplayComponent
                    uriType={item.uriType as 'Problem' | 'Definition' | 'Example'}
                  />
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
                    onClick={() => {
                      if (isFullScreen) {
                        setIsFullScreen((prev) => !prev);
                      }

                      setSelectedUri(item.uri);
                      setSelectedUriType(item.uriType);
                    }}
                  >
                    <Tooltip title={item.uri} placement="bottom">
                      {item.uri}
                    </Tooltip>
                  </Typography>

                  <Tooltip title="Copy as STeX" arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleStexCopy(item.uri, item.uriType)}
                      sx={{
                        marginRight: '8px',
                      }}
                      disabled={!(item.uriType === 'Problem')}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    color="secondary"
                    size="small"
                    onClick={() => handleRemoveFromCart(item.uri, item.uriType)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ))
            ) : (
              <Typography>No items in the cart.</Typography>
            )}

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                sx={{ marginTop: '16px' }}
                onClick={() => setShowQuizModal(true)}
              >
                Create Quiz
              </Button>
            </Box>
          </Box>

          {selectedUri && !isFullScreen && (
            <Box
              sx={{
                width: '70%',
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <DetailsPanel uriType={selectedUriType} selectedUri={selectedUri} />
            </Box>
          )}
        </Box>
      </Modal>

      <QuizModal
        open={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        selectedItems={selectedItems}
      />
    </>
  );
};
interface LoUris {
  [key: string]: string[];
}
const FilterPage = () => {
  const [concept, setConcept] = useState('');
  const [conceptMode, setConceptMode] = useState<string[]>([]);
  const [learningObject, setLearningObject] = useState<string[]>([]);
  const [course, setCourse] = useState<string[]>([]);
  const [loUris, setLoUris] = useState<LoUris>({});
  const [filteredUris, setFilteredUris] = useState<string[]>([]);
  const [selectedUri, setSelectedUri] = useState('');

  const conceptModes = ['Appears Anywhere', 'Annotated as Prerequisite', 'Annotated as Objective'];
  const learningObjects = ['Example', 'Problem', 'Definition', 'Slides', 'Video Snippets'];
  const courses = ['AI1', 'AI2'];
  const [selectedLO, setSelectedLO] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);

  const fetchLearningObjects = async (concept) => {
    if (!concept.trim()) {
      alert('Please enter a concept!');
      return;
    }
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ulo: <http://mathhub.info/ulo#>

      SELECT DISTINCT ?learningObject ?type
      WHERE {
      ?learningObject rdf:type ?type .
      FILTER(?type IN (ulo:definition, ulo:problem, ulo:example)).
      FILTER(CONTAINS(STR(?learningObject), "${concept}")).
      }`;
    try {
      const response = await sparqlQuery(mmtUrl, query);
      const bindings = response.results.bindings;
      const typeMap = {};
      bindings.forEach(({ learningObject, type }) => {
        const typeKey = type.value.split('#')[1];
        if (!typeMap[typeKey]) {
          typeMap[typeKey] = [];
        }
        typeMap[typeKey].push(learningObject.value);
      });
      console.log({ typeMap });
      setLoUris(typeMap);
    } catch (error) {
      console.error('Error fetching learning objects:', error);
      alert('Failed to fetch learning objects. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedLO === 'Problem' && loUris?.problem?.length > 0) setFilteredUris(loUris.problem);
    else if (selectedLO === 'Example' && loUris?.example?.length > 0)
      setFilteredUris(loUris.example);
    else if (selectedLO === 'Definition' && loUris?.definition?.length > 0)
      setFilteredUris(loUris.definition);
  }, [selectedLO]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const handleClick = () => {
    fetchLearningObjects(concept);
  };
  const renderDropdownLabel = (selected) =>
    selected.length > 0 ? selected.slice(0, 2).join(', ') + (selected.length > 2 ? '...' : '') : '';

  const renderChips = (label, items, setItems) =>
    items.map((item) => (
      <Chip
        key={item}
        label={`${label}: ${item}`}
        onDelete={() => setItems((prev) => prev.filter((i) => i !== item))}
        sx={{
          margin: '4px',
          padding: '4px 8px',
          backgroundColor:
            label === 'Concept Mode'
              ? '#b3e5fc'
              : label === 'Learning Object'
              ? '#fbe9e7'
              : label === 'Course'
              ? '#c8e6c9'
              : 'rgba(224, 224, 224, 0.4)',

          fontSize: '0.875rem',
          borderRadius: '16px',
        }}
      />
    ));

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

  // const handleStexCopy = (uri, uriType) => {
  //   let archive, filePath;
  //   if (uriType === 'Problem') [archive, filePath] = extractProjectIdAndFilepath(uri, false);
  //   const collectionString = `\\includeproblem[pts=TODO,archive=${archive}]{${filePath}}`;
  //   navigator.clipboard.writeText(collectionString);
  // };

  return (
    <MainLayout title="LearningObjects">
      <Paper
        elevation={3}
        sx={{
          margin: '16px',
        }}
      >
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
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
              }}
            >
              Filter Learning Objects
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              onClick={() => setShowCart(true)}
              sx={{
                backgroundColor: 'brown',
                '&:hover': {
                  backgroundColor: '#f1f1f1',
                  color: PRIMARY_COL,
                },
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
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '10px',
                width: '100%',
              }}
            >
              <TextField
                fullWidth
                label="Enter Concept"
                variant="outlined"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
              <Button variant="contained" sx={{ width: '250px' }} onClick={handleClick}>
                Submit
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
                  value={conceptMode}
                  onChange={(e) => setConceptMode(e.target.value as string[])}
                  displayEmpty
                  renderValue={() => renderDropdownLabel(conceptMode)}
                >
                  {conceptModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      <Checkbox checked={conceptMode.includes(mode)} />
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
                  value={learningObject}
                  displayEmpty
                  onChange={(e) => setLearningObject(e.target.value as string[])}
                  renderValue={() => renderDropdownLabel(learningObject)}
                >
                  {learningObjects.map((object) => (
                    <MenuItem key={object} value={object}>
                      <Checkbox checked={learningObject.includes(object)} />
                      <ListItemText primary={object} />
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
                  value={course}
                  onChange={(e) => setCourse(e.target.value as string[])}
                  displayEmpty
                  renderValue={() => renderDropdownLabel(course)}
                >
                  {courses.map((item) => (
                    <MenuItem key={item} value={item}>
                      <Checkbox checked={course.includes(item)} />
                      <ListItemText primary={item} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box
            sx={{
              marginBottom: '20px',
              display: 'flex',
              overflowX: 'auto',
              maxHeight: '40px',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9',
            }}
          >
            {renderChips('Concept Mode', conceptMode, setConceptMode)}
            {renderChips('Learning Object', learningObject, setLearningObject)}
            {renderChips('Course', course, setCourse)}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            {learningObject.map((lo) => (
              <Button
                key={lo}
                variant={selectedLO === lo ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: selectedLO === lo ? 'primary.main' : 'transparent',
                  color: selectedLO === lo ? 'white' : 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                }}
                onClick={() => setSelectedLO(lo)}
              >
                {lo}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <Box
            sx={{
              flex: 1,
              background: 'rgba(240, 240, 255, 0.9)',
              borderRadius: '8px',
              padding: '16px',
              overflowY: 'auto',
              maxHeight: '500px',
              boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="h6"
              color={PRIMARY_COL}
              sx={{ marginBottom: '16px', fontWeight: 'bold' }}
            >
              Filtered URIs
            </Typography>
            {filteredUris.map((uri, index) => {
              const isInCart = cart.some((item) => item.uri === uri && item.uriType === selectedLO);
              console.log({ isInCart });

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
                      {uri}
                    </Tooltip>
                  </Typography>

                  <Tooltip title="Copy as STeX" arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleStexCopy(uri, selectedLO)}
                      sx={{
                        marginRight: '8px',
                      }}
                      disabled={!(selectedLO === 'Problem')}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    color={isInCart ? 'secondary' : 'primary'}
                    onClick={() =>
                      isInCart
                        ? handleRemoveFromCart(uri, selectedLO)
                        : handleAddToCart(uri, selectedLO)
                    }
                  >
                    {isInCart ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                  </IconButton>
                </Paper>
              );
            })}
            <CartModal
              showCart={showCart}
              setShowCart={setShowCart}
              cart={cart}
              handleRemoveFromCart={handleRemoveFromCart}
            />
          </Box>
          <DetailsPanel uriType={selectedLO} selectedUri={selectedUri} />
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default FilterPage;
