import { Book, MicExternalOn, Quiz, SupervisedUserCircle } from '@mui/icons-material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import SchoolIcon from '@mui/icons-material/School';
import { alpha, Box, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { getLearningObjectShtml, LoType } from '@stex-react/api';
import {
  PracticeQuestions,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { capitalizeFirstLetter, extractProjectIdAndFilepath } from '@stex-react/utils';
import { memo, useContext, useEffect, useState } from 'react';
import { CartItem } from './lo-explorer/LoCartModal';
import LoRelations from './lo-explorer/LoRelations';
import { LoReverseRelations } from './lo-explorer/LoReverseRelation';

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

export const handleStexCopy = (uri: string, uriType: LoType) => {
  const [archive, filePath] = extractProjectIdAndFilepath(uri, '');
  let stexSource = '';
  switch (uriType) {
    case 'problem':
      stexSource = `\\includeproblem[pts=TODO,archive=${archive}]{${filePath}}`;
      break;
    case 'definition':
    case 'example':
    case 'para':
    case 'statement':
      stexSource = `\\include${uriType}[archive=${archive}]{${filePath}}`;
      break;
    default:
      break;
  }

  if (stexSource) navigator.clipboard.writeText(stexSource);
};

export function UrlNameExtractor({ url }: { url: string }) {
  const { projectName, topic, fileName, icon } = getUrlInfo(url);
  if (!projectName) {
    return <Box>{url}</Box>;
  }
  return (
    <Box display="flex" flexWrap="wrap" sx={{ gap: '5px' }}>
      {projectName}
      {icon && icon}
      {topic}
      <Box sx={{ wordBreak: 'break-word' }}>{fileName}</Box>
    </Box>
  );
}

export const LoViewer: React.FC<{ uri: string; uriType: LoType }> = ({ uri, uriType }) => {
  const [learningObject, setLearningObject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    if (!uri?.length) return;
    async function fetchLo() {
      try {
        setLoading(true);
        setError(null);
        const learningObject = await getLearningObjectShtml(mmtUrl, uri);

        setLearningObject(learningObject.replace(/body/g, 'div').replace(/html/g, 'div'));
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch example.');
        setLoading(false);
      }
    }
    fetchLo();
  }, [uri, mmtUrl]);

  return (
    <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f9f9f9' }}>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : learningObject ? (
        //mmtHTMLToReact(learningObject)
        <Typography>TODO ALEA4-L1</Typography>
      ) : (
        <Typography>No {uriType} found.</Typography>
      )}
    </Box>
  );
};

interface DetailsPanelProps {
  uriType: LoType;
  selectedUri: string | null;
  displayReverseRelation?: (conceptUri: string) => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = memo(
  ({ uriType, selectedUri, displayReverseRelation }) => {
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
        <LoRelations uri={selectedUri} displayReverseRelation={displayReverseRelation} />
        {!!selectedUri &&
          (uriType === 'problem' ? (
            <PracticeQuestions problemIds={[selectedUri]} />
          ) : (
            <LoViewer uri={selectedUri} uriType={uriType} />
          ))}
      </Box>
    );
  }
);
DetailsPanel.displayName = 'DetailsPanel';

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
  const { mmtUrl } = useContext(ServerLinksContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showReverseRelation, setShowReverseRelation] = useState(false);
  const [reverseRelationConcept, setReverseRelationConcept] = useState<string>('');
  const displayReverseRelation = (conceptUri: string) => {
    setShowReverseRelation((prevState) => !prevState);
    setReverseRelationConcept(conceptUri);
  };

  const filteredUris = uris.filter((uri) => {
    const { projectName, topic, fileName } = getUrlInfo(uri);
    const searchTerms = searchQuery.toLowerCase().split(/\s+/);
    return searchTerms.every(
      (term) =>
        projectName.toLowerCase().includes(term) ||
        topic.toLowerCase().includes(term) ||
        fileName.toLowerCase().includes(term)
    );
  });
  return (
    <Box sx={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
      {showReverseRelation && (
        <LoReverseRelations
          mmtUrl={mmtUrl}
          concept={reverseRelationConcept}
          cart={cart}
          handleAddToCart={handleAddToCart}
          handleRemoveFromCart={handleRemoveFromCart}
          openDialog={showReverseRelation}
          handleCloseDialog={() => setShowReverseRelation(false)}
        />
      )}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          <Typography variant="h6" color="primary">
            {filteredUris.length} {capitalizeFirstLetter(loType)}s
          </Typography>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            sx={{
              minWidth: '150px',
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        {filteredUris.map((uri, index) => {
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
              <Tooltip title={uri} arrow placement="right-start">
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
                  }}
                  onClick={() => setSelectedUri(uri)}
                >
                  <UrlNameExtractor url={uri} />
                </Typography>
              </Tooltip>

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
      <DetailsPanel
        uriType={loType}
        selectedUri={selectedUri}
        displayReverseRelation={displayReverseRelation}
      />
    </Box>
  );
};

export default LoListDisplay;
