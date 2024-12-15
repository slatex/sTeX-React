import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { alpha, Box, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { getLearningObjectShtml, LoType } from '@stex-react/api';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { extractProjectIdAndFilepath } from 'packages/stex-react-renderer/src/lib/utils';
import { PracticeQuestions } from 'packages/stex-react-renderer/src/lib/PracticeQuestions';
import { capitalizeFirstLetter } from '@stex-react/utils';
import { memo, useContext, useEffect, useState } from 'react';
import { getUrlInfo } from '../pages/lo-explorer';
import LoRelations from './LoRelations';
import { CartItem } from './LoCartModal';

export const handleStexCopy = (uri: string, uriType: LoType) => {
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

  const fetchLo = async (uri: string) => {
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
    if (uri) fetchLo(uri);
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
        <Typography>No {uriType} found.</Typography>
      )}
    </Box>
  );
};

interface DetailsPanelProps {
  uriType: LoType;
  selectedUri: string | null;
}
export const DetailsPanel: React.FC<DetailsPanelProps> = memo(({ uriType, selectedUri }) => {
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
      <LoRelations uri={selectedUri} />
      {!!selectedUri &&
        (uriType === 'problem' ? (
          <PracticeQuestions problemIds={[selectedUri]} />
        ) : (
          <LoViewer uri={selectedUri} uriType={uriType} />
        ))}
    </Box>
  );
});
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
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      <DetailsPanel uriType={loType} selectedUri={selectedUri} />
    </Box>
  );
};

export default LoListDisplay;
