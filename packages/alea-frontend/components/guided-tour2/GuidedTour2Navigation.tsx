import { CheckCircleOutline } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { conceptUriToName } from '@stex-react/api';
import { FixedPositionMenu } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL } from '@stex-react/utils';
import { ChatMessage, GuidedTourState, systemTextMessage } from '../../pages/guided-tour2/[id]';

export const findNextAvailableIndex = (
  currentIndex: number,
  leafConceptUris: string[],
  completedConceptUris: string[]
): number => {
  const completedSet = new Set(completedConceptUris);
  for (let i = 0; i < leafConceptUris.length; i++) {
    const idx = (currentIndex + i) % leafConceptUris.length;
    if (!completedSet.has(leafConceptUris[idx])) return idx;
  }
  return -1;
};

function LeafConceptDisplay({
  conceptUri,
  index,
  isButtonDisabled,
  tourState,
  onSelect,
  setMessages,
}: {
  conceptUri: string;
  index: number;
  isButtonDisabled: boolean;
  tourState: GuidedTourState;
  onSelect?: (idx: number, tourState: GuidedTourState) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}) {
  const isCompleted = tourState.completedConceptUris.includes(conceptUri);
  const isSelected = tourState.leafConceptUris[tourState.focusConceptIdx] === conceptUri;

  const backgroundColor = isSelected ? '#176ed1' : isCompleted ? '#b1dbfa' : '#F1F3F4';
  const textColor = isSelected ? 'white' : '#0D47A1';

  const handleMarkAsKnown = async (uri: string, index: number) => {
    const updatedTourState = {
      ...tourState,
      completedConceptUris: [...new Set([...tourState.completedConceptUris, uri])], // Ensure uniqueness
    };
    const nextAvailableIndex = findNextAvailableIndex(
      index,
      updatedTourState.leafConceptUris,
      updatedTourState.completedConceptUris
    );

    const conceptName = conceptUriToName(uri);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        from: 'user',
        type: 'text',
        text: `I know  <b style="color: #d629ce">${conceptName}</b> `,
      },
      systemTextMessage(
        `<b style="color:#8e24aa">Noted! You've marked  <b style="color: #d629ce">${conceptName}</b> as known.</b>`
      ),
    ]);
    await onSelect(nextAvailableIndex, updatedTourState);
  };

  const handleRevisit = async (uri: string, index: number) => {
    const updatedTourState = {
      ...tourState,
      completedConceptUris: tourState.completedConceptUris.filter(
        (completedUri) => completedUri !== uri
      ),
    };
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        from: 'user',
        type: 'text',
        text: `Take another look at  <b style="color: #d629ce">${conceptUriToName(uri)}</b> `,
      },
      systemTextMessage(
        `<b style="color:#8e24aa">Got it! Diving deep into ${conceptUriToName(uri)}. </b>`
      ),
    ]);
    await onSelect(index, updatedTourState);
  };

  async function handleSelect(index: number) {
    const targetConceptName = conceptUriToName(conceptUri);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        from: 'user',
        type: 'text',
        text: `Navigate to concept  <b style="color: #d629ce">${targetConceptName}</b> `,
      },
      systemTextMessage('<b style="color:#8e24aa">Navigating...</b>'),
    ]);

    await onSelect(index, tourState);
  }

  return (
    <Box
      p={1.5}
      m={[0, 1]}
      sx={{
        cursor: isCompleted || isButtonDisabled ? 'not-allowed' : 'pointer',
        borderRadius: '8px',
        backgroundColor,
        color: textColor,
        ':hover': !isCompleted && {
          backgroundColor: isSelected ? '#3789e6' : '#c7cbd1',
          transition: 'background-color 0.3s ease',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isButtonDisabled ? 0.6 : 1,
      }}
      onClick={() => {
        if (!isCompleted && !isButtonDisabled) {
          handleSelect(index);
        }
      }}
    >
      <Typography variant="body1" sx={{ flexGrow: 1 }}>
        {conceptUriToName(conceptUri)}
      </Typography>

      {!isCompleted && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleMarkAsKnown(conceptUri, index);
          }}
          disabled={isButtonDisabled}
          sx={{ ml: 1, bgcolor: 'white' }}
        >
          <Tooltip title={'Mark as I know'}>
            <CheckCircleOutline />
          </Tooltip>
        </IconButton>
      )}

      {isCompleted && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            sx={{ '&.Mui-disabled': { backgroundColor: 'rgba(255, 255, 255, 0.5)' } }}
            disabled
          >
            <CheckCircleOutline sx={{ color: 'green' }} />
          </IconButton>

          <IconButton
            onClick={(e) => {
              if (isButtonDisabled) return;
              e.stopPropagation();
              handleRevisit(conceptUri, index);
            }}
            disabled={isButtonDisabled}
            sx={{ marginLeft: 1, bgcolor: 'white' }}
          >
            <Tooltip title={'Revisit'}>
              <ReplayIcon />
            </Tooltip>
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

export function GuidedTour2Navigation({
  isButtonDisabled,
  tourState,
  onClose,
  onSelect,
  setMessages,
}: {
  isButtonDisabled: boolean;
  tourState: GuidedTourState;
  onClose: () => void;
  onSelect?: (idx: number, tourState: GuidedTourState) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}) {
  return (
    <FixedPositionMenu
      staticContent={
        <Box display="flex" alignItems="center">
          <IconButton sx={{ m: '2px' }} onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color={PRIMARY_COL}>
            {' '}
            Leaf Concepts list
          </Typography>
        </Box>
      }
    >
      {tourState.leafConceptUris.map((item, index) => (
        <LeafConceptDisplay
          key={item}
          conceptUri={item}
          index={index}
          isButtonDisabled={isButtonDisabled}
          tourState={tourState}
          onSelect={onSelect}
          setMessages={setMessages}
        />
      ))}
      ;
    </FixedPositionMenu>
  );
}
