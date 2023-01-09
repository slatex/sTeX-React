import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import {
  ContentFromUrl,
  ContentWithHighlight,
} from '@stex-react/stex-react-renderer';
import {
  getChildrenOfBodyNode,
  localStore,
  PRIMARY_COL,
  SECONDARY_COL,
} from '@stex-react/utils';
import { useEffect, useState } from 'react';
import styles from '../styles/flash-card.module.scss';

enum CardType {
  ENTRY_CARD,
  ITEM_CARD,
  SUMMARY_CARD,
}

enum FlashCardMode {
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

function FlashCardFront({
  htmlNode,
  mode,
  onNext,
  onFlip,
}: {
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
      <Box>
        <Box>
          <Button onClick={() => onNext(false, true)} variant="contained">
            I recall, hide&nbsp;
            <VisibilityOffIcon />
          </Button>

          {isDrill(mode) && (
            <Button
              onClick={() => onNext(true, false)}
              variant="contained"
              sx={{ ml: '10px' }}
            >
              Skip
              <NavigateNextIcon />
            </Button>
          )}
        </Box>
        <br />
        <Button
          onClick={onFlip}
          variant="contained"
          sx={{ display: 'block', m: '10px auto' }}
        >
          Flip!
        </Button>
      </Box>
    </Box>
  );
}

function FlashCardBack({
  uri,
  mode,
  onNext,
}: {
  uri: string;
  mode: FlashCardMode;
  onNext: (skipped: boolean, remembered: boolean) => void;
}) {
  return (
    <Box className={styles['back']}>
      <Box sx={{ '& *': { fontSize: 'large !important' } }}>
        <ContentFromUrl
          url={`/:sTeX/fragment?${uri}`}
          modifyRendered={getChildrenOfBodyNode}
        />
      </Box>
      {isDrill(mode) && (
        <Button
          onClick={() => onNext(false, false)}
          size="small"
          variant="contained"
        >
          Next
          <NavigateNextIcon />
        </Button>
      )}
    </Box>
  );
}

function FlashCard({
  uri,
  htmlNode,
  mode,
  onNext,
}: {
  uri: string;
  htmlNode: string;
  mode: FlashCardMode;
  onNext: (skipped: boolean, remembered: boolean) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    setIsFlipped(false);
  }, [uri]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '360px',
        minHeight: '600px',
        margin: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          className={`${styles['card-container']} ${
            isFlipped ? styles['flipped'] : ''
          }`}
        >
          <FlashCardFront
            htmlNode={htmlNode}
            onFlip={() => setIsFlipped(true)}
            mode={mode}
            onNext={onNext}
          />
          <FlashCardBack uri={uri} mode={mode} onNext={onNext} />
        </Box>
      </Box>
    </Box>
  );
}

function localStorageKey(url: string) {
  return `HIDDEN-CONCEPT-${url}`;
}

function markHidden(url: string) {
  localStore?.setItem(localStorageKey(url), '1');
}

function unmarkHidden(url: string) {
  localStore?.removeItem(localStorageKey(url));
}

function isHidden(url: string) {
  return !!localStore?.getItem(localStorageKey(url));
}

export function EntryCard({
  header,
  hiddenItems,
  unhiddenItems,
  onStart,
}: {
  header: string;
  hiddenItems: FlashCardItem[];
  unhiddenItems: FlashCardItem[];
  onStart: (showHidden: boolean, mode: FlashCardMode) => void;
}) {
  const [includeHidden, setIncludeHidden] = useState(false);
  const hiddenCount = hiddenItems.length;
  const unhiddenCount = unhiddenItems.length;
  const totalCount = hiddenCount + unhiddenCount;
  return (
    <Card>
      <CardContent sx={{ backgroundColor: PRIMARY_COL, color: 'white' }}>
        <h2 style={{ textAlign: 'center' }}>{header}</h2>

        <h3 style={{ marginBottom: '0' }}>
          {includeHidden ? (
            <>{totalCount} Concepts</>
          ) : (
            <>
              {' '}
              {unhiddenItems.length} Concepts ({hiddenCount} hidden)
            </>
          )}
        </h3>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeHidden}
              onChange={(e) => setIncludeHidden(e.target.checked)}
              size="small"
              sx={{ color: SECONDARY_COL }}
              color="secondary"
            />
          }
          label="Include all concepts"
        />
        <br />
        <br />

        <Button
          onClick={() => onStart(includeHidden, FlashCardMode.REVISION_MODE)}
          variant="contained"
          sx={{ mr: '10px' }}
          color="secondary"
        >
          Revise
        </Button>
        <Button
          onClick={() => onStart(includeHidden, FlashCardMode.DRILL_MODE)}
          variant="contained"
          color="secondary"
        >
          Drill me!
        </Button>
      </CardContent>
    </Card>
  );
}

export function SummaryCard({
  rememberedItems,
  skippedItems,
  flippedItems,
  onRestart,
}: {
  rememberedItems: FlashCardItem[];
  skippedItems: FlashCardItem[];
  flippedItems: FlashCardItem[];
  onRestart: () => void;
}) {
  return (
    <Card>
      <CardContent>
        <Box>
          You remembered {rememberedItems.length} concepts, skipped{' '}
          {skippedItems.length} and flipped {flippedItems.length} cards.
          <br />
          <Button variant="contained" onClick={() => onRestart()}>
            <ArrowBackIcon />
            &nbsp;Go Back
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export function FlashCards({
  header,
  allItems,
}: {
  header: string;
  allItems: FlashCardItem[];
}) {
  const [mode, setMode] = useState(FlashCardMode.REVISION_MODE);
  const [cardType, setCardType] = useState(CardType.ENTRY_CARD);
  const [includeHidden, setIncludeHidden] = useState(false);

  const [cardNo, setCardNo] = useState(0);
  const hiddenItems = allItems.filter((item) => isHidden(item.uri));
  const unhiddenItems = allItems.filter((item) => !isHidden(item.uri));

  const [rememberedItems, setRememberedItems] = useState<FlashCardItem[]>([]);
  const [skippedItems, setSkippedItems] = useState<FlashCardItem[]>([]);
  const [flippedItems, setFlippedItems] = useState<FlashCardItem[]>([]);

  useEffect(() => {
    setRememberedItems([]);
    setSkippedItems([]);
    setFlippedItems([]);
  }, [allItems]);

  const toShowItems = includeHidden ? allItems : unhiddenItems;
  console.log(cardNo);
  console.log(toShowItems);
  const currentItem = toShowItems[cardNo];
  if (cardType === CardType.ENTRY_CARD) {
    return (
      <EntryCard
        header={header}
        hiddenItems={hiddenItems}
        unhiddenItems={unhiddenItems}
        onStart={(h: boolean, m: FlashCardMode) => {
          setIncludeHidden(h);
          setMode(m);
          setCardType(CardType.ITEM_CARD);
          setCardNo(0);
        }}
      />
    );
  }

  if (cardType === CardType.SUMMARY_CARD) {
    return (
      <SummaryCard
        rememberedItems={rememberedItems}
        skippedItems={skippedItems}
        flippedItems={flippedItems}
        onRestart={() => {
          setCardType(CardType.ENTRY_CARD);
          setRememberedItems([]);
          setSkippedItems([]);
          setFlippedItems([]);
        }}
      />
    );
  }
  return (
    <Box m="5px">
      {!isDrill(mode) ? (
        <Box m="10px 0" display="flex" justifyContent="space-between">
          <IconButton onClick={() => setCardType(CardType.ENTRY_CARD)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <IconButton
              onClick={() =>
                setCardNo(
                  (prev) => (prev + toShowItems.length - 1) % toShowItems.length
                )
              }
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              onClick={() =>
                setCardNo((prev) => (prev + 1) % toShowItems.length)
              }
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>{' '}
          <Box sx={{ m: '10px 20px', color: '#333' }}>
            <b style={{ fontSize: '18px' }}>
              {cardNo + 1} of {toShowItems.length}
            </b>
          </Box>
        </Box>
      ) : (
        <Box sx={{ m: '10px 20px', color: '#333'}}>
          <b style={{ fontSize: '18px' }}>
            {cardNo + 1} of {toShowItems.length}
          </b>
        </Box>
      )}
      <FlashCard
        uri={currentItem.uri}
        htmlNode={currentItem.htmlNode}
        mode={mode}
        onNext={(skipped: boolean, remembered: boolean) => {
          if (cardNo >= toShowItems.length - 1) {
            setCardType(CardType.SUMMARY_CARD);
          }
          if (skipped) {
            skippedItems.push(currentItem);
          } else if (remembered) {
            rememberedItems.push(currentItem);
            markHidden(currentItem.uri);
          } else {
            flippedItems.push(currentItem);
            unmarkHidden(currentItem.uri);
          }

          setCardNo((prev) => prev + 1);
        }}
      />
    </Box>
  );
}
