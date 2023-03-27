import ShuffleIcon from '@mui/icons-material/Shuffle';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  ALL_SMILEY_LEVELS,
  BloomDimension,
  getAuthHeaders,
  isLoggedIn,
  SmileyCognitiveValues,
  SmileyLevel,
  smileyToLevel,
  SMILEY_TOOLTIPS,
} from '@stex-react/api';
import { DimIcon, LevelIcon } from '@stex-react/stex-react-renderer';
import {
  PRIMARY_COL,
  SECONDARY_COL,
  stableShuffle,
  Window,
} from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import { FlashCardMode, FlashCards } from './FlashCards';

function getMarks(
  dim: BloomDimension,
  rememberValue: SmileyLevel | undefined,
  understandValue: SmileyLevel | undefined
) {
  const value =
    dim === BloomDimension.Remember ? rememberValue : understandValue;
  return ALL_SMILEY_LEVELS.map((l) => {
    return {
      value: l,
      label: (
        <LevelIcon level={l} highlighted={value === undefined || l <= value} />
      ),
    };
  });
}

export interface CardsWithSmileys {
  uri: string;
  smileys: SmileyCognitiveValues;
}
const FLASH_CARD_SCROLL_Y = 62;
function cardMeetsLevelReqs(
  card: CardsWithSmileys,
  loggedIn: boolean,
  levels: ConfiguredLevel
) {
  if (!loggedIn) return true;
  const dimsToConsider = [
    BloomDimension.Remember,
    BloomDimension.Understand,
  ].filter((dim) => levels[dim] !== undefined);
  if (!dimsToConsider.length) return true;
  return dimsToConsider.some(
    (dim) => smileyToLevel(card.smileys[dim]) <= levels[dim]
  );
}

function getChapterCounts(
  levels: ConfiguredLevel,
  loggedIn: boolean,
  cards?: CardsWithSmileys[]
): {
  chapter: string;
  totalCount: number;
  selectedCards: CardsWithSmileys[];
}[] {
  if (!cards) return [];
  const counts: {
    chapter: string;
    totalCount: number;
    selectedCards: CardsWithSmileys[];
  }[] = [];
  for (const card of cards) {
    const chapter = 'all'; // card.instances[0].chapter;

    const selected = cardMeetsLevelReqs(card, loggedIn, levels);
    const idx = counts.findIndex((v) => v.chapter === chapter);
    if (idx === -1) {
      counts.push({
        chapter,
        totalCount: 1,
        selectedCards: selected ? [card] : [],
      });
    } else {
      counts[idx].totalCount++;
      if (selected) counts[idx].selectedCards.push(card);
    }
  }
  return counts;
}

function getUpdatedConfigLevel(
  existing: ConfiguredLevel,
  dim: BloomDimension,
  newValue?: SmileyLevel
): ConfiguredLevel {
  return { ...existing, [dim]: newValue };
}

export interface ConfiguredLevel {
  Remember?: SmileyLevel;
  Understand?: SmileyLevel;
}

function LevelConfigurator({
  levels,
  setLevels,
}: {
  levels: ConfiguredLevel;
  setLevels: Dispatch<SetStateAction<ConfiguredLevel>>;
}) {
  const router = useRouter();
  const { flashCards: t } = getLocaleObject(router);
  return (
    <>
      <Tooltip title={t.chooseCompetencyHover}>
        <Typography variant="h6" style={{ textAlign: 'center' }}>
          {t.chooseCompetency}
        </Typography>
      </Tooltip>
      <i style={{ color: '#777' }}>
        {t.chooseCompetencyDetails}
      </i>
      {[BloomDimension.Remember, BloomDimension.Understand].map((dim, idx) => (
        <Box
          key={dim}
          display="flex"
          width="220px"
          m="0 auto 10px"
          alignItems="center"
          p="0 20px 20px 0"
          borderBottom={idx === 0 ? '1px solid #DDD' : undefined}
        >
          <Tooltip title={`I ${dim}. ${t.enableDisableFilter}`}>
            <IconButton
              onClick={() => {
                setLevels((prev) => {
                  const newVal = levels[dim] === undefined ? 2 : undefined;
                  return getUpdatedConfigLevel(prev, dim, newVal);
                });
              }}
            >
              <DimIcon showTitle={false} dim={dim} white={false} />
            </IconButton>
          </Tooltip>
          <Slider
            step={1}
            value={levels[dim] === undefined ? 2 : levels[dim]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => {
              return SMILEY_TOOLTIPS[dim][value];
            }}
            onChange={(_e: Event, newValue: SmileyLevel) => {
              setLevels((prev) => getUpdatedConfigLevel(prev, dim, newValue));
            }}
            marks={getMarks(dim, levels.Remember, levels.Understand)}
            min={-2}
            max={2}
            sx={{
              ml: '20px',
              filter: levels[dim] === undefined ? 'grayscale(1)' : undefined,
            }}
            disabled={levels[dim] === undefined}
          />
        </Box>
      ))}
    </>
  );
}

function CoverageConfigurator({
  chapterCounts,
  checkedChapterIdxs,
  setCheckedChapterIdxs,
  startSingleChapter,
  shuffle,
}: {
  chapterCounts: {
    chapter: string;
    totalCount: number;
    selectedCards: CardsWithSmileys[];
  }[];
  checkedChapterIdxs: number[];
  setCheckedChapterIdxs: Dispatch<SetStateAction<number[]>>;
  startSingleChapter: (chapterIdx: number, mode: FlashCardMode) => void;
  shuffle: boolean;
}) {
  const handleToggle = (value: number) => () => {
    const currentIndex = checkedChapterIdxs.indexOf(value);
    const newChecked = [...checkedChapterIdxs];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setCheckedChapterIdxs(newChecked);
  };
  const loggedIn = isLoggedIn();
  const router = useRouter();
  const { flashCards: t } = getLocaleObject(router);

  return (
    <>
      <Tooltip title={t.chooseCoverageHover}>
        <Typography variant="h6" style={{ textAlign: 'center' }}>
          {t.chooseCoverage}
        </Typography>
      </Tooltip>
      <List sx={{ bgcolor: 'background.paper' }}>
        {chapterCounts.map(({ chapter, totalCount, selectedCards }, idx) => {
          const labelId = `checkbox-list-label-${idx}`;

          return (
            <ListItem key={idx} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleToggle(idx)}
                dense
                sx={{ p: '0 0 0 10px', m: '0' }}
              >
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <Checkbox
                    edge="start"
                    checked={checkedChapterIdxs.indexOf(idx) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={
                    <Box sx={{ fontSize: '14px' }}>
                      <b style={{ display: 'block', color: PRIMARY_COL }}>
                        {chapter}
                      </b>
                      <b style={{ color: SECONDARY_COL }}>
                        {loggedIn && selectedCards.length + '/'}
                        {totalCount}&nbsp;{t.concepts}
                      </b>
                    </Box>
                  }
                />

                <Box display="flex" alignItems="center" gap="5px 10px">
                  <Button
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startSingleChapter(idx, FlashCardMode.REVISION_MODE);
                    }}
                  >
                    {t.revise}
                  </Button>
                  {loggedIn && (
                    <Button
                      size="small"
                      sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startSingleChapter(idx, FlashCardMode.DRILL_MODE);
                      }}
                    >
                      {t.drill}&nbsp;
                      {shuffle && <ShuffleIcon fontSize="small" />}
                    </Button>
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
function ReviseAndDrillButtons({
  selectedCards,
  start,
  shuffle,
  setShuffle,
}: {
  selectedCards: CardsWithSmileys[];
  start: (mode: FlashCardMode) => void;
  shuffle: boolean;
  setShuffle: (r: boolean) => void;
}) {
  const loggedIn = isLoggedIn();
  const isDisabled = selectedCards.length === 0;
  const router = useRouter();
  const { flashCards: t } = getLocaleObject(router);

  return (
    <Box textAlign={'center'} mt="20px">
      <FormControlLabel
        control={
          <Checkbox
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
          />
        }
        label={t.shuffleCards}
      />
      <Box display="flex" gap="10px" justifyContent="center" mb="5px">
        <Button
          variant="contained"
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            start(FlashCardMode.REVISION_MODE);
          }}
        >
          {t.revise}
        </Button>
        {loggedIn && (
          <Button
            variant="contained"
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              start(FlashCardMode.DRILL_MODE);
            }}
          >
            {t.drill}&nbsp;
            {shuffle && <ShuffleIcon fontSize="small" />}
          </Button>
        )}
      </Box>

      <b
        style={{
          color: SECONDARY_COL,
          textAlign: 'center',
          display: 'block',
          fontFamily: "'Roboto'",
        }}
      >
        {selectedCards.length}&nbsp;{t.cardsSelected}
      </b>
    </Box>
  );
}

function getSelectedCards(
  mode: FlashCardMode,
  shuffle: boolean,
  chapterCounts: {
    chapter: string;
    totalCount: number;
    selectedCards: CardsWithSmileys[];
  }[],
  selectedChapters: string[]
): CardsWithSmileys[] {
  const selected = chapterCounts
    .filter((chap) => selectedChapters.includes(chap.chapter))
    .map((v) => v.selectedCards)
    .flat(1);
  if (shuffle && mode === FlashCardMode.DRILL_MODE) {
    return stableShuffle(selected);
  }
  return selected;
}

export function DrillConfigurator({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { home, flashCards: t } = getLocaleObject(router);

  const [isLoading, setIsLoading] = useState(false);
  const [courseCards, setCourseCards] = useState<
    CardsWithSmileys[] | undefined
  >(undefined);

  const [levels, setLevels] = useState<ConfiguredLevel>({
    Remember: 0,
    Understand: 0,
  });
  const [checkedChapterIdxs, setCheckedChapterIdxs] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState(FlashCardMode.REVISION_MODE);
  const [shuffle, setShuffle] = useState(true);

  const loggedIn = isLoggedIn();

  const chapterCounts = getChapterCounts(levels, loggedIn, courseCards);
  const selectedChapters = checkedChapterIdxs.map(
    (idx) => chapterCounts[idx].chapter
  );
  const selectedCards = getSelectedCards(
    mode,
    shuffle,
    chapterCounts,
    selectedChapters
  );
  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    axios
      .get(`/api/get-cards-with-smileys/${courseId}`, {
        headers: getAuthHeaders(),
      })
      .then((r) => {
        setIsLoading(false);
        setCourseCards(r.data);
      });
  }, [courseId]);

  if (isLoading) return <CircularProgress />;

  if (started) {
    return (
      <FlashCards
        mode={mode}
        cards={selectedCards.map((card) => ({ uri: card.uri, instances: [] }))}
        onFinish={() => setStarted(false)}
      />
    );
  }

  return (
    <Box m="15px auto 0" maxWidth="800px">
      <Typography variant="h5" sx={{ textAlign: 'center', mb: '10px' }}>
        {t.header}
      </Typography>
      <Typography variant="body2" sx={{ color: '#777', px: '10px' }}>
        {home.cardIntro}
      </Typography>
      <br />
      <Box
        display="flex"
        gap="10px"
        flexWrap="wrap"
        justifyContent="center"
        flexDirection="row-reverse"
      >
        <Box zIndex={1} maxWidth="250px">
          {loggedIn && (
            <LevelConfigurator levels={levels} setLevels={setLevels} />
          )}
          <ReviseAndDrillButtons
            shuffle={shuffle}
            setShuffle={setShuffle}
            selectedCards={selectedCards}
            start={(mode) => {
              setMode(mode);
              setStarted(true);
              Window?.scrollTo(0, FLASH_CARD_SCROLL_Y);
            }}
          />
        </Box>
        <Box flex="1 1 400px" maxWidth="600px">
          <CoverageConfigurator
            chapterCounts={chapterCounts}
            checkedChapterIdxs={checkedChapterIdxs}
            setCheckedChapterIdxs={setCheckedChapterIdxs}
            shuffle={shuffle}
            startSingleChapter={(idx, mode) => {
              setCheckedChapterIdxs([idx]);
              setMode(mode);
              setStarted(true);
              Window?.scrollTo(0, FLASH_CARD_SCROLL_Y);
            }}
          />
        </Box>
      </Box>
      <ReviseAndDrillButtons
        shuffle={shuffle}
        setShuffle={setShuffle}
        selectedCards={selectedCards}
        start={(mode) => {
          setMode(mode);
          setStarted(true);
          Window?.scrollTo(0, FLASH_CARD_SCROLL_Y);
        }}
      />
    </Box>
  );
}
