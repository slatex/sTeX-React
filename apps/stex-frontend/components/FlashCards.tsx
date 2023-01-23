import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { BloomDimension } from '@stex-react/api';
import {
  ContentFromUrl,
  ContentWithHighlight,
  SelfAssessment2,
} from '@stex-react/stex-react-renderer';
import { getChildrenOfBodyNode, localStore } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import styles from '../styles/flash-card.module.scss';

enum CardType {
  ITEM_CARD,
  SUMMARY_CARD,
}

export enum FlashCardMode {
  REVISION_MODE,
  DRILL_MODE,
}

function isDrill(mode: FlashCardMode) {
  return mode === FlashCardMode.DRILL_MODE;
}

export interface FlashCardItem {
  uri: string;
  htmlNode: string;
}

export function FlashCardFooter({
  uri,
  htmlNode,
  onNext,
  onFlip,
}: {
  uri: string;
  htmlNode: string;
  onNext: (skipped: boolean, remembered: boolean) => void;
  onFlip: () => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      alignItems="center"
      margin="5px 15px"
    >
      <SelfAssessment2
        dims={[BloomDimension.Remember, BloomDimension.Understand]}
        uri={uri}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        px="15px"
        boxSizing="border-box"
      >
        <Box width="78px">&nbsp;</Box>
        <IconButton onClick={onFlip} color="primary">
          <Tooltip title="Flip the card!">
            <FlipCameraAndroidIcon
              fontSize="large"
              sx={{ transform: 'rotateX(30deg)' }}
            />
          </Tooltip>
        </IconButton>
        <Box minWidth="72px">
          <Button
            onClick={() => onNext(false, false)}
            size="small"
            variant="contained"
          >
            Next
            <NavigateNextIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function FlashCardFront({
  uri,
  htmlNode,
  mode,
  onNext,
  onFlip,
}: {
  uri: string;
  htmlNode: string;
  mode: FlashCardMode;
  onNext: (skipped: boolean, remembered: boolean) => void;
  onFlip: () => void;
}) {
  return (
    <Box className={styles['front']}>
      &nbsp;
      <Box
        sx={{
          width: 'max-content',
          m: '0 auto',
          '& *': { fontSize: '32px !important' },
        }}
      >
        <ContentWithHighlight mmtHtml={htmlNode} />
      </Box>
      <FlashCardFooter
        uri={uri}
        htmlNode={htmlNode}
        onFlip={onFlip}
        onNext={onNext}
      />
    </Box>
  );
}

function FlashCardBack({
  uri,
  mode,
  htmlNode,
  onNext,
  onFlip,
}: {
  uri: string;
  mode: FlashCardMode;
  htmlNode: string;
  onNext: (skipped: boolean, remembered: boolean) => void;
  onFlip: () => void;
}) {
  return (
    <Box className={styles['back']}>
      <Box
        sx={{
          overflowY: 'auto',
          maxWidth: '100%',
          m: '10px 5px 0',
          '& *': { fontSize: 'large !important' },
        }}
      >
        <ContentFromUrl
          url={`/:sTeX/fragment?${uri}`}
          modifyRendered={getChildrenOfBodyNode}
        />
      </Box>

      <FlashCardFooter
        uri={uri}
        htmlNode={htmlNode}
        onFlip={onFlip}
        onNext={onNext}
      />
    </Box>
  );
}

function FlashCard({
  uri,
  htmlNode,
  mode,
  defaultFlipped,
  onNext,
}: {
  uri: string;
  htmlNode: string;
  mode: FlashCardMode;
  defaultFlipped: boolean;
  onNext: (skipped: boolean, remembered: boolean) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(defaultFlipped);
  useEffect(() => {
    setIsFlipped(defaultFlipped);
  }, [uri]);

  useEffect(() => {
    const handleFlip = (event: KeyboardEvent) => {
      if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
        console.log(event.code);
        setIsFlipped((prev) => !prev);
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleFlip, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleFlip, { capture: true });
    };
  }, []);

  return (
    <Box
      display="flex"
      margin="0 5px"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
      <Box
        display="flex"
        width="420px"
        height="700px"
        maxHeight="calc(100vh - 90px)"
        margin="auto"
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <Box
            className={`${styles['card-container']} ${
              isFlipped ? styles['flipped'] : ''
            }`}
          >
            <FlashCardFront
              uri={uri}
              htmlNode={htmlNode}
              onFlip={() => setIsFlipped(true)}
              mode={mode}
              onNext={onNext}
            />
            <FlashCardBack
              uri={uri}
              htmlNode={htmlNode}
              mode={mode}
              onNext={onNext}
              onFlip={() => setIsFlipped(false)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function SummaryCard({
  rememberedItems,
  skippedItems,
  flippedItems,
  onFinish,
}: {
  rememberedItems: FlashCardItem[];
  skippedItems: FlashCardItem[];
  flippedItems: FlashCardItem[];
  onFinish: () => void;
}) {
  return (
    <Card>
      <CardContent sx={{ mx: '10px' }}>
        <Box>
          You remembered {rememberedItems.length} concepts, skipped{' '}
          {skippedItems.length} and flipped {flippedItems.length} cards.
          <br />
          <Button variant="contained" onClick={() => onFinish()}>
            <ArrowBackIcon />
            &nbsp;Go Back
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export function FlashCards({
  items,
  mode,
  onCancelOrFinish,
}: {
  mode: FlashCardMode;
  items: FlashCardItem[];
  onCancelOrFinish: () => void;
}) {
  const [cardType, setCardType] = useState(CardType.ITEM_CARD);

  const [cardNo, setCardNo] = useState(0);

  const [rememberedItems, setRememberedItems] = useState<FlashCardItem[]>([]);
  const [skippedItems, setSkippedItems] = useState<FlashCardItem[]>([]);
  const [flippedItems, setFlippedItems] = useState<FlashCardItem[]>([]);
  const [defaultFlipped, setDefaultSkipped] = useState(
    !!localStore?.getItem('default-flipped')
  );

  useEffect(() => {
    setRememberedItems([]);
    setSkippedItems([]);
    setFlippedItems([]);
  }, [items]);

  const currentItem = items[cardNo];

  useEffect(() => {
    if (
      mode !== FlashCardMode.REVISION_MODE ||
      cardType !== CardType.ITEM_CARD
    ) {
      return;
    }
    const handlePrevAndNext = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        setCardNo((prev) => (prev + items.length - 1) % items.length);
      }
      if (event.code === 'ArrowRight') {
        setCardNo((prev) => (prev + 1) % items.length);
      }
    };

    window.addEventListener('keydown', handlePrevAndNext);

    return () => {
      window.removeEventListener('keydown', handlePrevAndNext);
    };
  }, [cardType, mode]);

  if (cardType === CardType.SUMMARY_CARD) {
    return (
      <SummaryCard
        rememberedItems={rememberedItems}
        skippedItems={skippedItems}
        flippedItems={flippedItems}
        onFinish={() => onCancelOrFinish()}
      />
    );
  }
  return (
    <Box display="flex" flexDirection="column">
      <Box mb="10px" display="flex" justifyContent="space-between">
        <IconButton
          onClick={() => {
            const confirmExit = 'Are you sure you want to leave the drill?';
            if (!isDrill(mode) || confirm(confirmExit)) onCancelOrFinish();
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        {!isDrill(mode) ? (
          <Box>
            <IconButton
              onClick={() =>
                setCardNo((prev) => (prev + items.length - 1) % items.length)
              }
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              onClick={() => setCardNo((prev) => (prev + 1) % items.length)}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        ) : null}
        <Box sx={{ m: '10px 20px', color: '#333', minWidth: '60px' }}>
          <b style={{ fontSize: '18px' }}>
            {cardNo + 1} of {items.length}
          </b>
        </Box>
      </Box>
      <FlashCard
        uri={currentItem.uri}
        htmlNode={currentItem.htmlNode}
        mode={mode}
        defaultFlipped={defaultFlipped && mode === FlashCardMode.REVISION_MODE}
        onNext={(skipped: boolean, remembered: boolean) => {
          if (cardNo >= items.length - 1) {
            setCardType(CardType.SUMMARY_CARD);
          }
          if (skipped) {
            skippedItems.push(currentItem);
          } else if (remembered) {
            rememberedItems.push(currentItem);
          } else {
            flippedItems.push(currentItem);
          }

          setCardNo((prev) => prev + 1);
        }}
      />

      {mode === FlashCardMode.REVISION_MODE && (
        <FormControlLabel
          control={
            <Checkbox
              checked={defaultFlipped}
              onChange={(e) => {
                const v = e.target.checked;
                if (v) localStore?.setItem('default-flipped', '1');
                else localStore?.removeItem('default-flipped');
                setDefaultSkipped(v);
              }}
            />
          }
          label="Show backface by default"
          sx={{ m: '5px auto 0' }}
        />
      )}
    </Box>
  );
}
