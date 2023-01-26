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
  Typography,
} from '@mui/material';
import {
  BloomDimension,
  getUriSmileys,
  isLoggedIn,
  SmileyCognitiveValues,
  smileyToLevel,
  SmileyType,
} from '@stex-react/api';
import {
  ContentFromUrl,
  ContentWithHighlight,
  LevelIcon,
  SelfAssessment2,
} from '@stex-react/stex-react-renderer';
import {
  convertHtmlStringToPlain,
  getChildrenOfBodyNode,
  localStore,
  PRIMARY_COL,
} from '@stex-react/utils';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
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
  instances: { htmlNode: string }[];
}

export function FlashCardFooter({
  uri,
  isFront,
  onNext,
  onFlip,
}: {
  uri: string;
  isFront: boolean;
  onNext: () => void;
  onFlip: () => void;
}) {
  const loggedIn = isLoggedIn();
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      alignItems="center"
      margin="5px 15px"
    >
      {loggedIn && (
        <SelfAssessment2
          dims={[BloomDimension.Remember, BloomDimension.Understand]}
          uri={uri}
        />
      )}
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
          <Tooltip
            title={
              isFront ? 'Flip the card to see the definition!' : 'Flip it back!'
            }
          >
            <FlipCameraAndroidIcon
              fontSize="large"
              sx={{ transform: 'rotateX(30deg)' }}
            />
          </Tooltip>
        </IconButton>
        <Box minWidth="72px">
          <Button onClick={() => onNext()} size="small" variant="contained">
            Next
            <NavigateNextIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
function dedupNodes(nodes: string[]) {
  if(nodes.length<=1) return nodes;
  const texts = nodes.map((n) => convertHtmlStringToPlain(n).toLowerCase());
  const selectedIdxs = [];
  for(const [idx, textA] of texts.entries()) {
    let dup = false;
    for(let i=0;i<idx;i++) {
      if(textA===texts[i]){
        dup= true;
        break;
      }
    }
    if(!dup) selectedIdxs.push(idx);
  }
  return selectedIdxs.map(idx=>nodes[idx]);
}

function FlashCardFront({
  uri,
  htmlNodes,
  onNext,
  onFlip,
}: {
  uri: string;
  htmlNodes: string[];
  onNext: () => void;
  onFlip: () => void;
}) {
  const synonyms = dedupNodes(htmlNodes);
  return (
    <Box className={styles['front']}>
      &nbsp;
      <Box
        sx={{
          width: 'max-content',
          m: '0 auto',
          textAlign: 'center',
          maxWidth: '100%'
        }}
      >
        {synonyms.map((htmlNode, idx) => (
          <>
            <Box
              key={idx}
              sx={{
                '& *': { fontSize: `${idx === 0 ? 32 : 20}px !important` },
              }}
            >
              <ContentWithHighlight mmtHtml={htmlNode} />
            </Box>
            {idx === 0 && synonyms.length > 1 && (
              <Typography fontSize="12px" my="5px" color="gray">
                a.k.a.
              </Typography>
            )}
          </>
        ))}
      </Box>
      <FlashCardFooter
        uri={uri}
        onFlip={onFlip}
        onNext={onNext}
        isFront={true}
      />
    </Box>
  );
}

function FlashCardBack({
  uri,
  onNext,
  onFlip,
}: {
  uri: string;
  onNext: () => void;
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
        onFlip={onFlip}
        onNext={onNext}
        isFront={false}
      />
    </Box>
  );
}

function FlashCard({
  uri,
  htmlNodes,
  mode,
  defaultFlipped,
  onNext,
  onPrev,
}: {
  uri: string;
  htmlNodes: string[];
  mode: FlashCardMode;
  defaultFlipped: boolean;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(defaultFlipped);
  useEffect(() => {
    setIsFlipped(defaultFlipped);
  }, [uri]);

  const handlers = useSwipeable({
    onSwipedDown: (e) => setIsFlipped((prev) => !prev),
    onSwipedUp: (e) => setIsFlipped((prev) => !prev),
    onSwipedLeft: (e) => onNext(),
    onSwipedRight: (e) => {
      if (!isDrill(mode)) onPrev();
    },
    delta: 50,
    preventScrollOnSwipe: true,
  });

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
        {...handlers}
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
              htmlNodes={htmlNodes}
              onFlip={() => setIsFlipped(true)}
              onNext={onNext}
            />
            <FlashCardBack
              uri={uri}
              onNext={onNext}
              onFlip={() => setIsFlipped(false)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function filterItems(
  items: FlashCardItem[],
  uriMap: Map<string, SmileyCognitiveValues>,
  rememberValues: SmileyType[],
  understandValues: SmileyType[]
) {
  console.log(uriMap);
  return items.filter((item) => {
    const smileyVal = uriMap.get(item.uri);
    console.log(item);
    console.log(smileyVal);
    console.log(rememberValues);
    console.log(understandValues);
    return (
      rememberValues.includes(smileyVal?.Remember) &&
      understandValues.includes(smileyVal?.Understand)
    );
  });
}
const GOOD_SMILEYS: SmileyType[] = ['smiley1', 'smiley2'];
const NOT_GOOD_SMILEYS: SmileyType[] = ['smiley-2', 'smiley-1', 'smiley0'];

export function ItemListWithStatus({
  items,
  uriMap,
}: {
  items: FlashCardItem[];
  uriMap: Map<string, SmileyCognitiveValues>;
}) {
  return (
    <table style={{ marginBottom: '20px' }}>
      <tr style={{ color: PRIMARY_COL }}>
        <th>Concept</th>
        <th>Remember</th>
        <th>Understand</th>
      </tr>
      {items.map((item) => {
        const smileyLevel = uriMap.get(item.uri);
        const rememberLevel = smileyToLevel(smileyLevel.Remember);
        const understandLevel = smileyToLevel(smileyLevel.Understand);
        return (
          <tr key={item.uri}>
            <td>
              <Box mr="10px">
                <ContentWithHighlight mmtHtml={item.instances[0].htmlNode} />
              </Box>
            </td>
            <td>
              <Box m="auto" textAlign="center">
                <LevelIcon level={rememberLevel} highlighted={true} />
              </Box>
            </td>
            <td>
              <Box m="auto" textAlign="center">
                <LevelIcon level={understandLevel} highlighted={true} />
              </Box>
            </td>
          </tr>
        );
      })}
    </table>
  );
}

export function SummaryCard({
  items,
  onFinish,
}: {
  items: FlashCardItem[];
  onFinish: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const uriMap = useRef(new Map<string, SmileyCognitiveValues>()).current;
  useEffect(() => {
    getUriSmileys(items.map((item) => item.uri)).then((uriSmileys) => {
      setIsLoading(false);
      for (const [idx, item] of items.entries()) {
        uriMap.set(item.uri, uriSmileys[idx]);
      }
      console.log(uriSmileys);
      console.log(uriMap);
      forceRerender();
    });
  }, [items]);

  const rememberAndUnderstand = filterItems(
    items,
    uriMap,
    GOOD_SMILEYS,
    GOOD_SMILEYS
  );
  const rememberNotUnderstand = filterItems(
    items,
    uriMap,
    GOOD_SMILEYS,
    NOT_GOOD_SMILEYS
  );
  const notRememberButUnderstand = filterItems(
    items,
    uriMap,
    NOT_GOOD_SMILEYS,
    GOOD_SMILEYS
  );
  const notRememberNotUnderstand = filterItems(
    items,
    uriMap,
    NOT_GOOD_SMILEYS,
    NOT_GOOD_SMILEYS
  );
  return (
    <Card>
      <CardContent sx={{ mx: '10px' }}>
        <Box>
          <Button variant="contained" onClick={() => onFinish()}>
            <ArrowBackIcon />
            &nbsp;Go Back
          </Button>
          <Box m="20px 0">
            <Typography variant="h6">
              You recalled{' '}
              <b>
                {rememberAndUnderstand.length + rememberNotUnderstand.length}
              </b>{' '}
              and understoood{' '}
              <b>
                {rememberAndUnderstand.length + notRememberButUnderstand.length}
              </b>{' '}
              out of <b>{items.length}</b> concepts.
            </Typography>
          </Box>
          {notRememberNotUnderstand.length > 0 && (
            <>
              <Typography variant="h5">
                Concepts neither remembered nor understood
              </Typography>
              <ItemListWithStatus
                items={notRememberNotUnderstand}
                uriMap={uriMap}
              />
            </>
          )}
          {rememberNotUnderstand.length > 0 && (
            <>
              <Typography variant="h5">
                Concepts remembered but not understood
              </Typography>
              <ItemListWithStatus
                items={rememberNotUnderstand}
                uriMap={uriMap}
              />
            </>
          )}
          {notRememberButUnderstand.length > 0 && (
            <>
              <Typography variant="h5">
                Concepts understood but not remembered
              </Typography>
              <ItemListWithStatus
                items={notRememberButUnderstand}
                uriMap={uriMap}
              />
            </>
          )}
          {rememberAndUnderstand.length > 0 && (
            <>
              <Typography variant="h5">
                Concepts remembered and understood
              </Typography>
              <ItemListWithStatus
                items={rememberAndUnderstand}
                uriMap={uriMap}
              />
            </>
          )}
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

  const [defaultFlipped, setDefaultSkipped] = useState(
    !!localStore?.getItem('default-flipped')
  );

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
    return <SummaryCard items={items} onFinish={() => onCancelOrFinish()} />;
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
        htmlNodes={currentItem.instances.map((i) => i.htmlNode)}
        mode={mode}
        defaultFlipped={defaultFlipped && !isDrill(mode)}
        onNext={() => {
          if (cardNo >= items.length - 1 && isDrill(mode)) {
            setCardType(CardType.SUMMARY_CARD);
          }
          setCardNo((prev) => (prev + 1) % items.length);
        }}
        onPrev={() =>
          setCardNo((prev) => (prev + items.length - 1) % items.length)
        }
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
